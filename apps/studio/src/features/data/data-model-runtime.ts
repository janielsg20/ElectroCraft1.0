import {
  createStoredDataSchemaObject,
  getElectroCraftFieldRegistryEntry,
  type StoredProjectDefinition,
} from '@electrocraft/application';
import {
  assertElectroCraftAdvancedFieldModel,
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroRelationEdgeSchema,
  electroRelationSchema,
  electroTaxonomySchema,
  electroTaxonomyTermSchema,
  readElectroCraftAdvancedFieldMetadata,
  relationResourceId,
  taxonomyResourceId,
  type ElectroCraftAdvancedFieldMetadata,
  type ElectroCraftDataField,
  type ElectroCraftDataFieldType,
  type ElectroCraftDataModel,
  type ElectroCraftObjectId,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
  type ElectroRelation,
  type ElectroRelationCardinality,
  type ElectroRelationDeleteBehavior,
  type ElectroRelationEdge,
  type ElectroTaxonomy,
  type ElectroTaxonomyTerm,
  type JsonValue,
} from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import {
  createAdvancedMetadataForField,
  modelCapabilityRefsForFields,
  moveFieldWithinScope,
  withAdvancedFieldMetadata,
} from './advanced-field-model';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

export type DataModelWorkspaceState = 'initial' | 'loading' | 'ready' | 'saving' | 'error';

export interface DataModelWorkspaceSnapshot {
  readonly state: DataModelWorkspaceState;
  readonly project: StoredProjectDefinition | null;
  readonly source: ElectroCraftDataSourceDefinition | null;
  readonly schema: ElectroCraftDataSchema | null;
  readonly models: readonly ElectroCraftDataModel[];
  readonly taxonomies: readonly ElectroTaxonomy[];
  readonly relations: readonly ElectroRelation[];
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

export interface DataRecordOption {
  readonly id: string;
  readonly label: string;
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
  taxonomies: Object.freeze([]),
  relations: Object.freeze([]),
  selectedModelId: null,
  message: 'Modelos pendientes de carga.',
});

function publish(next: DataModelWorkspaceSnapshot) {
  snapshot = Object.freeze({
    ...next,
    models: Object.freeze([...next.models]),
    taxonomies: Object.freeze([...next.taxonomies]),
    relations: Object.freeze([...next.relations]),
  });
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
      taxonomies: [],
      relations: [],
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
      taxonomies: [],
      relations: [],
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
    taxonomies: schema?.taxonomies ?? [],
    relations: schema?.relations ?? [],
    selectedModelId: selected?.id ?? null,
    message: models.length ? `${models.length} modelo(s) cargado(s).` : 'Todavía no hay modelos internos.',
  });
}

