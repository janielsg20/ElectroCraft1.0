import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizeSaveProjectRequest } from '@electrocraft/application';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { afterEach, describe, expect, it } from 'vitest';
import {
  STUDIO_STORAGE_TABLES,
  applyStudioStorageMigrations,
  createDrizzleProjectRepository,
} from '@electrocraft/data-web';
import * as storageSchema from '../../../packages/data-web/src/schema';

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function request(name = 'Proyecto local', payload: unknown = { title: 'Inicio' }) {
  return normalizeSaveProjectRequest({
    project: { id: 'project-1', name, metadata: {} },
    objects: [{ objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload }],
    reason: 'integration-test',
  });
}

describe('M04.1 PGlite + Drizzle persistence', () => {
  it('migrates the stable schema and round-trips a project without creating per-model tables', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const repository = createDrizzleProjectRepository(db);
      const saved = request();
      await repository.saveProject(saved);
      const opened = await repository.openProject('project-1');
      expect(opened?.project.name).toBe('Proyecto local');
      expect(opened?.objects[0]?.payload).toEqual({ title: 'Inicio' });
      expect((await repository.verifyProject('project-1')).coherent).toBe(true);

      const tables = await client.query<{ tablename: string }>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
      );
      const physical = tables.rows.map(({ tablename }) => tablename).filter((name) =>
        (STUDIO_STORAGE_TABLES as readonly string[]).includes(name),
      );
      expect(physical.sort()).toEqual([...STUDIO_STORAGE_TABLES].sort());
    } finally {
      await client.close();
    }
  });

  it('rolls back project/object writes atomically when revision persistence fails', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const first = request('Antes', { version: 1 });
      await repository.saveProject(first);
      const second = request('Después', { version: 2 });
      const colliding = { ...second, revision: { ...second.revision, id: first.revision.id } };
      await expect(repository.saveProject(colliding)).rejects.toThrow();
      const reopened = await repository.openProject('project-1');
      expect(reopened?.project.name).toBe('Antes');
      expect(reopened?.objects[0]?.payload).toEqual({ version: 1 });
    } finally {
      await client.close();
    }
  });

  it('persists through close/reopen on a real filesystem data directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'electrocraft-m04-1-'));
    tempRoots.push(root);
    const dataDir = join(root, 'pglite');

    const firstClient = await PGlite.create(dataDir);
    await applyStudioStorageMigrations(firstClient);
    const firstRepository = createDrizzleProjectRepository(drizzle(firstClient, { schema: storageSchema }));
    await firstRepository.saveProject(request('Persistente', { persisted: true }));
    await firstClient.close();

    const secondClient = await PGlite.create(dataDir);
    try {
      await applyStudioStorageMigrations(secondClient);
      const secondRepository = createDrizzleProjectRepository(drizzle(secondClient, { schema: storageSchema }));
      const reopened = await secondRepository.openProject('project-1');
      expect(reopened?.project.name).toBe('Persistente');
      expect(reopened?.objects[0]?.payload).toEqual({ persisted: true });
    } finally {
      await secondClient.close();
    }
  });
});
