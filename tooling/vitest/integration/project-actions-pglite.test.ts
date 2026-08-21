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
          objects: [
            { objectId: 'screen-1', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio' } },
            {
              objectId: 'navigation-1',
              kind: 'navigation',
              schemaVersion: 1,
              payload: { homeId: 'screen-1', orderedIds: ['screen-1'], byId: { 'screen-1': true } },
            },
          ],
        }),
      );
      await r.renameProject('source', 'Renombrado');
      const copy = await r.duplicateProject({ sourceProjectId: 'source', projectId: 'copy', name: 'Copia' });
      expect(copy.name).toBe('Copia');
      const opened = await r.openProject('copy');
      expect(opened?.objects).toHaveLength(2);
      const copiedScreen = opened?.objects.find(({ kind }) => kind === 'screen');
      const copiedNavigation = opened?.objects.find(({ kind }) => kind === 'navigation');
      expect(copiedScreen?.objectId).not.toBe('screen-1');
      expect(copiedScreen?.payload).toEqual({ title: 'Inicio' });
      expect(copiedNavigation?.payload).toEqual({
        homeId: copiedScreen?.objectId,
        orderedIds: [copiedScreen?.objectId],
        byId: { [copiedScreen!.objectId]: true },
      });
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
      await c.exec(`
        INSERT INTO record_terms(project_id, record_id, term_id) VALUES ('p', 'record-1', 'term-1');
        INSERT INTO record_field_index(project_id, model_id, record_id, field_id, value_kind)
        VALUES ('p', 'model-1', 'record-1', 'field-1', 'text');
      `);
      await expect(r.deleteProjectPermanently('p')).rejects.toThrow(/must be trashed/);
      await r.setProjectStatus('p', 'trashed');
      await r.deleteProjectPermanently('p');
      expect(await r.openProject('p')).toBeNull();
      const orphanCounts = await c.query<{ record_terms: number; field_index: number }>(`
        SELECT
          (SELECT count(*)::int FROM record_terms WHERE project_id = 'p') AS record_terms,
          (SELECT count(*)::int FROM record_field_index WHERE project_id = 'p') AS field_index
      `);
      expect(orphanCounts.rows[0]).toEqual({ record_terms: 0, field_index: 0 });
    } finally {
      await c.close();
    }
  });
});
