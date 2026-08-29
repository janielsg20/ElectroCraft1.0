import {
  createStoredDataSourceObject,
  dataSourceConnectorRegistry,
  type StoredProjectDefinition,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDataSourceDefinitionSchema,
  normalizeDataSourceCapabilities,
  type ElectroCraftCanonicalDataSourceCapability,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftDataSourceEnvironment,
  type ElectroCraftDataSourceKind,
  type ElectroCraftDataSourceSchemaDiscoveryPolicy,
  type JsonValue,
} from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { workspacePreferencesRuntime } from '../projects/workspace-preferences-runtime';

export type DataSourceWorkspaceState = 'initial' | 'loading' | 'ready' | 'saving' | 'testing' | 'error';

export interface DataSourceWorkspaceSnapshot {
  readonly state: DataSourceWorkspaceState;
  readonly project: StoredProjectDefinition | null;
  readonly sources: readonly ElectroCraftDataSourceDefinition[];
  readonly message: string;
  readonly lastOperation: string | null;
  readonly discoveredSchema: ElectroCraftDataSchema | null;
}

export interface CreateDataSourceInput {
  readonly name: string;
  readonly key: string;
  readonly type: ElectroCraftDataSourceKind;
  readonly adapter: string;
  readonly authRef?: string | null;
  readonly config?: Readonly<Record<string, JsonValue>>;
  readonly environmentOverrides?: ElectroCraftDataSourceDefinition['environmentOverrides'];
  readonly capabilities?: readonly ElectroCraftCanonicalDataSourceCapability[];
  readonly schemaDiscovery?: ElectroCraftDataSourceSchemaDiscoveryPolicy;
}

const listeners = new Set<() => void>();
let loadPromise: Promise<DataSourceWorkspaceSnapshot> | null = null;
let sourceUpdatedAt = new Map<string, string>();
let snapshot: DataSourceWorkspaceSnapshot = Object.freeze({
  state: 'initial',
  project: null,
  sources: Object.freeze([]),
  message: 'Fuentes de datos pendientes de carga.',
  lastOperation: null,
  discoveredSchema: null,
});

function publish(next: DataSourceWorkspaceSnapshot) {
  snapshot = Object.freeze({ ...next, sources: Object.freeze([...next.sources]) });
  for (const listener of listeners) listener();
  return snapshot;
}

function activeProjectId() {
  return projectStorageRuntime.currentProjectId() ?? workspacePreferencesRuntime.getSnapshot().layout.lastDocumentId;
}

function normalizeKey(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const withPrefix = /^[A-Za-z]/.test(normalized) ? normalized : `source-${normalized || 'data'}`;
  return withPrefix.slice(0, 80);
}

async function loadWorkspace(): Promise<DataSourceWorkspaceSnapshot> {
  publish({ ...snapshot, state: 'loading', message: 'Cargando fuentes de datos…', lastOperation: null });
  await projectStorageRuntime.initialize();
  await workspacePreferencesRuntime.initialize();
  const projectId = activeProjectId();
  if (!projectId) {
    sourceUpdatedAt = new Map();
    return publish({
      state: 'ready',
      project: null,
      sources: [],
      message: 'Abre un proyecto para configurar sus fuentes de datos.',
      lastOperation: null,
      discoveredSchema: null,
    });
  }

  const opened = await projectStorageRuntime.openProject(projectId);
  if (!opened) {
    return publish({
      state: 'error',
      project: null,
      sources: [],
      message: 'El proyecto seleccionado ya no está disponible.',
      lastOperation: null,
      discoveredSchema: null,
    });
  }

  const parsed = opened.objects
    .filter(({ kind }) => kind === 'data-source')
    .map((object) => ({ object, parsed: electroCraftDataSourceDefinitionSchema.safeParse(object.payload) }));
  const invalid = parsed.filter(({ parsed: result }) => !result.success);
  const sources = parsed
    .flatMap(({ parsed: result }) => (result.success ? [result.data] : []))
    .sort((left, right) => left.label.localeCompare(right.label, 'es'));
  sourceUpdatedAt = new Map(parsed.map(({ object }) => [object.objectId, object.updatedAt]));

  return publish({
    state: 'ready',
    project: opened.project,
    sources,
    message:
      invalid.length === 0
        ? `${sources.length} fuente(s) de datos cargada(s).`
        : `${sources.length} fuente(s) cargada(s); ${invalid.length} objeto(s) inválido(s) ignorado(s).`,
    lastOperation: null,
    discoveredSchema: null,
  });
}

