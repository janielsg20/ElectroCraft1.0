import {
  createProjectBackupPackage,
  parseProjectBackupPackage,
  serializeProjectBackupPackage,
  type ProjectBackupCollisionStrategy,
  type ProjectBackupImportResult,
  type ProjectBackupPackage,
} from './project-backup';
import type { ProjectStorageService, StoredProjectObjectInput } from './project-storage';

export interface ProjectBackupServiceOptions {
  readonly checkpointBeforeReplace?: (projectId: string) => Promise<unknown>;
}

function importedName(name: string, copied: boolean) {
  return copied ? `${name} — copia importada` : name;
}

export function createProjectBackupService(
  storage: ProjectStorageService,
  options: ProjectBackupServiceOptions = {},
) {
  const checkpointBeforeReplace =
    options.checkpointBeforeReplace ??
    ((projectId: string) => storage.createCheckpoint(projectId, 'pre-import-safety'));

  return Object.freeze({
    async backupProject(projectId: string): Promise<string> {
      const opened = await storage.openProject(projectId);
      if (!opened) throw new Error(`project not found: ${projectId}`);
      return serializeProjectBackupPackage(createProjectBackupPackage(opened));
    },

    previewImport(serialized: string): ProjectBackupPackage {
      return parseProjectBackupPackage(serialized);
    },

    async importBackup(
      serialized: string,
      collisionStrategy: ProjectBackupCollisionStrategy = 'copy',
    ): Promise<ProjectBackupImportResult> {
      const backup = parseProjectBackupPackage(serialized);
      const existing = await storage.openProject(backup.project.id);
      if (existing && collisionStrategy === 'reject') {
        throw new Error(`project already exists: ${backup.project.id}`);
      }

      const copied = Boolean(existing && collisionStrategy === 'copy');
      const projectId = copied ? globalThis.crypto.randomUUID() : backup.project.id;
      if (existing && collisionStrategy === 'replace') {
        await checkpointBeforeReplace(existing.project.id);
      }

      const objects: readonly StoredProjectObjectInput[] = backup.objects.map((object) => ({
        objectId: object.objectId,
        kind: object.kind,
        schemaVersion: object.schemaVersion,
        payload: object.payload,
        checksum: object.checksum,
      }));
      await storage.saveProject({
        project: {
          id: projectId,
          name: importedName(backup.project.name, copied),
          metadata: backup.project.metadata,
        },
        objects,
        reason: 'import-backup',
      });

      return Object.freeze({
        projectId,
        sourceProjectId: backup.project.id,
        objectCount: objects.length,
        collision: existing ? collisionStrategy : 'none',
        checksum: backup.checksum,
      });
    },
  });
}

export type ProjectBackupService = ReturnType<typeof createProjectBackupService>;
