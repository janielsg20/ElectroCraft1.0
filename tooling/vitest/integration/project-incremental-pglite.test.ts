import { normalizeIncrementalSaveProjectRequest, normalizeSaveProjectRequest } from '@electrocraft/application';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as storageSchema from '../../../packages/data-web/src/schema';

const project = Object.freeze({ id: 'project-1', name: 'Proyecto incremental', metadata: {} });
const storedObject = (objectId: string, version: number) => ({
  objectId,
  kind: objectId === 'theme' ? 'theme' : 'screen',
  schemaVersion: 1,
  payload: { version },
});

describe('M04.3 incremental PGlite persistence and recovery', () => {
  it('updates only dirty object rows and preserves the checkpoint base', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const initial = normalizeSaveProjectRequest(
        {
          project,
          objects: [storedObject('screen-home', 1), storedObject('theme', 1)],
          reason: 'initial',
        },
        '2026-08-21T00:00:00.000Z',
      );
      await repository.saveProject(initial);

      const result = await repository.saveProjectIncremental(
        normalizeIncrementalSaveProjectRequest(
          { project, dirtyObjects: [storedObject('screen-home', 2)] },
          '2026-08-21T00:01:00.000Z',
        ),
      );
      const rows = await client.query<{ object_id: string; payload: { version: number }; updated_at: string }>(
        'SELECT object_id, payload, updated_at::text FROM project_objects WHERE project_id = $1 ORDER BY object_id',
        [project.id],
      );

      expect(result).toMatchObject({
        upsertedObjectIds: ['screen-home'],
        deletedObjectIds: [],
        currentRevisionBase: initial.revision.id,
      });
      expect(rows.rows.map(({ object_id, payload }) => [object_id, payload.version])).toEqual([
        ['screen-home', 2],
        ['theme', 1],
      ]);
      expect(rows.rows[0]?.updated_at).not.toBe(rows.rows[1]?.updated_at);
      const revisions = await client.query<{ count: string }>('SELECT count(*)::text AS count FROM project_revisions');
      expect(revisions.rows[0]?.count).toBe('1');
    } finally {
      await client.close();
    }
  });

  it('offers the newest valid checkpoint and restores it after committed object corruption', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      await repository.saveProject(
        normalizeSaveProjectRequest({ project, objects: [storedObject('screen-home', 1)], reason: 'initial' }),
      );
      const checkpoint = await repository.createCheckpoint(project.id, 'pre-publish');
      await repository.saveProjectIncremental(
        normalizeIncrementalSaveProjectRequest({ project, dirtyObjects: [storedObject('screen-home', 2)] }),
      );
      await client.query("UPDATE project_objects SET checksum = 'fnv1a64:0000000000000000' WHERE project_id = $1", [
        project.id,
      ]);

      expect((await repository.verifyProject(project.id)).coherent).toBe(false);
      expect(await repository.findRecoveryCandidate(project.id)).toMatchObject({
        revisionId: checkpoint.id,
        reason: 'pre-publish',
      });
      await repository.restoreRevision(project.id, checkpoint.id);
      expect((await repository.verifyProject(project.id)).coherent).toBe(true);
      expect((await repository.openProject(project.id))?.objects[0]?.payload).toEqual({ version: 1 });
    } finally {
      await client.close();
    }
  });
});
