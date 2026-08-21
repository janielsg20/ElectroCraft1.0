import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { normalizeSaveProjectRequest } from '@electrocraft/application';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as schema from '../../../packages/data-web/src/schema';
describe('M04.4 Project Home PGlite', () => {
  it('lists and persists lifecycle across reopen', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repo = createDrizzleProjectRepository(drizzle(client, { schema }));
      for (const [id, name] of [
        ['a', 'Tienda'],
        ['b', 'Blog'],
      ])
        await repo.saveProject(normalizeSaveProjectRequest({ project: { id, name, metadata: {} }, objects: [] }));
      expect((await repo.listProjects({ search: '', status: 'active', sort: 'name-asc' })).map((x) => x.name)).toEqual([
        'Blog',
        'Tienda',
      ]);
      await repo.setProjectStatus('a', 'archived');
      const reopened = createDrizzleProjectRepository(drizzle(client, { schema }));
      expect((await reopened.listProjects({ search: '', status: 'archived', sort: 'updated-desc' }))[0]?.id).toBe('a');
      expect((await reopened.openProject('a'))?.project.name).toBe('Tienda');
    } finally {
      await client.close();
    }
  });
  it('rejects missing project', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      await expect(
        createDrizzleProjectRepository(drizzle(client, { schema })).setProjectStatus('missing', 'archived'),
      ).rejects.toThrow(/not found/);
    } finally {
      await client.close();
    }
  });
});
