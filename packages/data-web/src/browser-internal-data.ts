import type { InternalDataRepository, InternalRelationRepository } from '@electrocraft/application';
import type { PGlite } from '@electric-sql/pglite';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { drizzle } from 'drizzle-orm/pglite';
import { createGenericFieldIndexedInternalDataRepository } from './generic-field-indexer';
import { createDrizzleInternalRelationRepository } from './internal-relation-repository';
import { applyStudioStorageMigrations } from './migration';
import * as schema from './schema';

export interface BrowserInternalDataOptions {
  readonly databaseName?: string;
  readonly preferredBackend?: 'indexeddb' | 'opfs-ahp';
}

export interface BrowserInternalDataRepositoryPort extends InternalDataRepository {
  readonly offlineCapable: true;
  readonly relations: InternalRelationRepository;
  close(): Promise<void>;
}

const DEFAULT_DATABASE_NAME = 'electrocraft-studio-storage' as const;

function normalizeDatabaseName(value: string = DEFAULT_DATABASE_NAME) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError('databaseName must not be empty');
  return normalized;
}

function canUseOpfs() {
  return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function';
}

function dataDirFor(backend: 'indexeddb' | 'opfs-ahp', databaseName: string) {
  return backend === 'indexeddb' ? `idb://${databaseName}` : `opfs-ahp://electrocraft/${databaseName}/`;
}

export function createBrowserInternalDataRepositoryPort(
  options: BrowserInternalDataOptions = {},
): BrowserInternalDataRepositoryPort {
  const databaseName = normalizeDatabaseName(options.databaseName);
  const backend = options.preferredBackend === 'opfs-ahp' && canUseOpfs() ? 'opfs-ahp' : 'indexeddb';
  let client: PGliteWorker | null = null;
  let repository: InternalDataRepository | null = null;
  let relationRepository: InternalRelationRepository | null = null;
  let initializePromise: Promise<InternalDataRepository> | null = null;

  async function initialize() {
    if (repository) return repository;
    if (initializePromise) return initializePromise;
    initializePromise = (async () => {
      const nextClient = await PGliteWorker.create(
        new Worker(new URL('./pglite.worker.ts', import.meta.url), {
          type: 'module',
          name: 'electrocraft-internal-data',
        }),
        {
          dataDir: dataDirFor(backend, databaseName),
          id: databaseName,
          meta: {
            clientId: `internal-data-${globalThis.crypto.randomUUID()}`,
            leaderSignalChannel: `electrocraft-storage-leader:${databaseName}`,
          },
        },
      );
      await applyStudioStorageMigrations(nextClient);
      const db = drizzle(nextClient as unknown as PGlite, { schema });
      client = nextClient;
      repository = createGenericFieldIndexedInternalDataRepository(db);
      relationRepository = createDrizzleInternalRelationRepository(db);
      return repository;
    })().finally(() => {
      initializePromise = null;
    });
    return initializePromise;
  }

  const delegate = async <T>(operation: (active: InternalDataRepository) => Promise<T>) =>
    operation(await initialize());
  const relationDelegate = async <T>(operation: (active: InternalRelationRepository) => Promise<T>) => {
    await initialize();
    if (!relationRepository) throw new Error('El repositorio de relaciones no está disponible.');
    return operation(relationRepository);
  };

  const relations = Object.freeze({
    listRelationEdges: (projectId, sourceId, relationId, query) =>
      relationDelegate((active) => active.listRelationEdges(projectId, sourceId, relationId, query)),
    createRelationEdge: (projectId, sourceId, relationId, input) =>
      relationDelegate((active) => active.createRelationEdge(projectId, sourceId, relationId, input)),
    updateRelationEdge: (projectId, sourceId, relationId, input) =>
      relationDelegate((active) => active.updateRelationEdge(projectId, sourceId, relationId, input)),
    deleteRelationEdge: (projectId, sourceId, relationId, edgeId) =>
      relationDelegate((active) => active.deleteRelationEdge(projectId, sourceId, relationId, edgeId)),
    prepareRecordDelete: (projectId, sourceId, modelId, recordId) =>
      relationDelegate((active) => active.prepareRecordDelete(projectId, sourceId, modelId, recordId)),
  } satisfies InternalRelationRepository);

  const port: BrowserInternalDataRepositoryPort = {
    offlineCapable: true,
    relations,
    testConnection: (projectId) => delegate((active) => active.testConnection(projectId)),
    listResources: (projectId, sourceId) => delegate((active) => active.listResources(projectId, sourceId)),
    getSchema: (projectId, sourceId) => delegate((active) => active.getSchema(projectId, sourceId)),
    queryRecords: (projectId, modelId, query) => delegate((active) => active.queryRecords(projectId, modelId, query)),
    createRecord: (projectId, modelId, input) => delegate((active) => active.createRecord(projectId, modelId, input)),
    updateRecord: (projectId, modelId, input) => delegate((active) => active.updateRecord(projectId, modelId, input)),
    deleteRecord: (projectId, modelId, recordId) =>
      delegate((active) => active.deleteRecord(projectId, modelId, recordId)),
    getStats: (projectId, sourceId) => delegate((active) => active.getStats(projectId, sourceId)),
    getFieldUsage: (projectId, modelId, fieldKey) =>
      delegate((active) => active.getFieldUsage(projectId, modelId, fieldKey)),
    getModelIndexStatus: (projectId, sourceId, modelId) =>
      delegate((active) => {
        if (!active.getModelIndexStatus) throw new Error('El índice tipado no está disponible.');
        return active.getModelIndexStatus(projectId, sourceId, modelId);
      }),
    reindexModel: (projectId, sourceId, modelId) =>
      delegate((active) => {
        if (!active.reindexModel) throw new Error('La reconstrucción del índice no está disponible.');
        return active.reindexModel(projectId, sourceId, modelId);
      }),
    listTaxonomyTerms: (projectId, sourceId, taxonomyId) =>
      delegate((active) => active.listTaxonomyTerms(projectId, sourceId, taxonomyId)),
    createTaxonomyTerm: (projectId, sourceId, taxonomyId, input) =>
      delegate((active) => active.createTaxonomyTerm(projectId, sourceId, taxonomyId, input)),
    updateTaxonomyTerm: (projectId, sourceId, taxonomyId, input) =>
      delegate((active) => active.updateTaxonomyTerm(projectId, sourceId, taxonomyId, input)),
    deleteTaxonomyTerm: (projectId, sourceId, taxonomyId, termId) =>
      delegate((active) => active.deleteTaxonomyTerm(projectId, sourceId, taxonomyId, termId)),
    async close() {
      const active = client;
      client = null;
      repository = null;
      relationRepository = null;
      await active?.close();
    },
  };

  return Object.freeze(port);
}
