import {
  createStoredDataSchemaObject,
  getElectroCraftFieldRegistryEntry,
  type StoredProjectDefinition,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  type ElectroCraftDataField,
  type ElectroCraftDataFieldType,
  type ElectroCraftDataModel,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
  type JsonValue,
} from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

export type DataModelWorkspaceState = 'initial' | 'loading' | 'ready' | 'saving' | 'error';

export interface DataModelWorkspaceSnapshot {
  readonly state: DataModelWorkspaceState;
  readonly project: StoredProjectDefinition | null;
  readonly source: ElectroCraftDataSourceDefinition | null;
  readonly schema: ElectroCraftDataSchema | null;
  readonly models: readonly ElectroCraftDataModel[];
  readonly selectedModelId: string | null;
  readonly message: string;
}

export interface DataFieldImpact {
  readonly modelId: string;
  readonly fieldId: string;
  readonly fieldKey: string;
  readonly recordCount: number;
  readonly populatedCount: number;
}

export interface CreateFieldInput {
  readonly label: string;
  readonly type: ElectroCraftDataFieldType;
  readonly relationModelRef?: string | null;
}

const listeners = new Set<() => void>();
let loadPromise: Promise<DataModelWorkspaceSnapshot> | null = null;
let snapshot: DataModelWorkspaceSnapshot = Object.freeze({
  state: 'initial',
  project: null,
  source: null,
  schema: null,
  models: Object.freeze([]),
  selectedModelId: null,
  message: 'Modelos pendientes de carga.',
});

function publish(next: DataModelWorkspaceSnapshot) {
  snapshot = Object.freeze({ ...next, models: Object.freeze([...next.models]) });
  for (const listener of listeners) listener();
  return snapshot;
}

function normalizeKey(value: string, fallback: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const candidate = /^[A-Za-z]/.test(normalized) ? normalized : `${fallback}-${normalized || 'item'}`;
  return candidate.slice(0, 80);
}

function selectedModel(models: readonly ElectroCraftDataModel[], modelId: string | null) {
  return models.find(({ id }) => id === modelId) ?? models[0] ?? null;
}

async function loadWorkspace(): Promise<DataModelWorkspaceSnapshot> {
  publish({ ...snapshot, state: 'loading', message: 'Cargando modelos…' });
  await projectStorageRuntime.initialize();
  await dataSourceWorkspaceRuntime.load();
  const sourceState = dataSourceWorkspaceRuntime.getSnapshot();
  const projectId = projectStorageRuntime.currentProjectId();
  const source =
    sourceState.sources.find(({ kind, adapterId }) => kind === 'internal' && adapterId === 'internal.pglite') ?? null;

  if (!projectId || !sourceState.project) {
    return publish({
      state: 'ready',
      project: null,
      source: null,
      schema: null,
      models: [],
      selectedModelId: null,
      message: 'Abre un proyecto para editar sus modelos.',
    });
  }
  if (!source) {
    return publish({
      state: 'ready',
      project: sourceState.project,
      source: null,
      schema: null,
      models: [],
      selectedModelId: null,
      message: 'Crea ElectroCraft Data en Fuentes de datos antes de definir modelos.',
    });
  }

  const opened = await projectStorageRuntime.openProject(projectId);
  if (!opened) throw new Error('El proyecto activo ya no está disponible.');
  const schemas = opened.objects
    .filter(({ kind }) => kind === 'data-schema')
    .flatMap(({ payload }) => {
      const parsed = electroCraftDataSchemaSchema.safeParse(payload);
      return parsed.success && parsed.data.sourceRef === source.id ? [parsed.data] : [];
    })
    .sort((left, right) => right.version - left.version);
  const schema = schemas[0] ?? null;
  const models = schema?.models ?? [];
  const selected = selectedModel(models, snapshot.selectedModelId);
  return publish({
    state: 'ready',
    project: opened.project,
    source,
    schema,
    models,
    selectedModelId: selected?.id ?? null,
    message: models.length ? `${models.length} modelo(s) cargado(s).` : 'Todavía no hay modelos internos.',
  });
}