async function persistSource(source: ElectroCraftDataSourceDefinition, message: string) {
  const current = snapshot;
  if (!current.project) throw new Error('Abre un proyecto antes de guardar una fuente de datos.');
  publish({ ...current, state: 'saving', message: 'Guardando fuente de datos…', lastOperation: null });
  try {
    projectStorageRuntime.queueAutosave({
      project: current.project,
      dirtyObjects: [createStoredDataSourceObject(source)],
    });
    await projectStorageRuntime.flushAutosave();
    await loadWorkspace();
    return publish({ ...snapshot, lastOperation: message });
  } catch (error) {
    publish({
      ...current,
      state: 'error',
      message: error instanceof Error ? error.message : 'No se pudo guardar la fuente de datos.',
      lastOperation: null,
    });
    throw error;
  }
}

export const dataSourceWorkspaceRuntime = Object.freeze({
  registry: dataSourceConnectorRegistry,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  sourceUpdatedAt(sourceId: string) {
    return sourceUpdatedAt.get(sourceId) ?? null;
  },
  load() {
    if (!loadPromise) {
      loadPromise = loadWorkspace().finally(() => {
        loadPromise = null;
      });
    }
    return loadPromise;
  },
  async createSource(input: CreateDataSourceInput) {
    const seed = globalThis.crypto.randomUUID();
    const source = electroCraftDataSourceDefinitionSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-source', seed),
      version: 1,
      key: normalizeKey(input.key || input.name),
      label: input.name.trim(),
      kind: input.type,
      adapterId: input.adapter.trim(),
      authRef: input.authRef ?? null,
      config: { ...(input.config ?? {}) },
      environmentOverrides: input.environmentOverrides ?? {},
      schemaDiscovery: input.schemaDiscovery ?? 'on-demand',
      capabilities: [...(input.capabilities ?? ['read'])],
      metadata: {},
    });
    await persistSource(source, `Fuente ${source.label} creada.`);
    return source;
  },
  async updateSource(source: ElectroCraftDataSourceDefinition) {
    const next = electroCraftDataSourceDefinitionSchema.parse({ ...source, version: source.version + 1 });
    await persistSource(next, `Fuente ${next.label} actualizada.`);
    return next;
  },
  async deleteSource(sourceId: string) {
    const current = snapshot;
    if (!current.project) throw new Error('Abre un proyecto antes de eliminar una fuente de datos.');
    const source = current.sources.find(({ id }) => id === sourceId);
    if (!source) return;
    publish({ ...current, state: 'saving', message: 'Eliminando fuente de datos…', lastOperation: null });
    projectStorageRuntime.queueAutosave({ project: current.project, dirtyObjects: [], deletedObjectIds: [source.id] });
    await projectStorageRuntime.flushAutosave();
    await loadWorkspace();
    publish({ ...snapshot, lastOperation: `Fuente ${source.label} eliminada.` });
  },
  compatibility(source: ElectroCraftDataSourceDefinition) {
    return dataSourceConnectorRegistry.validateCompatibility(source);
  },
  canonicalCapabilities(source: ElectroCraftDataSourceDefinition) {
    return normalizeDataSourceCapabilities(source.capabilities);
  },
  async testConnection(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    const current = snapshot;
    publish({ ...current, state: 'testing', message: 'Probando conexión…', lastOperation: null });
    try {
      const result = await dataSourceConnectorRegistry.testConnection(source, environment);
      publish({
        ...current,
        state: 'ready',
        message: result.message,
        lastOperation: result.ok ? 'Conexión correcta.' : 'La conexión respondió con errores.',
      });
      return result;
    } catch (error) {
      publish({
        ...current,
        state: 'ready',
        message: error instanceof Error ? error.message : 'No se pudo probar la conexión.',
        lastOperation: 'No se pudo probar la conexión.',
      });
      throw error;
    }
  },
  async introspectSchema(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    const current = snapshot;
    publish({ ...current, state: 'testing', message: 'Inspeccionando esquema…', lastOperation: null });
    try {
      const schema = await dataSourceConnectorRegistry.introspectSchema(source, environment);
      publish({
        ...current,
        state: 'ready',
        discoveredSchema: schema,
        message: schema ? `Esquema ${schema.name} detectado.` : 'El adapter no devolvió un esquema.',
        lastOperation: schema ? 'Esquema inspeccionado.' : 'Sin esquema detectable.',
      });
      return schema;
    } catch (error) {
      publish({
        ...current,
        state: 'ready',
        message: error instanceof Error ? error.message : 'No se pudo inspeccionar el esquema.',
        lastOperation: 'No se pudo inspeccionar el esquema.',
      });
      throw error;
    }
  },
});
