import {
  createDataExplorerQueryDraft,
  createDataExplorerService,
  createStoredDataSourceObject,
  dataSourceConnectorRegistry,
  type DataExplorerOperationDescriptor,
  type StoredProjectDefinition,
} from '@electrocraft/application';
import {
  createGenericFieldIndexedInternalDataSourceAdapter,
  INTERNAL_DATA_ADAPTER_ID,
} from '@electrocraft/connectors';
import { createBrowserInternalDataRepositoryPort, webDataSourceRepository } from '@electrocraft/data-web';
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
  readonly environmentScope?: readonly ElectroCraftDataSourceEnvironment[];
  readonly environmentOverrides?: ElectroCraftDataSourceDefinition['environmentOverrides'];
  readonly capabilities?: readonly ElectroCraftCanonicalDataSourceCapability[];
  readonly schemaDiscovery?: ElectroCraftDataSourceSchemaDiscoveryPolicy;
}

const INTERNAL_CAPABILITIES = Object.freeze([
  'read',
  'create',
  'update',
  'delete',
  'pagination',
  'filtering',
  'sort',
  'aggregate',
  'transactions',
  'taxonomies',
  'relations',
] as const satisfies readonly ElectroCraftCanonicalDataSourceCapability[]);

const listeners = new Set<() => void>();
const internalDataRepository = createBrowserInternalDataRepositoryPort();
const dataExplorerService = createDataExplorerService(dataSourceConnectorRegistry);
let registeredInternalProjectId: string | null = null;
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
  return projectStorageRuntime.currentProjectId();
}

function registerInternalAdapter(projectId: string) {
  if (registeredInternalProjectId === projectId) return;
  dataSourceConnectorRegistry.registerAdapter(
    createGenericFieldIndexedInternalDataSourceAdapter({
      projectId,
      repository: internalDataRepository,
      relations: internalDataRepository.relations,
      permissions: {
        authorize(request) {
          return request.projectId === projectStorageRuntime.currentProjectId();
        },
      },
    }),
  );
  registeredInternalProjectId = projectId;
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
  const projectId = activeProjectId();
  if (!projectId) {
    sourceUpdatedAt = new Map();
    registeredInternalProjectId = null;
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

  registerInternalAdapter(projectId);
  const parsed = opened.objects
    .filter(({ kind }) => kind === 'data-source')
    .flatMap((object) => {
      const result = electroCraftDataSourceDefinitionSchema.safeParse(object.payload);
      return result.success ? [{ object, source: result.data }] : [];
    });
  const invalidCount = opened.objects.filter(({ kind }) => kind === 'data-source').length - parsed.length;
  const sources = parsed.map(({ source }) => source).sort((left, right) => left.label.localeCompare(right.label, 'es'));
  sourceUpdatedAt = new Map(parsed.map(({ object }) => [object.objectId, object.updatedAt]));

  return publish({
    state: 'ready',
    project: opened.project,
    sources,
    message:
      invalidCount === 0
        ? `${sources.length} fuente(s) de datos cargada(s).`
        : `${sources.length} fuente(s) cargada(s); ${invalidCount} objeto(s) inválido(s) ignorado(s).`,
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
    const isInternal = input.type === 'internal';
    const source = electroCraftDataSourceDefinitionSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-source', seed),
      version: 1,
      key: normalizeKey(input.key || (isInternal ? 'electroCraftData' : input.name)),
      label: isInternal ? 'ElectroCraft Data' : input.name.trim(),
      kind: input.type,
      adapterId: isInternal ? INTERNAL_DATA_ADAPTER_ID : input.adapter.trim(),
      authRef: isInternal ? null : (input.authRef ?? null),
      config: isInternal ? { storage: 'content_records', offlineCapable: true } : { ...(input.config ?? {}) },
      environmentScope: [...(input.environmentScope ?? ['development', 'preview', 'production'])],
      environmentOverrides: isInternal ? {} : (input.environmentOverrides ?? {}),
      schemaDiscovery: isInternal ? 'on-demand' : (input.schemaDiscovery ?? 'on-demand'),
      capabilities: [...(isInternal ? INTERNAL_CAPABILITIES : (input.capabilities ?? ['read']))],
      metadata: isInternal ? { offlineCapable: true, owner: 'PGlite+Drizzle' } : {},
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
  async internalStats(source: ElectroCraftDataSourceDefinition) {
    const projectId = activeProjectId();
    if (!projectId || source.kind !== 'internal') return null;
    return internalDataRepository.getStats(projectId, source.id);
  },
  async listResources(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    return webDataSourceRepository.listResources(source, environment);
  },
  async listExplorerOperations(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
  ) {
    return dataExplorerService.listOperations(source, environment);
  },
  async executeExplorerOperation(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
    operation: DataExplorerOperationDescriptor,
    input: JsonValue,
    mutationConfirmed = false,
  ) {
    return dataExplorerService.execute({ source, environment, operation, input, mutationConfirmed });
  },
  async createExplorerQueryDraft(
    source: ElectroCraftDataSourceDefinition,
    operation: DataExplorerOperationDescriptor,
    input: JsonValue,
  ) {
    const current = snapshot;
    if (!current.project) throw new Error('Abre un proyecto antes de crear una consulta.');
    const query = createDataExplorerQueryDraft({
      source,
      operation,
      input,
      idSeed: globalThis.crypto.randomUUID(),
    });
    publish({ ...current, state: 'saving', message: 'Guardando borrador de consulta…', lastOperation: null });
    try {
      projectStorageRuntime.queueAutosave({
        project: current.project,
        dirtyObjects: [
          {
            objectId: query.id,
            kind: 'query-definition',
            schemaVersion: query.schemaVersion,
            payload: structuredClone(query) as unknown as JsonValue,
          },
        ],
      });
      await projectStorageRuntime.flushAutosave();
      publish({
        ...current,
        state: 'ready',
        message: `Borrador ${query.name} creado.`,
        lastOperation: 'Consulta creada como borrador.',
      });
      return query;
    } catch (error) {
      publish({
        ...current,
        state: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar el borrador.',
        lastOperation: null,
      });
      throw error;
    }
  },
  async query(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
    resourceId: string,
    input?: JsonValue,
  ) {
    return webDataSourceRepository.query(source, environment, { resourceId, input });
  },
  async mutate(
    source: ElectroCraftDataSourceDefinition,
    environment: ElectroCraftDataSourceEnvironment,
    resourceId: string,
    operation: 'create' | 'update' | 'delete',
    input?: JsonValue,
  ) {
    return webDataSourceRepository.mutate(source, environment, { resourceId, operation, input });
  },
  async testConnection(source: ElectroCraftDataSourceDefinition, environment: ElectroCraftDataSourceEnvironment) {
    const current = snapshot;
    publish({ ...current, state: 'testing', message: 'Probando conexión…', lastOperation: null });
    try {
      const result = await webDataSourceRepository.testConnection(source, environment);
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
      const schema = await webDataSourceRepository.getSchema(source, environment);
      publish({
        ...current,
        state: 'ready',
        discoveredSchema: schema,
        message: schema ? `Esquema ${schema.name} detectado.` : 'No hay modelos definidos todavía.',
        lastOperation: schema ? 'Esquema inspeccionado.' : 'Sin modelos todavía.',
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
  async close() {
    registeredInternalProjectId = null;
    await internalDataRepository.close();
  },
});
