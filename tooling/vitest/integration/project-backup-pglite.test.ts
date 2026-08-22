import {
  createProjectBackupService,
  normalizeSaveProjectRequest,
  type ProjectStoragePort,
} from '@electrocraft/application';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
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
      migrationVersion: 1,
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
      migrationVersion: 1,
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
      migrationVersion: 1,
      repairSupported: false,
      message: 'ready',
    }),
    close: async () => undefined,
  };
}

describe('M04.6 backup/import PGlite round-trip', () => {
  it('exports, validates, imports as copy and reopens the same canonical objects', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const port = asStoragePort(repository);
      const service = createProjectBackupService(port);
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

      const backup = await service.exportProject(project.id);
      const imported = await service.importProject(backup, {
        mode: 'import-as-copy',
        targetProjectId: 'backup-copy',
        name: 'Backup copy',
      });
      const reopened = await repository.openProject(imported.projectId);

      expect(imported).toMatchObject({
        sourceProjectId: 'backup-source',
        projectId: 'backup-copy',
        mode: 'import-as-copy',
        safetyRevisionId: null,
      });
      expect(reopened?.project).toMatchObject({ id: 'backup-copy', name: 'Backup copy', metadata: { locale: 'es' } });
      expect(reopened?.objects.map(({ objectId, kind, schemaVersion, payload }) => ({ objectId, kind, schemaVersion, payload }))).toEqual(
        backup.snapshot.objects.map(({ objectId, kind, schemaVersion, payload }) => ({ objectId, kind, schemaVersion, payload })),
      );
      expect((await repository.verifyProject('backup-copy')).coherent).toBe(true);
    } finally {
      await client.close();
    }
  });

  it('rejects a tampered package before creating a project row', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const service = createProjectBackupService(asStoragePort(repository));
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

  it('persists a pre-restore safety revision before replacing an existing project', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const service = createProjectBackupService(asStoragePort(repository));

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
      const backup = await service.exportProject('backup-fixture');
      const restorePackage = {
        ...backup,
        manifest: { ...backup.manifest, projectId: 'restore-project' },
        snapshot: { ...backup.snapshot, project: { ...backup.snapshot.project, id: 'restore-project' } },
      };

      // Re-export through the contract to produce a checksum matching the target project id.
      const fixturePort = asStoragePort(repository);
      const targetBackup = await createProjectBackupService(fixturePort).exportProject('restore-project');
      const packageToRestore = {
        ...targetBackup,
        snapshot: {
          ...targetBackup.snapshot,
          project: { ...targetBackup.snapshot.project, name: 'Versión restaurada' },
          objects: backup.snapshot.objects,
        },
      };
      // Deliberately reuse the validated builder path instead of hand-authoring a checksum.
      const restoreSource = await repository.openProject('backup-fixture');
      if (!restoreSource) throw new Error('fixture missing');
      const { createProjectBackupPackage } = await import('@electrocraft/application');
      const validatedRestore = createProjectBackupPackage({
        ...restoreSource,
        project: { ...restoreSource.project, id: 'restore-project', name: 'Versión restaurada' },
        objects: restoreSource.objects.map((object) => ({ ...object, projectId: 'restore-project' })),
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
