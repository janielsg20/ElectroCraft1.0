import {
  PROJECT_STORAGE_SCHEMA_VERSION,
  type NormalizedSaveProjectRequest,
  type ProjectStorageCoordinationDiagnostics,
  type ProjectStorageDiagnostics,
  type ProjectStoragePort,
} from '@electrocraft/application';
import type { PGlite } from '@electric-sql/pglite';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { drizzle } from 'drizzle-orm/pglite';
import { applyStudioStorageMigrations } from './migration';
import { createDrizzleProjectRepository } from './repository';
import * as schema from './schema';
import { verifyStudioStorageHealth } from './storage-health';

export const DEFAULT_BROWSER_STORAGE_BACKEND = 'indexeddb' as const;
export const DEFAULT_BROWSER_DATABASE_NAME = 'electrocraft-studio-storage' as const;

export interface BrowserProjectStorageOptions {
  readonly preferredBackend?: 'indexeddb' | 'opfs-ahp';
  readonly databaseName?: string;
}

interface BrowserStorageClient {
  readonly backend: 'opfs-ahp' | 'indexeddb';
  readonly client: PGliteWorker;
  readonly fallbackReason?: string;
}

function canAttemptOpfs() {
  return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function';
}

function normalizeDatabaseName(value: string = DEFAULT_BROWSER_DATABASE_NAME) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError('databaseName must not be empty');
  return normalized;
}

function dataDirFor(backend: 'indexeddb' | 'opfs-ahp', databaseName: string) {
  return backend === 'indexeddb' ? `idb://${databaseName}` : `opfs-ahp://electrocraft/${databaseName}/`;
}

async function openWorkerClient(dataDir: string, databaseName: string) {
  return PGliteWorker.create(
    new Worker(new URL('./pglite.worker.ts', import.meta.url), {
      type: 'module',
      name: 'electrocraft-storage',
    }),
    { dataDir, id: databaseName },
  );
}

function createWorkerDrizzleDatabase(client: PGliteWorker) {
  // PGlite documents PGliteWorker as exposing the same database API as PGlite.
  // Drizzle 0.45.x still types its pglite driver nominally as PGlite, so the
  // compatibility bridge remains isolated inside data-web rather than leaking
  // a raw engine client through the application port or Studio UI.
  return drizzle(client as unknown as PGlite, { schema });
}

async function createPersistentWorkerClient(options: BrowserProjectStorageOptions): Promise<BrowserStorageClient> {
  const databaseName = normalizeDatabaseName(options.databaseName);
  const preferredBackend = options.preferredBackend ?? DEFAULT_BROWSER_STORAGE_BACKEND;

  if (preferredBackend === 'opfs-ahp') {
    if (!canAttemptOpfs()) {
      return Object.freeze({
        backend: 'indexeddb',
        client: await openWorkerClient(dataDirFor('indexeddb', databaseName), databaseName),
        fallbackReason: 'OPFS AHP solicitado pero no disponible; se usa IndexedDB persistente.',
      });
    }
    try {
      return Object.freeze({
        backend: 'opfs-ahp',
        client: await openWorkerClient(dataDirFor('opfs-ahp', databaseName), databaseName),
      });
    } catch (error) {
      return Object.freeze({
        backend: 'indexeddb',
        client: await openWorkerClient(dataDirFor('indexeddb', databaseName), databaseName),
        fallbackReason:
          error instanceof Error ? error.message : 'OPFS AHP no disponible; se usa IndexedDB persistente.',
      });
    }
  }

  return Object.freeze({
    backend: 'indexeddb',
    client: await openWorkerClient(dataDirFor('indexeddb', databaseName), databaseName),
  });
}

async function storageEstimate() {
  if (typeof navigator === 'undefined' || !navigator.storage) {
    return { usageBytes: null, quotaBytes: null, durable: false } as const;
  }
  const [estimate, durable] = await Promise.all([
    navigator.storage.estimate().catch((): StorageEstimate => ({})),
    navigator.storage.persisted?.().catch(() => false) ?? Promise.resolve(false),
  ]);
  return {
    usageBytes: estimate.usage ?? null,
    quotaBytes: estimate.quota ?? null,
    durable,
  } as const;
}

