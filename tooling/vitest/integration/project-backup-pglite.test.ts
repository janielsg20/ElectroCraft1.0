import {
  createProjectBackupPackage,
  createProjectBackupService,
  normalizeSaveProjectRequest,
  type ProjectStoragePort,
} from '@electrocraft/application';
import {
  applyStudioStorageMigrations,
  createDrizzleProjectBackupRepository,
  createDrizzleProjectRepository,
} from '@electrocraft/data-web';
import { createElectroCraftCanonicalSnapshotChecksum } from '@electrocraft/domain';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import * as storageSchema from '../../../packages/data-web/src/schema';

function asStoragePort(repository: ReturnType<typeof createDrizzleProjectRepository>): ProjectStoragePort {
  return {
    initialize: async () => ({
      state: 'ready',
      backend: 'memory',
      persistent: false,
      durable: false,
      usageBytes: null,
      quotaBytes: null,
      migrationVersion: 5,
      repairSupported: false,
      message: 'ready',
    }),
    saveProject: repository.saveProject,
    saveProjectIncremental: repository.saveProjectIncremental,
    createCheckpoint: repository.createCheckpoint,
    findRecoveryCandidate: repository.findRecoveryCandidate,
    restoreRevision: repository.restoreRevision,
    openProject: repository.openProject,
    listProjects: repository.listProjects,
    setProjectStatus: repository.setProjectStatus,
    renameProject: repository.renameProject,
    duplicateProject: repository.duplicateProject,
    deleteProjectPermanently: repository.deleteProjectPermanently,
    verifyProject: repository.verifyProject,
    getDiagnostics: async () => ({
      state: 'ready',
      backend: 'memory',
      persistent: false,
      durable: false,
      usageBytes: null,
      quotaBytes: null,
      migrationVersion: 5,
      repairSupported: false,
      message: 'ready',
    }),
    repair: async () => ({
      state: 'ready',
      backend: 'memory',
      persistent: false,
      durable: false,
      usageBytes: null,
      quotaBytes: null,
      migrationVersion: 5,
      repairSupported: false,
      message: 'ready',
    }),
    close: async () => undefined,
  };
}

describe('M04.6 backup/import PGlite round-trip', () => {
  it('exports and imports canonical objects plus embedded media as a copy', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const database = drizzle(client, { schema: storageSchema });
      const repository = createDrizzleProjectRepository(database);
      const backupRepository = createDrizzleProjectBackupRepository(database);
      const service = createProjectBackupService(asStoragePort(repository), backupRepository);
      const project = { id: 'backup-source', name: 'Backup source', metadata: { locale: 'es' } };
      await repository.saveProject(
        normalizeSaveProjectRequest({
          project,
          objects: [
            { objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio' } },
            { objectId: 'theme-main', kind: 'theme', schemaVersion: 1, payload: { mode: 'dark' } },
          ],
          reason: 'fixture',
        }),
      );
      const contentBase64 = 'SG9sYSBFbGVjdHJvQ3JhZnQ=';
      await database.insert(storageSchema.mediaMetadata).values({
        projectId: project.id,
        mediaId: 'hero-copy',
        metadata: { alt: 'Hero' },
        fileName: 'hero.txt',
        mimeType: 'text/plain',
        contentBase64,
        checksum: createElectroCraftCanonicalSnapshotChecksum(contentBase64),
      });

      const backup = await service.exportProject(project.id);
      expect(backup.manifest.mediaCount).toBe(1);
      expect(backup.media[0]).toMatchObject({
        mediaId: 'hero-copy',
        fileName: 'hero.txt',
        mimeType: 'text/plain',
        contentBase64,
      });

      const imported = await service.importProject(backup, {
        mode: 'import-as-copy',
        targetProjectId: 'backup-copy',
        name: 'Backup copy',
      });
      const reopened = await repository.openProject(imported.projectId);
      const copiedMedia = await backupRepository.listProjectBackupMedia(imported.projectId);

      expect(imported).toMatchObject({
        sourceProjectId: 'backup-source',
        projectId: 'backup-copy',
        mode: 'import-as-copy',
        safetyRevisionId: null,
      });
      expect(reopened?.project).toMatchObject({ id: 'backup-copy', name: 'Backup copy', metadata: { locale: 'es' } });
      expect(
        reopened?.objects.map(({ objectId, kind, schemaVersion, payload }) => ({
          objectId,
          kind,
          schemaVersion,
          payload,
        })),
      ).toEqual(
        backup.snapshot.objects.map(({ objectId, kind, schemaVersion, payload }) => ({
          objectId,
          kind,
          schemaVersion,
          payload,
        })),
      );
      expect(copiedMedia).toEqual(backup.media);
      expect((await repository.verifyProject('backup-copy')).coherent).toBe(true);
    } finally {
      await client.close();
    }
  });

  it('rejects a tampered package before creating a project row', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const database = drizzle(client, { schema: storageSchema });
      const repository = createDrizzleProjectRepository(database);
      const service = createProjectBackupService(
        asStoragePort(repository),
        createDrizzleProjectBackupRepository(database),
      );
      await repository.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'tamper-source', name: 'Fuente', metadata: {} },
          objects: [{ objectId: 'screen', kind: 'screen', schemaVersion: 1, payload: { value: 1 } }],
        }),
      );
      const backup = await service.exportProject('tamper-source');
      const tampered = {
        ...backup,
        snapshot: {
          ...backup.snapshot,
          objects: [{ ...backup.snapshot.objects[0]!, payload: { value: 999 } }],
        },
      };

      await expect(
        service.importProject(tampered, { mode: 'import-as-copy', targetProjectId: 'tamper-copy' }),
      ).rejects.toThrow();
      expect(await repository.openProject('tamper-copy')).toBeNull();
    } finally {
      await client.close();
    }
  });

  it('persists a pre-restore safety revision in the same transaction before replacing', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const database = drizzle(client, { schema: storageSchema });
      const repository = createDrizzleProjectRepository(database);
      const service = createProjectBackupService(
        asStoragePort(repository),
        createDrizzleProjectBackupRepository(database),
      );

      await repository.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'restore-project', name: 'Versión nueva', metadata: {} },
          objects: [{ objectId: 'screen', kind: 'screen', schemaVersion: 1, payload: { version: 2 } }],
          reason: 'current',
        }),
      );
      await repository.saveProject(
        normalizeSaveProjectRequest({
          project: { id: 'backup-fixture', name: 'Versión backup', metadata: {} },
          objects: [{ objectId: 'screen', kind: 'screen', schemaVersion: 1, payload: { version: 1 } }],
          reason: 'backup',
        }),
      );

      const restoreSource = await repository.openProject('backup-fixture');
      if (!restoreSource) throw new Error('fixture missing');
      const validatedRestore = createProjectBackupPackage({
        project: { ...restoreSource.project, id: 'restore-project', name: 'Versión restaurada' },
        objects: restoreSource.objects.map((object) => ({ ...object, projectId: 'restore-project' })),
        revision: null,
      });

      const result = await service.importProject(validatedRestore, { mode: 'replace-existing' });
      expect(result.safetyRevisionId).toBeTruthy();
      expect((await repository.openProject('restore-project'))?.objects[0]?.payload).toEqual({ version: 1 });
      const safetyRows = await client.query<{ reason: string }>(
        "SELECT reason FROM project_revisions WHERE project_id = $1 AND reason = 'pre-restore-safety'",
        ['restore-project'],
      );
      expect(safetyRows.rows).toHaveLength(1);
    } finally {
      await client.close();
    }
  });
});
