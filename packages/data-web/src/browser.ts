import {
  PROJECT_STORAGE_SCHEMA_VERSION,
  type NormalizedSaveProjectRequest,
  type ProjectStorageDiagnostics,
  type ProjectStoragePort,
} from '@electrocraft/application';
import type { PGlite } from '@electric-sql/pglite';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { drizzle } from 'drizzle-orm/pglite';
import { applyStudioStorageMigrations } from './migration';
import { createDrizzleProjectRepository } from './repository';
import * as schema from './schema';

const OPFS_DIR = 'opfs-ahp://electrocraft/studio-db/';
const IDB_DIR = 'idb://electrocraft-studio-db';

interface BrowserStorageClient {
  readonly backend: 'opfs-ahp' | 'indexeddb';
  readonly client: PGliteWorker;
  readonly fallbackReason?: string;
}

function canAttemptOpfs() {
  return typeof navigator !== 'undefined' && typeof navigator.storage?.getDirectory === 'function';
}

async function openWorkerClient(dataDir: string) {
  return PGliteWorker.create(
    new Worker(new URL('./pglite.worker.ts', import.meta.url), {
      type: 'module',
      name: 'electrocraft-storage',
    }),
    { dataDir, id: 'electrocraft-studio-storage' },
  );
}

function createWorkerDrizzleDatabase(client: PGliteWorker) {
  // PGlite documents PGliteWorker as exposing the same database API as PGlite.
  // Drizzle 0.45.x still types its pglite driver nominally as PGlite, so the
  // compatibility bridge remains isolated inside data-web rather than leaking
  // a raw engine client through the application port or Studio UI.
  return drizzle(client as unknown as PGlite, { schema });
}

async function createPersistentWorkerClient(): Promise<BrowserStorageClient> {
  if (canAttemptOpfs()) {
    try {
      return Object.freeze({ backend: 'opfs-ahp', client: await openWorkerClient(OPFS_DIR) });
    } catch (error) {
      const fallbackReason = error instanceof Error ? error.message : 'OPFS AHP no disponible en este navegador.';
      return Object.freeze({
        backend: 'indexeddb',
        client: await openWorkerClient(IDB_DIR),
        fallbackReason,
      });
    }
  }
  return Object.freeze({
    backend: 'indexeddb',
    client: await openWorkerClient(IDB_DIR),
    fallbackReason: 'OPFS AHP no está disponible; se usa IndexedDB persistente.',
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

export function createBrowserProjectStoragePort(): ProjectStoragePort {
  let runtime: BrowserStorageClient | null = null;
  let repository: ReturnType<typeof createDrizzleProjectRepository> | null = null;
  let diagnostics: ProjectStorageDiagnostics = Object.freeze({
    state: 'initial',
    backend: 'indexeddb',
    persistent: false,
    durable: false,
    usageBytes: null,
    quotaBytes: null,
    migrationVersion: 0,
    repairSupported: true,
    message: 'Almacenamiento local pendiente de inicialización.',
  });

  async function initialize() {
    if (runtime && repository) return getDiagnostics();
    diagnostics = Object.freeze({ ...diagnostics, state: 'loading', message: 'Inicializando almacenamiento local…' });
    try {
      runtime = await createPersistentWorkerClient();
      await applyStudioStorageMigrations(runtime.client);
      repository = createDrizzleProjectRepository(createWorkerDrizzleDatabase(runtime.client));
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
        message:
          runtime.backend === 'opfs-ahp'
            ? 'Base local persistente lista mediante OPFS.'
            : 'Base local persistente lista mediante IndexedDB.',
        ...(runtime.fallbackReason ? { fallbackReason: runtime.fallbackReason } : {}),
      });
      return diagnostics;
    } catch (error) {
      diagnostics = Object.freeze({
        ...diagnostics,
        state: 'blocked',
        persistent: false,
        repairSupported: true,
        message: error instanceof Error ? error.message : 'No se pudo inicializar el almacenamiento local.',
      });
      return diagnostics;
    }
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
        diagnostics = Object.freeze({ ...diagnostics, state: 'saved', message: 'Proyecto guardado.' });
        return revision;
      } catch (error) {
        diagnostics = Object.freeze({
          ...diagnostics,
          state: 'error',
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
        await runtime.client.query('SELECT 1');
      } else {
        await initialize();
      }
      return getDiagnostics();
    },
    async close() {
      await runtime?.client.close();
      runtime = null;
      repository = null;
      diagnostics = Object.freeze({
        ...diagnostics,
        state: 'initial',
        persistent: false,
        message: 'Almacenamiento local cerrado.',
      });
    },
  });
}
