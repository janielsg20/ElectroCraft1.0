import { PGliteWorker } from '@electric-sql/pglite/worker';
import type { PGlite } from '@electric-sql/pglite';
import { detectBrowserStorageCapability } from './browser-capability';
import { PGliteProjectStorage } from './pglite-project-storage';

export async function createBrowserProjectStorage(): Promise<PGliteProjectStorage> {
  const capability = detectBrowserStorageCapability();
  if (capability.backend === 'memory') {
    throw new Error('PROJECT_STORAGE_PERSISTENCE_UNAVAILABLE');
  }

  const worker = new Worker(new URL('./worker/project-db.worker.ts', import.meta.url), { type: 'module' });
  const client = await PGliteWorker.create(worker, {
    dataDir: capability.dataDir,
    id: 'electrocraft-studio-project-db',
  });
  const storage = new PGliteProjectStorage(client as unknown as PGlite, capability.status);
  await storage.initialize();
  return storage;
}
