import {
  createProjectBackupService,
  createProjectStorageService,
  type ProjectStorageDiagnostics,
  type ProjectStoragePort,
} from '@electrocraft/application';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as storageSchema from '../../../packages/data-web/src/schema';

const readyDiagnostics: ProjectStorageDiagnostics = Object.freeze({
  state: 'ready',
  backend: 'memory',
  persistent: false,
  durable: false,
  usageBytes: null,
  quotaBytes: null,
  migrationVersion: 4,
  repairSupported: false,
  message: 'PGlite de prueba listo.',
});

function createTestPort(repository: ReturnType<typeof createDrizzleProjectRepository>): ProjectStoragePort {
  return {
    initialize: async () => readyDiagnostics,
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
    getDiagnostics: async () => readyDiagnostics,
    repair: async () => readyDiagnostics,
    close: async () => undefined,
  };
}

const project = Object.freeze({ id: 'backup-project', name: 'Proyecto portable', metadata: {} });
const object = (version: number) => ({
  objectId: 'screen-home',
  kind: 'screen',
  schemaVersion: 1,
  payload: { version, title: 'Inicio' },
});

describe('M04.6 project backup/import with real PGlite', () => {
  it('round-trips a backup and creates a safety checkpoint before replace', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const storage = createProjectStorageService(createTestPort(repository));
      const backups = createProjectBackupService(storage);

      await storage.saveProject({ project, objects: [object(1)], reason: 'initial' });
      const serialized = await backups.backupProject(project.id);
      await storage.saveProject({ project, objects: [object(99)], reason: 'changed-after-backup' });

      const imported = await backups.importBackup(serialized, 'replace');
      expect(imported).toMatchObject({ projectId: project.id, sourceProjectId: project.id, objectCount: 1, collision: 'replace' });
      expect((await storage.openProject(project.id))?.objects[0]?.payload).toEqual({ version: 1, title: 'Inicio' });

      const safety = await client.query<{ reason: string; manifest: { objects: { payload: { version: number } }[] } }>(
        "SELECT reason, manifest FROM project_revisions WHERE project_id = $1 AND reason = 'pre-import-safety' ORDER BY created_at DESC LIMIT 1",
        [project.id],
      );
      expect(safety.rows).toHaveLength(1);
      expect(safety.rows[0]?.manifest.objects[0]?.payload.version).toBe(99);
    } finally {
      await client.close();
    }
  });

  it('imports a collision as a new copy without overwriting the source', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const storage = createProjectStorageService(createTestPort(repository));
      const backups = createProjectBackupService(storage);
      await storage.saveProject({ project, objects: [object(3)], reason: 'initial' });

      const serialized = await backups.backupProject(project.id);
      const imported = await backups.importBackup(serialized, 'copy');

      expect(imported.projectId).not.toBe(project.id);
      expect(imported.collision).toBe('copy');
      expect((await storage.openProject(project.id))?.objects[0]?.payload).toEqual({ version: 3, title: 'Inicio' });
      expect((await storage.openProject(imported.projectId))?.objects[0]?.payload).toEqual({ version: 3, title: 'Inicio' });
    } finally {
      await client.close();
    }
  });

  it('rejects a corrupted package checksum before any database write', async () => {
    const client = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(client);
      const repository = createDrizzleProjectRepository(drizzle(client, { schema: storageSchema }));
      const storage = createProjectStorageService(createTestPort(repository));
      const backups = createProjectBackupService(storage);
      await storage.saveProject({ project, objects: [object(7)], reason: 'initial' });
      const parsed = JSON.parse(await backups.backupProject(project.id)) as { checksum: string; project: { id: string } };
      parsed.project.id = 'corrupted-project';

      await expect(backups.importBackup(JSON.stringify(parsed), 'replace')).rejects.toThrow('project backup checksum mismatch');
      expect(await storage.openProject('corrupted-project')).toBeNull();
      expect((await storage.openProject(project.id))?.objects[0]?.payload).toEqual({ version: 7, title: 'Inicio' });
    } finally {
      await client.close();
    }
  });
});
