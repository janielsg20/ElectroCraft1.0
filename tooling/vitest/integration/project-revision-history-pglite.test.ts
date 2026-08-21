import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import {
  createProjectStorageService,
  normalizeSaveProjectRequest,
  type ProjectStoragePort,
} from '@electrocraft/application';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as schema from '../../../packages/data-web/src/schema';
describe('M04.8 revisions', () => {
  it('lists summaries and restores old revision by creating a new checkpoint', async () => {
    const c = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(c);
      const r = createDrizzleProjectRepository(drizzle(c, { schema }));
      const service = createProjectStorageService(r as unknown as ProjectStoragePort);
      const first = await r.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'p', name: 'P', metadata: {} },
          objects: [{ objectId: 's', kind: 'screen', schemaVersion: 1, payload: { v: 1 } }],
        }),
      );
      await r.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'p', name: 'P', metadata: {} },
          objects: [{ objectId: 's', kind: 'screen', schemaVersion: 1, payload: { v: 2 } }],
        }),
      );
      expect((await r.listRevisions('p'))[0]).toMatchObject({ objectCount: 1, objectsByKind: { screen: 1 } });
      const restored = await service.restoreRevisionAsCheckpoint('p', first.id);
      expect(restored.reason).toBe('restored-revision');
      expect((await r.openProject('p'))?.objects[0]?.payload).toEqual({ v: 1 });
      expect(await r.listRevisions('p')).toHaveLength(3);
    } finally {
      await c.close();
    }
  });
});