export function createBrowserProjectStoragePort(options: BrowserProjectStorageOptions = {}): ProjectStoragePort {
  let runtime: BrowserStorageClient | null = null;
  let repository: ReturnType<typeof createDrizzleProjectRepository> | null = null;
  let initializePromise: Promise<ProjectStorageDiagnostics> | null = null;
  let unsubscribeLeaderChange: (() => void) | null = null;
  let leaderChanges = 0;

  function coordination(): ProjectStorageCoordinationDiagnostics {
    return Object.freeze({
      mode: 'multi-tab',
      role: runtime ? (runtime.client.isLeader ? 'leader' : 'follower') : 'unknown',
      leaderChanges,
    });
  }

  let diagnostics: ProjectStorageDiagnostics = Object.freeze({
    state: 'initial',
    backend: DEFAULT_BROWSER_STORAGE_BACKEND,
    persistent: false,
    durable: false,
    usageBytes: null,
    quotaBytes: null,
    migrationVersion: 0,
    repairSupported: true,
    lifecyclePhase: 'idle',
    coordination: coordination(),
    message: 'Almacenamiento local pendiente de inicialización.',
  });

  async function revalidateAfterLeaderChange(client: PGliteWorker) {
    diagnostics = Object.freeze({
      ...diagnostics,
      state: 'loading',
      lifecyclePhase: 'leader-handoff',
      coordination: coordination(),
      message: 'Revalidando almacenamiento compartido…',
    });
    try {
      await verifyStudioStorageHealth(client);
      if (runtime?.client !== client) return;
      const estimate = await storageEstimate();
      diagnostics = Object.freeze({
        ...diagnostics,
        state: 'ready',
        lifecyclePhase: 'ready',
        durable: estimate.durable,
        usageBytes: estimate.usageBytes,
        quotaBytes: estimate.quotaBytes,
        coordination: coordination(),
        message:
          runtime.backend === 'opfs-ahp'
            ? 'Base local persistente lista mediante OPFS.'
            : 'Base local persistente lista mediante IndexedDB.',
      });
    } catch (error) {
      if (runtime?.client !== client) return;
      diagnostics = Object.freeze({
        ...diagnostics,
        state: 'error',
        lifecyclePhase: 'leader-handoff',
        coordination: coordination(),
        message: error instanceof Error ? error.message : 'No se pudo revalidar el almacenamiento compartido.',
      });
    }
  }

  async function initialize() {
    if (runtime && repository) return getDiagnostics();
    if (initializePromise) return initializePromise;

    initializePromise = (async () => {
      diagnostics = Object.freeze({
        ...diagnostics,
        state: 'loading',
        lifecyclePhase: 'bootstrap',
        coordination: coordination(),
        message: 'Inicializando almacenamiento local…',
      });
      try {
        runtime = await createPersistentWorkerClient(options);
        diagnostics = Object.freeze({
          ...diagnostics,
          backend: runtime.backend,
          lifecyclePhase: 'migrations',
          coordination: coordination(),
          message: 'Aplicando migraciones del almacenamiento…',
          ...(runtime.fallbackReason ? { fallbackReason: runtime.fallbackReason } : {}),
        });

        await applyStudioStorageMigrations(runtime.client);
        diagnostics = Object.freeze({
          ...diagnostics,
          lifecyclePhase: 'health-check',
          coordination: coordination(),
          message: 'Comprobando almacenamiento local…',
        });
        await verifyStudioStorageHealth(runtime.client);
        repository = createDrizzleProjectRepository(createWorkerDrizzleDatabase(runtime.client));

        unsubscribeLeaderChange = runtime.client.onLeaderChange(() => {
          leaderChanges += 1;
          if (runtime) void revalidateAfterLeaderChange(runtime.client);
        });

        const estimate = await storageEstimate();
        diagnostics = Object.freeze({
          state: 'ready',
          backend: runtime.backend,
          persistent: true,
          durable: estimate.durable,
          usageBytes: estimate.usageBytes,
          quotaBytes: estimate.quotaBytes,
          migrationVersion: PROJECT_STORAGE_SCHEMA_VERSION,
          repairSupported: true,
          lifecyclePhase: 'ready',
          coordination: coordination(),
          message:
            runtime.backend === 'opfs-ahp'
              ? 'Base local persistente lista mediante OPFS.'
              : 'Base local persistente lista mediante IndexedDB.',
          ...(runtime.fallbackReason ? { fallbackReason: runtime.fallbackReason } : {}),
        });
        return diagnostics;
      } catch (error) {
        unsubscribeLeaderChange?.();
        unsubscribeLeaderChange = null;
        const failedRuntime = runtime;
        runtime = null;
        repository = null;
        await failedRuntime?.client.close().catch(() => undefined);
        diagnostics = Object.freeze({
          ...diagnostics,
          state: 'blocked',
          persistent: false,
          coordination: coordination(),
          repairSupported: true,
          message: error instanceof Error ? error.message : 'No se pudo inicializar el almacenamiento local.',
        });
        return diagnostics;
      }
    })().finally(() => {
      initializePromise = null;
    });

    return initializePromise;
  }

  async function ensureRepository() {
    if (!repository) await initialize();
    if (!repository) throw new Error(diagnostics.message);
    return repository;
  }

  async function getDiagnostics() {
    if (!runtime) return diagnostics;
    const estimate = await storageEstimate();
    diagnostics = Object.freeze({
      ...diagnostics,
      durable: estimate.durable,
      usageBytes: estimate.usageBytes,
      quotaBytes: estimate.quotaBytes,
      coordination: coordination(),
    });
    return diagnostics;
  }

  return Object.freeze({
    initialize,
    async saveProject(request: NormalizedSaveProjectRequest) {
      const repo = await ensureRepository();
      diagnostics = Object.freeze({ ...diagnostics, state: 'saving', message: 'Guardando proyecto…' });
      try {
        const revision = await repo.saveProject(request);
        diagnostics = Object.freeze({
          ...diagnostics,
          state: 'saved',
          lifecyclePhase: 'ready',
          coordination: coordination(),
          message: 'Proyecto guardado.',
        });
        return revision;
      } catch (error) {
        diagnostics = Object.freeze({
          ...diagnostics,
          state: 'error',
          coordination: coordination(),
          message: error instanceof Error ? error.message : 'No se pudo guardar el proyecto.',
        });
        throw error;
      }
    },
    async openProject(projectId: string) {
      return (await ensureRepository()).openProject(projectId);
    },
    async verifyProject(projectId: string) {
      return (await ensureRepository()).verifyProject(projectId);
    },
    getDiagnostics,
    async repair() {
      if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
        await navigator.storage.persist().catch(() => false);
      }
      if (runtime) {
        diagnostics = Object.freeze({
          ...diagnostics,
          state: 'loading',
          lifecyclePhase: 'health-check',
          message: 'Comprobando almacenamiento local…',
        });
        await verifyStudioStorageHealth(runtime.client);
        diagnostics = Object.freeze({
          ...diagnostics,
          state: 'ready',
          lifecyclePhase: 'ready',
          coordination: coordination(),
          message:
            runtime.backend === 'opfs-ahp'
              ? 'Base local persistente lista mediante OPFS.'
              : 'Base local persistente lista mediante IndexedDB.',
        });
      } else {
        await initialize();
      }
      return getDiagnostics();
    },
    async close() {
      unsubscribeLeaderChange?.();
      unsubscribeLeaderChange = null;
      await runtime?.client.close();
      runtime = null;
      repository = null;
      diagnostics = Object.freeze({
        ...diagnostics,
        state: 'initial',
        persistent: false,
        lifecyclePhase: 'idle',
        coordination: coordination(),
        message: 'Almacenamiento local cerrado.',
      });
    },
  });
}
