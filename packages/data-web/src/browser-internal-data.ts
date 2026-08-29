import type { InternalDataRepository } from '@electrocraft/application';
import type { PGlite } from '@electric-sql/pglite';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { drizzle } from 'drizzle-orm/pglite';
import { createDrizzleInternalDataRepository } from './internal-data-repository';
import { applyStudioStorageMigrations } from './migration';
import * as schema from './schema';

export interface BrowserInternalDataOptions {
  readonly databaseName?: string;
  readonly preferredBackend?: 'indexeddb' | 'opfs-ahp';
}

export interface BrowserInternalDataRepositoryPort extends InternalDataRepository {
  readonly offlineCapable: true;
  close(): Promise<void>;
}

const DEFAULT_DATABASE_NAME = 'electrocraft-studio-storage' as const;

function normalizeDatabaseName(value = DEFAULT_DATABASE_NAME) {
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
      repository = createDrizzleInternalDataRepository(db);
      return repository;
    })().finally(() => {
      initializePromise = null;
    });
    return initializePromise;
  }

  const delegate = async <T>(operation: (active: InternalDataRepository) => Promise<T>) => operation(await initialize());

  return Object.freeze({
    offlineCapable: true as const,
    testConnection: (projectId: string) => delegate((active) => active.testConnection(projectId)),
    listResources: (projectId: string, sourceId: string) =>
      delegate((active) => active.listResources(projectId, sourceId)),
    getSchema: (projectId: string, sourceId: string) => delegate((active) => active.getSchema(projectId, sourceId)),
    queryRecords: (projectId, modelId, query) => delegate((active) => active.queryRecords(projectId, modelId, query)),
    createRecord: (projectId, modelId, input) => delegate((active) => active.createRecord(projectId, modelId, input)),
    updateRecord: (projectId, modelId, input) => delegate((active) => active.updateRecord(projectId, modelId, input)),
    deleteRecord: (projectId, modelId, recordId) =>
      delegate((active) => active.deleteRecord(projectId, modelId, recordId)),
    getStats: (projectId, sourceId) => delegate((active) => active.getStats(projectId, sourceId)),
    async close() {
      const active = client;
      client = null;
      repository = null;
      await active?.close();
    },
  });
}
