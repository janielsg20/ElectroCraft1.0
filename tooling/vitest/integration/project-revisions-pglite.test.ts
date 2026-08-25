import {
  createProjectRevisionService,
  normalizeIncrementalSaveProjectRequest,
  normalizeSaveProjectRequest,
} from '@electrocraft/application';
import { PGlite } from '@electric-sql/pglite';
import {
  applyStudioStorageMigrations,
  createDrizzleProjectRepository,
  createDrizzleProjectRevisionRepository,
} from '@electrocraft/data-web';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import * as storageSchema from '../../../packages/data-web/src/schema';

const PROJECT_ID = 'project-revision-integration';

function initialRequest() {
  return normalizeSaveProjectRequest(
    {
      project: { id: PROJECT_ID, name: 'Proyecto revisiones', metadata: {} },
      objects: [
        { objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio v1' } },
        { objectId: 'component-hero', kind: 'component', schemaVersion: 1, payload: { text: 'Hero estable' } },
      ],
      reason: 'initial',
    },
    '2026-08-24T20:00:00.000Z',
  );
}

describe('M04.8 project revisions with real PGlite', () => {
  it('deduplicates object payload versions and restores without deleting history', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projects = createDrizzleProjectRepository(db);
      const revisionRepository = createDrizzleProjectRevisionRepository(db);
      const revisions = createProjectRevisionService(revisionRepository);

      await projects.saveProject(initialRequest());
      const firstManual = await revisions.saveRevision(PROJECT_ID);

      let versionRows = await client.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM project_object_versions WHERE project_id = $1',
        [PROJECT_ID],
      );
      expect(versionRows.rows).toEqual([{ count: '2' }]);

      await projects.saveProjectIncremental(
        normalizeIncrementalSaveProjectRequest(
          {
            project: { id: PROJECT_ID, name: 'Proyecto revisiones', metadata: {} },
            dirtyObjects: [
              { objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio v2' } },
            ],
          },
          '2026-08-24T20:05:00.000Z',
        ),
      );
      const secondManual = await revisions.saveRevision(PROJECT_ID);

      versionRows = await client.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM project_object_versions WHERE project_id = $1',
        [PROJECT_ID],
      );
      expect(versionRows.rows).toEqual([{ count: '3' }]);

      const latestManifest = await client.query<{ manifest: { objects: Array<Record<string, unknown>> } }>(
        'SELECT manifest FROM project_revisions WHERE id = $1',
        [secondManual.id],
      );
      expect(latestManifest.rows[0]?.manifest.objects).toHaveLength(2);
      expect(latestManifest.rows[0]?.manifest.objects.every((entry) => typeof entry.versionId === 'string')).toBe(true);
      expect(latestManifest.rows[0]?.manifest.objects.some((entry) => 'payload' in entry)).toBe(false);

      const historyBeforeRestore = await revisions.list(PROJECT_ID);
      const second = historyBeforeRestore.find((entry) => entry.revisionId === secondManual.id);
      expect(second).toMatchObject({
        restorable: true,
        diagnostic: null,
        diff: { changed: 1, added: 0, removed: 0, unchanged: 1 },
      });

      const recovery = await revisions.recoveryCandidate(PROJECT_ID);
      expect(recovery).toMatchObject({
        projectId: PROJECT_ID,
        revisionId: secondManual.id,
        objectCount: 2,
      });

      const restored = await revisions.restore(PROJECT_ID, firstManual.id);
      expect(restored.restoredFromRevisionId).toBe(firstManual.id);
      expect(restored.safetyRevisionId).not.toBe(firstManual.id);
      expect(restored.currentRevision.id).not.toBe(firstManual.id);
      expect(restored.currentRevision.reason).toBe(`restore:${firstManual.id}`);

      const opened = await projects.openProject(PROJECT_ID);
      expect(opened?.objects.find((object) => object.objectId === 'screen-home')?.payload).toEqual({ title: 'Inicio v1' });

      const historyAfterRestore = await revisions.list(PROJECT_ID);
      expect(historyAfterRestore[0]?.source).toBe('restore');
      expect(historyAfterRestore[0]?.restorable).toBe(true);
      expect(historyAfterRestore.some((entry) => entry.revisionId === restored.safetyRevisionId)).toBe(true);
      expect(historyAfterRestore.some((entry) => entry.revisionId === firstManual.id)).toBe(true);
      expect(historyAfterRestore.some((entry) => entry.revisionId === secondManual.id)).toBe(true);

      versionRows = await client.query<{ count: string }>(
        'SELECT COUNT(*)::text AS count FROM project_object_versions WHERE project_id = $1',
        [PROJECT_ID],
      );
      expect(versionRows.rows).toEqual([{ count: '3' }]);
    } finally {
      await client.close();
    }
  });

  it('marks a broken newest revision as blocked and returns the next restorable checkpoint', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projects = createDrizzleProjectRepository(db);
      const revisionRepository = createDrizzleProjectRevisionRepository(db);
      const revisions = createProjectRevisionService(revisionRepository);

      await projects.saveProject(initialRequest());
      const stable = await revisions.saveRevision(PROJECT_ID);
      await projects.saveProjectIncremental(
        normalizeIncrementalSaveProjectRequest(
          {
            project: { id: PROJECT_ID, name: 'Proyecto revisiones', metadata: {} },
            dirtyObjects: [
              { objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio roto' } },
            ],
          },
          '2026-08-24T20:10:00.000Z',
        ),
      );
      const broken = await revisions.saveRevision(PROJECT_ID);
      await client.query("UPDATE project_revisions SET created_at = created_at + interval '1 second' WHERE id = $1", [
        broken.id,
      ]);
      const refs = await client.query<{ version_id: string }>(
        `SELECT item->>'versionId' AS version_id
         FROM project_revisions, jsonb_array_elements(manifest->'objects') AS item
         WHERE id = $1 AND item->>'objectId' = 'screen-home'`,
        [broken.id],
      );
      await client.query('DELETE FROM project_object_versions WHERE project_id = $1 AND version_id = $2', [
        PROJECT_ID,
        refs.rows[0]!.version_id,
      ]);

      const history = await revisions.list(PROJECT_ID);
      const blocked = history.find((entry) => entry.revisionId === broken.id);
      expect(blocked).toMatchObject({
        restorable: false,
        diagnostic: {
          code: 'REVISION_NOT_RESTORABLE',
          location: `project_revisions/${broken.id}`,
        },
      });
      expect(blocked?.diagnostic?.cause).toContain('project object version not found');
      await expect(revisions.recoveryCandidate(PROJECT_ID)).resolves.toMatchObject({
        revisionId: stable.id,
        objectCount: 2,
      });
    } finally {
      await client.close();
    }
  });

  it('fails restore visibly when a referenced object version is missing', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projects = createDrizzleProjectRepository(db);
      const revisionRepository = createDrizzleProjectRevisionRepository(db);
      const revisions = createProjectRevisionService(revisionRepository);

      await projects.saveProject(initialRequest());
      const revision = await revisions.saveRevision(PROJECT_ID);
      const refs = await client.query<{ version_id: string }>(
        `SELECT item->>'versionId' AS version_id
         FROM project_revisions, jsonb_array_elements(manifest->'objects') AS item
         WHERE id = $1
         LIMIT 1`,
        [revision.id],
      );
      await client.query('DELETE FROM project_object_versions WHERE project_id = $1 AND version_id = $2', [
        PROJECT_ID,
        refs.rows[0]!.version_id,
      ]);

      await expect(revisions.restore(PROJECT_ID, revision.id)).rejects.toThrow('project object version not found');
    } finally {
      await client.close();
    }
  });
});
