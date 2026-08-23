import type { WorkspacePreferencesStoragePort } from '@electrocraft/application';
import type { PGlite } from '@electric-sql/pglite';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { drizzle } from 'drizzle-orm/pglite';
import {
  DEFAULT_BROWSER_DATABASE_NAME,
  DEFAULT_BROWSER_STORAGE_BACKEND,
  type BrowserProjectStorageOptions,
} from './browser';
import { applyStudioStorageMigrations } from './migration';
import { createDrizzleWorkspacePreferencesRepository } from './workspace-preferences-repository';
import * as schema from './schema';
import { verifyStudioStorageHealth } from './storage-health';

export interface BrowserWorkspacePreferencesStoragePort extends WorkspacePreferencesStoragePort {
  close(): Promise<void>;
}

function normalizeDatabaseName(value: string = DEFAULT_BROWSER_DATABASE_NAME) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError('databaseName must not be empty');
  return normalized;
}

function canAttemptOpfs() {
  return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function';
}

function dataDirFor(backend: 'indexeddb' | 'opfs-ahp', databaseName: string) {
  return backend === 'indexeddb' ? `idb://${databaseName}` : `opfs-ahp://electrocraft/${databaseName}/`;
}

async function createClient(options: BrowserProjectStorageOptions): Promise<PGliteWorker> {
  const databaseName = normalizeDatabaseName(options.databaseName);
  let backend = options.preferredBackend ?? DEFAULT_BROWSER_STORAGE_BACKEND;
  if (backend === 'opfs-ahp' && !canAttemptOpfs()) backend = 'indexeddb';

  const create = (candidate: 'indexeddb' | 'opfs-ahp') =>
    PGliteWorker.create(
      new Worker(new URL('./pglite.worker.ts', import.meta.url), {
        type: 'module',
        name: 'electrocraft-workspace-preferences',
      }),
      {
        dataDir: dataDirFor(candidate, databaseName),
        id: databaseName,
        meta: {
          clientId:
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? crypto.randomUUID()
              : `workspace-preferences-${Date.now()}`,
          leaderSignalChannel: `electrocraft-storage-leader:${databaseName}`,
        },
      },
    );

  if (backend === 'opfs-ahp') {
    try {
      return await create('opfs-ahp');
    } catch {
      return create('indexeddb');
    }
  }
  return create('indexeddb');
}

export function createBrowserWorkspacePreferencesStoragePort(
  options: BrowserProjectStorageOptions = {},
): BrowserWorkspacePreferencesStoragePort {
  let client: PGliteWorker | null = null;
  let repository: ReturnType<typeof createDrizzleWorkspacePreferencesRepository> | null = null;
  let initialization: Promise<ReturnType<typeof createDrizzleWorkspacePreferencesRepository>> | null = null;
  let writeQueue = Promise.resolve();

  async function initialize() {
    if (repository) return repository;
    if (initialization) return initialization;
    initialization = (async () => {
      const nextClient = await createClient(options);
      try {
        await applyStudioStorageMigrations(nextClient);
        await verifyStudioStorageHealth(nextClient);
        const db = drizzle(nextClient as unknown as PGlite, { schema });
        client = nextClient;
        repository = createDrizzleWorkspacePreferencesRepository(db);
        return repository;
      } catch (error) {
        await nextClient.close().catch(() => undefined);
        throw error;
      }
    })().finally(() => {
      initialization = null;
    });
    return initialization;
  }

  return Object.freeze({
    async read(workspaceId: string, key: string) {
      return (await initialize()).read(workspaceId, key);
    },
    async write(workspaceId: string, key: string, value) {
      const operation = writeQueue.then(async () => (await initialize()).write(workspaceId, key, value));
      writeQueue = operation.catch(() => undefined);
      await operation;
    },
    async close() {
      await writeQueue.catch(() => undefined);
      await client?.close();
      client = null;
      repository = null;
    },
  });
}