async function persistSchema(nextSchema: ElectroCraftDataSchema, selectedModelId: string, message: string) {
  const current = snapshot;
  if (!current.project || !current.source)
    throw new Error('ElectroCraft Data no está disponible en el proyecto activo.');
  const parsed = electroCraftDataSchemaSchema.parse(nextSchema);
  publish({ ...current, state: 'saving', message: 'Guardando modelo…' });
  try {
    projectStorageRuntime.queueAutosave({
      project: current.project,
      dirtyObjects: [createStoredDataSchemaObject(parsed)],
    });
    await projectStorageRuntime.flushAutosave();
    await loadWorkspace();
    const selected = parsed.models.find(({ id }) => id === selectedModelId) ?? parsed.models[0] ?? null;
    return publish({ ...snapshot, selectedModelId: selected?.id ?? null, message });
  } catch (error) {
    publish({
      ...current,
      state: 'error',
      message: error instanceof Error ? error.message : 'No se pudo guardar el modelo.',
    });
    throw error;
  }
}

function replaceModel(schema: ElectroCraftDataSchema, nextModel: ElectroCraftDataModel) {
  return electroCraftDataSchemaSchema.parse({
    ...schema,
    version: schema.version + 1,
    models: schema.models.map((model) => (model.id === nextModel.id ? nextModel : model)),
  });
}

function createDefaultField(seed: string): ElectroCraftDataField {
  return electroCraftDataFieldSchema.parse({
    id: createDeterministicObjectId('data-field', seed),
    key: 'name',
    label: 'Nombre',
    type: 'text',
    nullable: false,
    indexed: false,
    faceted: false,
    relationModelRef: null,
    help: 'Nombre principal del registro.',
    required: true,
    metadata: { storageHint: 'scalar', fieldFamily: 'text' },
  });
}

async function queryFieldImpact(
  source: ElectroCraftDataSourceDefinition,
  model: ElectroCraftDataModel,
  field: ElectroCraftDataField,
): Promise<DataFieldImpact> {
  let offset = 0;
  let recordCount = 0;
  let populatedCount = 0;
  const pageSize = 200;

  for (;;) {
    const result = await dataSourceWorkspaceRuntime.query(source, 'development', model.id, {
      offset,
      limit: pageSize,
    });
    if (!result || Array.isArray(result) || typeof result !== 'object')
      throw new Error('Respuesta de registros inválida.');
    const candidate = result as Record<string, JsonValue>;
    const rows = Array.isArray(candidate.rows) ? candidate.rows : [];
    const total = typeof candidate.total === 'number' ? candidate.total : rows.length;
    recordCount = total;
    for (const row of rows) {
      if (!row || Array.isArray(row) || typeof row !== 'object') continue;
      const record = row as Record<string, JsonValue>;
      const data = record.data;
      if (!data || Array.isArray(data) || typeof data !== 'object') continue;
      const object = data as Record<string, JsonValue>;
      if (
        Object.prototype.hasOwnProperty.call(object, field.key) &&
        object[field.key] !== null &&
        object[field.key] !== ''
      ) {
        populatedCount += 1;
      }
    }
    offset += rows.length;
    if (rows.length === 0 || offset >= total) break;
  }

  return Object.freeze({ modelId: model.id, fieldId: field.id, fieldKey: field.key, recordCount, populatedCount });
}