async function persistSchema(nextSchema: ElectroCraftDataSchema, selectedModelId: string, message: string) {
  const current = snapshot;
  if (!current.project || !current.source)
    throw new Error('ElectroCraft Data no está disponible en el proyecto activo.');
  for (const model of nextSchema.models) assertElectroCraftAdvancedFieldModel(model);
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
    metadata: {
      storageHint: 'scalar',
      fieldFamily: 'text',
      advancedField: { parentFieldRef: null, order: 0 },
    },
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

async function queryTaxonomyTerms(taxonomyId: string): Promise<readonly ElectroTaxonomyTerm[]> {
  const current = snapshot;
  if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
  const result = await dataSourceWorkspaceRuntime.registry.query(current.source, 'development', {
    resourceId: taxonomyResourceId(taxonomyId),
  });
  const parsed = electroTaxonomyTermSchema.array().safeParse(result);
  if (!parsed.success) throw new Error('La respuesta de términos no es válida.');
  return Object.freeze(parsed.data);
}

async function queryRelationEdges(relationId: string): Promise<readonly ElectroRelationEdge[]> {
  const current = snapshot;
  if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
  const result = await dataSourceWorkspaceRuntime.registry.query(current.source, 'development', {
    resourceId: relationResourceId(relationId),
  });
  const parsed = electroRelationEdgeSchema.array().safeParse(result);
  if (!parsed.success) throw new Error('La respuesta de vínculos de relación no es válida.');
  return Object.freeze(parsed.data);
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
  async createTaxonomy(modelId: string, labelInput = 'Nueva taxonomía') {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    if (!model) throw new Error('Modelo no encontrado.');
    const seed = globalThis.crypto.randomUUID();
    const label = labelInput.trim() || 'Nueva taxonomía';
    const taxonomy = electroTaxonomySchema.parse({
      id: createDeterministicObjectId('taxonomy', seed),
      key: normalizeKey(label, 'taxonomy'),
      label,
      singularLabel: label,
      pluralLabel: `${label}s`,
      description: '',
      hierarchical: true,
      modelRefs: [model.id],
      templateRefs: [],
      metadata: { owner: 'PGlite generic content store' },
    });
    const nextModels = current.schema.models.map((candidate) =>
      candidate.id === model.id
        ? electroCraftDataModelSchema.parse({
            ...candidate,
            capabilityRefs: [...new Set([...(candidate.capabilityRefs ?? []), 'data.taxonomies'])],
          })
        : candidate,
    );
    const nextSchema = electroCraftDataSchemaSchema.parse({
      ...current.schema,
      version: current.schema.version + 1,
      models: nextModels,
      taxonomies: [...(current.schema.taxonomies ?? []), taxonomy],
    });
    await persistSchema(nextSchema, model.id, `Taxonomía ${taxonomy.label} creada.`);
    return taxonomy;
  },
  async updateTaxonomy(taxonomyId: string, patch: Partial<Omit<ElectroTaxonomy, 'id'>>) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const taxonomy = (current.schema.taxonomies ?? []).find(({ id }) => id === taxonomyId);
    if (!taxonomy) throw new Error('Taxonomía no encontrada.');
    if (taxonomy.hierarchical && patch.hierarchical === false) {
      const terms = await queryTaxonomyTerms(taxonomy.id);
      if (terms.some(({ parentId }) => parentId !== null)) {
        throw new Error('Mueve los términos hijos a la raíz antes de desactivar la jerarquía.');
      }
    }
    const nextTaxonomy = electroTaxonomySchema.parse({ ...taxonomy, ...patch, id: taxonomy.id });
    const nextSchema = electroCraftDataSchemaSchema.parse({
      ...current.schema,
      version: current.schema.version + 1,
      taxonomies: (current.schema.taxonomies ?? []).map((candidate) =>
        candidate.id === taxonomy.id ? nextTaxonomy : candidate,
      ),
    });
    await persistSchema(
      nextSchema,
      nextTaxonomy.modelRefs[0] ?? current.selectedModelId ?? '',
      'Taxonomía actualizada.',
    );
    return nextTaxonomy;
  },
  async deleteTaxonomy(taxonomyId: string) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const taxonomy = (current.schema.taxonomies ?? []).find(({ id }) => id === taxonomyId);
    if (!taxonomy) throw new Error('Taxonomía no encontrada.');
    if (current.schema.models.some((model) => model.fields.some((field) => field.taxonomyRef === taxonomy.id))) {
      throw new Error('Desvincula primero los campos que usan esta taxonomía.');
    }
    const terms = await queryTaxonomyTerms(taxonomy.id);
    if (terms.length > 0) throw new Error('Elimina primero los términos de esta taxonomía.');
    const nextModels = current.schema.models.map((model) => {
      const stillAttached = (current.schema!.taxonomies ?? []).some(
        (candidate) => candidate.id !== taxonomy.id && candidate.modelRefs.includes(model.id),
      );
      return electroCraftDataModelSchema.parse({
        ...model,
        capabilityRefs: stillAttached
          ? model.capabilityRefs
          : (model.capabilityRefs ?? []).filter((ref) => ref !== 'data.taxonomies'),
      });
    });
    const nextSchema = electroCraftDataSchemaSchema.parse({
      ...current.schema,
      version: current.schema.version + 1,
      models: nextModels,
      taxonomies: (current.schema.taxonomies ?? []).filter(({ id }) => id !== taxonomy.id),
    });
    await persistSchema(nextSchema, current.selectedModelId ?? nextModels[0]?.id ?? '', 'Taxonomía eliminada.');
  },
  async listTaxonomyTerms(taxonomyId: string): Promise<readonly ElectroTaxonomyTerm[]> {
    return queryTaxonomyTerms(taxonomyId);
  },
  async createTaxonomyTerm(taxonomyId: string, input: { name: string; slug: string; parentId?: string | null }) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    return dataSourceWorkspaceRuntime.registry.mutate(current.source, 'development', {
      resourceId: taxonomyResourceId(taxonomyId),
      operation: 'create',
      input: { ...input, id: createDeterministicObjectId('taxonomy-term', globalThis.crypto.randomUUID()) },
    });
  },
  async updateTaxonomyTerm(
    taxonomyId: string,
    term: Omit<ElectroTaxonomyTerm, 'parentId'> & { readonly parentId: string | null },
  ) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    return dataSourceWorkspaceRuntime.registry.mutate(current.source, 'development', {
      resourceId: taxonomyResourceId(taxonomyId),
      operation: 'update',
      input: term as unknown as JsonValue,
    });
  },
  async deleteTaxonomyTerm(taxonomyId: string, termId: string) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    return dataSourceWorkspaceRuntime.registry.mutate(current.source, 'development', {
      resourceId: taxonomyResourceId(taxonomyId),
      operation: 'delete',
      input: { id: termId },
    });
  },
  async createRelation(modelId: string, labelInput = 'Nueva relación') {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    if (!model) throw new Error('Modelo no encontrado.');
    const target = current.schema.models.find(({ id }) => id !== model.id) ?? model;
    const seed = globalThis.crypto.randomUUID();
    const label = labelInput.trim() || 'Nueva relación';
    const relation = electroRelationSchema.parse({
      id: createDeterministicObjectId('relation', seed),
      key: normalizeKey(label, 'relation'),
      label,
      sourceModelRef: model.id,
      targetModelRef: target.id,
      cardinality: 'one-to-many',
      deleteBehavior: 'restrict',
      metadata: { owner: 'PGlite generic content store' },
    });
    const nextModels = current.schema.models.map((candidate) =>
      candidate.id === model.id
        ? electroCraftDataModelSchema.parse({
            ...candidate,
            capabilityRefs: [...new Set([...(candidate.capabilityRefs ?? []), 'data.relations'])],
          })
        : candidate,
    );
    const nextSchema = electroCraftDataSchemaSchema.parse({
      ...current.schema,
      version: current.schema.version + 1,
      models: nextModels,
      relations: [...(current.schema.relations ?? []), relation],
    });
    await persistSchema(nextSchema, model.id, `Relación ${relation.label} creada.`);
    return relation;
  },
  async updateRelation(
    relationId: string,
    patch: Partial<Omit<ElectroRelation, 'id' | 'sourceModelRef'>> & {
      readonly cardinality?: ElectroRelationCardinality;
      readonly deleteBehavior?: ElectroRelationDeleteBehavior;
    },
  ) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const relation = (current.schema.relations ?? []).find(({ id }) => id === relationId);
    if (!relation) throw new Error('Relación no encontrada.');
    const edges = await queryRelationEdges(relation.id);
    if (edges.length > 0 && (patch.targetModelRef ?? relation.targetModelRef) !== relation.targetModelRef) {
      throw new Error('Elimina los vínculos existentes antes de cambiar el modelo de destino.');
    }
    if (edges.length > 0 && patch.cardinality !== undefined && patch.cardinality !== relation.cardinality) {
      throw new Error('Elimina los vínculos existentes antes de cambiar la cardinalidad.');
    }
    const nextRelation = electroRelationSchema.parse({ ...relation, ...patch, id: relation.id });
    const nextSchema = electroCraftDataSchemaSchema.parse({
      ...current.schema,
      version: current.schema.version + 1,
      relations: (current.schema.relations ?? []).map((candidate) =>
        candidate.id === relation.id ? nextRelation : candidate,
      ),
    });
    await persistSchema(nextSchema, relation.sourceModelRef, `Relación ${nextRelation.label} actualizada.`);
    return nextRelation;
  },
  async deleteRelation(relationId: string) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const relation = (current.schema.relations ?? []).find(({ id }) => id === relationId);
    if (!relation) throw new Error('Relación no encontrada.');
    if (current.schema.models.some((model) => model.fields.some((field) => field.relationRef === relation.id))) {
      throw new Error('Desvincula primero los campos que usan esta relación.');
    }
    const edges = await queryRelationEdges(relation.id);
    if (edges.length > 0) throw new Error('Elimina primero los vínculos de esta relación.');
    const nextModels = current.schema.models.map((model) => {
      const stillSource = (current.schema!.relations ?? []).some(
        (candidate) => candidate.id !== relation.id && candidate.sourceModelRef === model.id,
      );
      return electroCraftDataModelSchema.parse({
        ...model,
        capabilityRefs: stillSource
          ? model.capabilityRefs
          : (model.capabilityRefs ?? []).filter((ref) => ref !== 'data.relations'),
      });
    });
    const nextSchema = electroCraftDataSchemaSchema.parse({
      ...current.schema,
      version: current.schema.version + 1,
      models: nextModels,
      relations: (current.schema.relations ?? []).filter(({ id }) => id !== relation.id),
    });
    await persistSchema(nextSchema, relation.sourceModelRef, 'Relación eliminada.');
  },
  async listRelationEdges(relationId: string) {
    return queryRelationEdges(relationId);
  },
  async createRelationEdge(relationId: string, fromRecordId: string, toRecordId: string) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    return dataSourceWorkspaceRuntime.registry.mutate(current.source, 'development', {
      resourceId: relationResourceId(relationId),
      operation: 'create',
      input: {
        id: globalThis.crypto.randomUUID(),
        fromRecordId,
        toRecordId,
        payload: {},
      },
    });
  },
  async updateRelationEdge(edge: ElectroRelationEdge, fromRecordId: string, toRecordId: string) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    return dataSourceWorkspaceRuntime.registry.mutate(current.source, 'development', {
      resourceId: relationResourceId(edge.relationRef),
      operation: 'update',
      input: { id: edge.id, fromRecordId, toRecordId, payload: edge.payload },
    });
  },
  async deleteRelationEdge(relationId: string, edgeId: string) {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    return dataSourceWorkspaceRuntime.registry.mutate(current.source, 'development', {
      resourceId: relationResourceId(relationId),
      operation: 'delete',
      input: { id: edgeId },
    });
  },
  async listRecordOptions(modelId: string): Promise<readonly DataRecordOption[]> {
    const current = snapshot;
    if (!current.source) throw new Error('ElectroCraft Data no está disponible.');
    const result = await dataSourceWorkspaceRuntime.registry.query(current.source, 'development', {
      resourceId: modelId,
      input: { offset: 0, limit: 200 },
    });
    if (!result || Array.isArray(result) || typeof result !== 'object') return Object.freeze([]);
    const rows = Array.isArray((result as Record<string, JsonValue>).rows)
      ? ((result as Record<string, JsonValue>).rows as JsonValue[])
      : [];
    return Object.freeze(
      rows.flatMap((row) => {
        if (!row || Array.isArray(row) || typeof row !== 'object') return [];
        const record = row as Record<string, JsonValue>;
        if (typeof record.id !== 'string') return [];
        const data =
          record.data && !Array.isArray(record.data) && typeof record.data === 'object'
            ? (record.data as Record<string, JsonValue>)
            : {};
        const preferred = [data.name, data.title, data.label].find(
          (value) => typeof value === 'string' && value.trim(),
        );
        return [{ id: record.id, label: typeof preferred === 'string' ? preferred : record.id }];
      }),
    );
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
    const advancedField = createAdvancedMetadataForField(model, input.type, { order: model.fields.length });
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
        advancedField: advancedField as unknown as JsonValue,
        ...(descriptor.advancedOwner ? { advancedOwner: descriptor.advancedOwner } : {}),
      },
    });
    const fields = [...model.fields, nextField];
    const nextModel = electroCraftDataModelSchema.parse({
      ...model,
      capabilityRefs: modelCapabilityRefsForFields(model, fields),
      fields,
    });
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
    const parsedField = electroCraftDataFieldSchema.parse({ ...field, ...patch, id: field.id });
    const nextField = withAdvancedFieldMetadata(model, parsedField, parsedField.type);
    const fields = model.fields.map((candidate) => (candidate.id === field.id ? nextField : candidate));
    const nextModel = electroCraftDataModelSchema.parse({
      ...model,
      capabilityRefs: modelCapabilityRefsForFields(model, fields),
      fields,
    });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, `Campo ${nextField.label} actualizado.`);
    return nextField;
  },
  async updateAdvancedFieldMetadata(
    modelId: string,
    fieldId: string,
    patch: Partial<ElectroCraftAdvancedFieldMetadata>,
  ) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    const field = model?.fields.find(({ id }) => id === fieldId);
    if (!model || !field) throw new Error('Campo no encontrado.');
    const nextField = withAdvancedFieldMetadata(model, field, field.type, patch);
    const fields = model.fields.map((candidate) => (candidate.id === field.id ? nextField : candidate));
    const nextModel = electroCraftDataModelSchema.parse({
      ...model,
      capabilityRefs: modelCapabilityRefsForFields(model, fields),
      fields,
    });
    await persistSchema(
      replaceModel(current.schema, nextModel),
      modelId,
      `Configuración de ${field.label} actualizada.`,
    );
    return nextField;
  },
  async moveField(modelId: string, fieldId: ElectroCraftObjectId, direction: -1 | 1) {
    const current = snapshot;
    if (!current.schema) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    if (!model) throw new Error('Modelo no encontrado.');
    const fields = moveFieldWithinScope(model, fieldId, direction);
    const nextModel = electroCraftDataModelSchema.parse({ ...model, fields });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, 'Orden de campos actualizado.');
    return nextModel;
  },
  async deleteField(modelId: string, fieldId: string, confirmDataImpact = false) {
    const current = snapshot;
    if (!current.schema || !current.source) throw new Error('No hay esquema interno para editar.');
    const model = current.schema.models.find(({ id }) => id === modelId);
    const field = model?.fields.find(({ id }) => id === fieldId);
    if (!model || !field) throw new Error('Campo no encontrado.');
    if (model.fields.length <= 1) throw new Error('El modelo debe conservar al menos un campo.');
    const childCount = model.fields.filter(
      (candidate) => readElectroCraftAdvancedFieldMetadata(candidate).parentFieldRef === field.id,
    ).length;
    if (childCount > 0)
      throw new Error(`Mueve o elimina primero los ${childCount} campo(s) anidados dentro de ${field.label}.`);
    const impact = await queryFieldImpact(current.source, model, field);
    if (impact.populatedCount > 0 && !confirmDataImpact)
      throw new Error(`FIELD_DELETE_IMPACT:${impact.populatedCount}`);
    const fields = model.fields.filter(({ id }) => id !== field.id);
    const nextModel = electroCraftDataModelSchema.parse({
      ...model,
      capabilityRefs: modelCapabilityRefsForFields(model, fields),
      fields,
    });
    await persistSchema(replaceModel(current.schema, nextModel), modelId, `Campo ${field.label} eliminado.`);
    return impact;
  },
});
