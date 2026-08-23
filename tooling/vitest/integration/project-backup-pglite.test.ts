import {
  normalizeProjectBackupImportRequest,
  normalizeSaveProjectRequest,
} from '@electrocraft/application';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import {
  applyStudioStorageMigrations,
  createDrizzleProjectBackupRepository,
  createDrizzleProjectRepository,
} from '@electrocraft/data-web';
import * as storageSchema from '../../../packages/data-web/src/schema';

function sourceProject() {
  return normalizeSaveProjectRequest({
    project: { id: 'project-1', name: 'Portal', metadata: { entry: 'screen-home' } },
    objects: [
      {
        objectId: 'screen-home',
        kind: 'screen',
        schemaVersion: 1,
        payload: { title: 'Inicio', model: 'model-products', featured: 'record-1' },
      },
      {
        objectId: 'model-products',
        kind: 'data-schema',
        schemaVersion: 1,
        payload: { name: 'Productos' },
      },
    ],
    reason: 'backup-fixture',
  });
}

async function createFixture() {
  const client = await PGlite.create('memory://');
  await applyStudioStorageMigrations(client);
  const db = drizzle(client, { schema: storageSchema });
  const projects = createDrizzleProjectRepository(db);
  const backups = createDrizzleProjectBackupRepository(db);
  await projects.saveProject(sourceProject());
  await db.insert(storageSchema.contentRecords).values({
    projectId: 'project-1',
    id: 'record-1',
    modelId: 'model-products',
    data: { screen: 'screen-home', label: 'Uno' },
    state: 'published',
  });
  await db.insert(storageSchema.taxonomyTerms).values({
    projectId: 'project-1',
    id: 'term-1',
    taxonomyId: 'model-products',
    slug: 'destacado',
    name: 'Destacado',
    metadata: { screen: 'screen-home' },
  });
  await db.insert(storageSchema.recordTerms).values({ projectId: 'project-1', recordId: 'record-1', termId: 'term-1' });
  await db.insert(storageSchema.relationEdges).values({
    id: 'edge-1',
    projectId: 'project-1',
    relationId: 'model-products',
    fromModelId: 'model-products',
    fromRecordId: 'record-1',
    toModelId: 'model-products',
    toRecordId: 'record-1',
    payload: { screen: 'screen-home' },
  });
  await db.insert(storageSchema.mediaMetadata).values({
    projectId: 'project-1',
    mediaId: 'media-1',
    metadata: { usedBy: 'screen-home', filename: 'hero.png' },
  });
  return { client, db, projects, backups };
}

describe('M04.6 PGlite project backup/import/restore', () => {
  it('round-trips canonical objects, content entities and media references as an independent copy', async () => {
    const { client, db, projects, backups } = await createFixture();
    try {
      const backup = await backups.createProjectBackup('project-1');
      expect(backup.manifest.objectCount).toBe(2);
      expect(backup.manifest.contentRecordCount).toBe(1);
      expect(backup.manifest.taxonomyTermCount).toBe(1);
      expect(backup.manifest.relationCount).toBe(1);
      expect(backup.manifest.mediaReferenceCount).toBe(1);
      expect(backup.manifest.mediaFilesIncluded).toBe(false);

      const request = normalizeProjectBackupImportRequest({
        package: backup,
        strategy: 'copy',
        copyProjectId: 'project-copy',
        copyName: 'Portal importado',
      });
      const inspected = await backups.inspectProjectBackupImport(request);
      expect(inspected.projectCollision).toBe(false);
      const result = await backups.importProjectBackup(request);
      expect(result.safetyRevisionId).toBeNull();

      const copied = await projects.openProject('project-copy');
      expect(copied?.project.name).toBe('Portal importado');
      expect(copied?.objects).toHaveLength(2);
      const copiedScreen = copied!.objects.find(({ kind }) => kind === 'screen')!;
      const copiedModel = copied!.objects.find(({ kind }) => kind === 'data-schema')!;
      expect(copiedScreen.objectId).not.toBe('screen-home');
      expect(copiedModel.objectId).not.toBe('model-products');
      expect(copiedScreen.payload).toMatchObject({ model: copiedModel.objectId });
      expect(copied?.project.metadata).toEqual({ entry: copiedScreen.objectId });

      const records = await db.select().from(storageSchema.contentRecords);
      const copyRecord = records.find(({ projectId }) => projectId === 'project-copy')!;
      expect(copyRecord.id).not.toBe('record-1');
      expect(copyRecord.modelId).toBe(copiedModel.objectId);
      expect(copyRecord.data).toMatchObject({ screen: copiedScreen.objectId });

      const media = await db.select().from(storageSchema.mediaMetadata);
      const copyMedia = media.find(({ projectId }) => projectId === 'project-copy')!;
      expect(copyMedia.mediaId).toBe('media-1');
      expect(copyMedia.metadata).toMatchObject({ usedBy: copiedScreen.objectId });
      expect((await projects.verifyProject('project-copy')).coherent).toBe(true);
    } finally {
      await client.close();
    }
  });

  it('rejects a collision by default without mutating the existing project', async () => {
    const { client, projects, backups } = await createFixture();
    try {
      const backup = await backups.createProjectBackup('project-1');
      const before = await projects.openProject('project-1');
      await expect(
        backups.importProjectBackup(normalizeProjectBackupImportRequest({ package: backup })),
      ).rejects.toThrow(/collision/);
      const after = await projects.openProject('project-1');
      expect(after?.revision?.id).toBe(before?.revision?.id);
      expect(after?.objects.map(({ checksum }) => checksum)).toEqual(before?.objects.map(({ checksum }) => checksum));
    } finally {
      await client.close();
    }
  });

  it('creates a same-transaction safety revision before replacing an existing project', async () => {
    const { client, db, projects, backups } = await createFixture();
    try {
      const backup = await backups.createProjectBackup('project-1');
      await projects.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'project-1', name: 'Portal mutado', metadata: {} },
          objects: [
            {
              objectId: 'screen-home',
              kind: 'screen',
              schemaVersion: 1,
              payload: { title: 'Mutado' },
            },
          ],
          reason: 'mutation-before-restore',
        }),
      );

      const result = await backups.importProjectBackup(
        normalizeProjectBackupImportRequest({ package: backup, strategy: 'replace' }),
      );
      expect(result.safetyRevisionId).toBeTruthy();
      const restored = await projects.openProject('project-1');
      expect(restored?.project.name).toBe('Portal');
      expect(restored?.objects.find(({ kind }) => kind === 'screen')?.payload).toMatchObject({ title: 'Inicio' });

      const revisions = await db.select().from(storageSchema.projectRevisions);
      const safety = revisions.find(({ id }) => id === result.safetyRevisionId);
      const imported = revisions.find(({ id }) => id === result.importedRevisionId);
      expect(safety?.reason).toBe('pre-import-restore-safety');
      expect(imported?.reason).toBe('backup-restored');
      expect(safety?.manifest).toMatchObject({
        objects: [expect.objectContaining({ payload: { title: 'Mutado' } })],
      });
    } finally {
      await client.close();
    }
  });
});