export const dataModelWorkspaceRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  load() {
    if (!loadPromise) {
      loadPromise = loadWorkspace()
        .catch((error: unknown) => {
          publish({
            ...snapshot,
            state: 'error',
            message: error instanceof Error ? error.message : 'No se pudieron cargar los modelos.',
          });
          throw error;
        })
        .finally(() => {
          loadPromise = null;
        });
    }
    return loadPromise;
  },
  selectModel(modelId: string) {
    const model = snapshot.models.find(({ id }) => id === modelId);
    if (!model) return snapshot;
    return publish({ ...snapshot, selectedModelId: model.id });
  },
  async createModel(labelInput = 'Nuevo modelo') {
    const current = snapshot;
    if (!current.project || !current.source) throw new Error('Crea ElectroCraft Data antes de crear un modelo.');
    const seed = globalThis.crypto.randomUUID();
    const label = labelInput.trim() || 'Nuevo modelo';
    const model = electroCraftDataModelSchema.parse({
      id: createDeterministicObjectId('data-model', seed),
      key: normalizeKey(label, 'model'),
      label,
      singularLabel: label,
      pluralLabel: `${label}s`,
      description: '',
      icon: 'database',
      visibility: 'internal',
      singleton: false,
      menuVisible: true,
      capabilityRefs: [],
      fields: [createDefaultField(`${seed}:name`)],
      metadata: {},
    });
    const schema = current.schema
      ? electroCraftDataSchemaSchema.parse({
          ...current.schema,
          version: current.schema.version + 1,
          models: [...current.schema.models, model],
        })
      : electroCraftDataSchemaSchema.parse({
          schemaVersion: 1,
          id: createDeterministicObjectId('data-schema', `${seed}:schema`),
          version: 1,
          sourceRef: current.source.id,
          name: 'ElectroCraft Data',
          models: [model],
          metadata: { owner: 'PGlite generic content store' },
        });
    await persistSchema(schema, model.id, `Modelo ${model.label} creado.`);
    return model;
  },
  async updateModelIdentity(modelId: string, patch: Partial<Omit<ElectroCraftDataModel, 'id' | 'fields'>>) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    if (!model) throw new Error('Modelo no encontrado.');
    const nextModel = electroCraftDataModelSchema.parse({ ...model, ...patch, id: model.id, fields: model.fields });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, `Modelo ${nextModel.label} actualizado.`);
    return nextModel;
  },
  async addField(modelId: string, input: CreateFieldInput) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    if (!model) throw new Error('Modelo no encontrado.');
    const descriptor = getElectroCraftFieldRegistryEntry(input.type);
    const seed = globalThis.crypto.randomUUID();
    const label = input.label.trim() || descriptor.label;
    const relationModelRef = input.type === 'relation' ? (input.relationModelRef ?? model.id) : null;
    const nextField = electroCraftDataFieldSchema.parse({
      id: createDeterministicObjectId('data-field', seed),
      key: normalizeKey(label, 'field'),
      label,
      type: input.type,
      nullable: true,
      indexed: false,
      faceted: false,
      relationModelRef,
      required: false,
      ...(descriptor.supportsOptions ? { options: [] } : {}),
      metadata: {
        storageHint: descriptor.storageHint,
        fieldFamily: descriptor.family,
        ...(descriptor.advancedOwner ? { advancedOwner: descriptor.advancedOwner } : {}),
      },
    });
    const nextModel = electroCraftDataModelSchema.parse({ ...model, fields: [...model.fields, nextField] });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, `Campo ${nextField.label} añadido.`);
    return nextField;
  },
  async fieldImpact(modelId: string, fieldId: string) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    const model = current.models.find(({ id }) => id === modelId);
    const field = model?.fields.find(({ id }) => id === fieldId);
    if (!model || !field) throw new Error('Campo no encontrado.');
    return queryFieldImpact(current.source, model, field);
  },
  async updateField(
    modelId: string,
    fieldId: string,
    patch: Partial<Omit<ElectroCraftDataField, 'id'>>,
    confirmDataImpact = false,
  ) {
    const current = snapshot;
    if (!current.schema || !current.source) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    const field = model?.fields.find(({ id }) => id === fieldId);
    if (!model || !field) throw new Error('Campo no encontrado.');
    if (typeof patch.key === 'string' && patch.key !== field.key && !confirmDataImpact) {
      const impact = await queryFieldImpact(current.source, model, field);
      if (impact.populatedCount > 0) throw new Error(`FIELD_RENAME_IMPACT:${impact.populatedCount}`);
    }
    const nextField = electroCraftDataFieldSchema.parse({ ...field, ...patch, id: field.id });
    const nextModel = electroCraftDataModelSchema.parse({
      ...model,
      fields: model.fields.map((candidate) => (candidate.id === field.id ? nextField : candidate)),
    });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, `Campo ${nextField.label} actualizado.`);
    return nextField;
  },
  async deleteField(modelId: string, fieldId: string, confirmDataImpact = false) {
    const current = snapshot;
    if (!current.schema || !current.source) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    const field = model?.fields.find(({ id }) => id === fieldId);
    if (!model || !field) throw new Error('Campo no encontrado.');
    if (model.fields.length <= 1) throw new Error('El modelo debe conservar al menos un campo.');
    const impact = await queryFieldImpact(current.source, model, field);
    if (impact.populatedCount > 0 && !confirmDataImpact)
      throw new Error(`FIELD_DELETE_IMPACT:${impact.populatedCount}`);
    const nextModel = electroCraftDataModelSchema.parse({
      ...model,
      fields: model.fields.filter(({ id }) => id !== field.id),
    });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, `Campo ${field.label} eliminado.`);
    return impact;
  },
});
