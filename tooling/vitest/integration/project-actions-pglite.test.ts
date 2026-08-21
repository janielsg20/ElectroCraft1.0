import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { normalizeSaveProjectRequest } from '@electrocraft/application';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as schema from '../../../packages/data-web/src/schema';
describe('M04.5 project actions PGlite', () => {
  it('renames display only and duplicates with fresh ids without history', async () => {
    const c = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(c);
      const r = createDrizzleProjectRepository(drizzle(c, { schema }));
      await r.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'source', name: 'Original', metadata: {} },
          objects: [{ objectId: 'screen-1', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio' } }],
        }),
      );
      await r.renameProject('source', 'Renombrado');
      const copy = await r.duplicateProject({ sourceProjectId: 'source', projectId: 'copy', name: 'Copia' });
      expect(copy.name).toBe('Copia');
      const opened = await r.openProject('copy');
      expect(opened?.objects).toHaveLength(1);
      expect(opened?.objects[0]?.objectId).not.toBe('screen-1');
      expect(opened?.objects[0]?.payload).toEqual({ title: 'Inicio' });
      expect(opened?.revision).toBeNull();
      const revisions = await c.query<{ count: number }>(
        "select count(*)::int count from project_revisions where project_id='copy'",
      );
      expect(revisions.rows[0]?.count).toBe(0);
    } finally {
      await c.close();
    }
  });
  it('allows permanent deletion only from trash', async () => {
    const c = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(c);
      const r = createDrizzleProjectRepository(drizzle(c, { schema }));
      await r.saveProject(normalizeSaveProjectRequest({ project: { id: 'p', name: 'P', metadata: {} }, objects: [] }));
      await expect(r.deleteProjectPermanently('p')).rejects.toThrow(/must be trashed/);
      await r.setProjectStatus('p', 'trashed');
      await r.deleteProjectPermanently('p');
      expect(await r.openProject('p')).toBeNull();
    } finally {
      await c.close();
    }
  });
});
