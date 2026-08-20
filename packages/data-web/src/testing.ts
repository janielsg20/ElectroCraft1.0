import { PGlite } from '@electric-sql/pglite';
import { PGliteProjectStorage } from './pglite-project-storage';

export async function createMemoryProjectStorageForTest(): Promise<PGliteProjectStorage> {
  const client = await PGlite.create('memory://');
  const storage = new PGliteProjectStorage(client, {
    health: 'ready',
    backend: 'memory',
    persistent: false,
    worker: false,
  });
  await storage.initialize();
  return storage;
}
