import {
  createProjectStorageRevision,
  normalizeProjectBackupMediaEntry,
  validateProjectStorageRevision,
  validateStoredProjectObject,
  type ProjectBackupMediaEntry,
  type ProjectBackupPersistenceRequest,
  type ProjectBackupPersistenceResult,
} from '@electrocraft/application';
import type { ElectroCraftCanonicalSnapshotChecksum, ElectroCraftMetadata, JsonValue } from '@electrocraft/domain';
import { eq } from 'drizzle-orm';
import type { StudioProjectDatabase } from './repository';
import * as schema from './schema';

function asChecksum(value: string) {
  return value as ElectroCraftCanonicalSnapshotChecksum;
}

export function createDrizzleProjectBackupRepository(db: StudioProjectDatabase) {
  async function listProjectBackupMedia(projectId: string): Promise<readonly ProjectBackupMediaEntry[]> {
    const rows = await db.select().from(schema.mediaMetadata).where(eq(schema.mediaMetadata.projectId, projectId));
    return Object.freeze(
      rows
        .map((row) =>
          normalizeProjectBackupMediaEntry({
            mediaId: row.mediaId,
            metadata: row.metadata as ElectroCraftMetadata,
            ...(row.fileName ? { fileName: row.fileName } : {}),
            ...(row.mimeType ? { mimeType: row.mimeType } : {}),
            ...(row.contentBase64 !== null && row.checksum !== null
              ? { contentBase64: row.contentBase64, checksum: asChecksum(row.checksum) }
              : {}),
          }),
        )
        .sort((left, right) => left.mediaId.localeCompare(right.mediaId)),
    );
  }

  async function importProjectBackupSnapshot(
    request: ProjectBackupPersistenceRequest,
  ): Promise<ProjectBackupPersistenceResult> {
    validateProjectStorageRevision(request.saveRequest.revision);
    for (const object of request.saveRequest.objects) validateStoredProjectObject(object);
    const media = request.media.map(normalizeProjectBackupMediaEntry);
    const now = new Date(request.saveRequest.revision.createdAt);

    return db.transaction(async (tx) => {
      const existingProject = (
        await tx
          .select({ id: schema.projects.id })
          .from(schema.projects)
          .where(eq(schema.projects.id, request.saveRequest.project.id))
          .limit(1)
      )[0];

      if ((request.mode === 'import-as-copy' || request.mode === 'reject-collision') && existingProject) {
        throw new Error(`project already exists: ${request.saveRequest.project.id}`);
      }

      let safetyRevisionId: string | null = null;
      if (request.createSafetyCheckpoint && existingProject) {
        const currentRows = await tx
          .select()
          .from(schema.projectObjects)
          .where(eq(schema.projectObjects.projectId, request.saveRequest.project.id));
        const currentObjects = currentRows.map((row) =>
          validateStoredProjectObject({
            projectId: row.projectId,
            objectId: row.objectId,
            kind: row.kind,
            schemaVersion: row.schemaVersion,
            payload: row.payload,
            checksum: asChecksum(row.checksum),
            updatedAt: row.updatedAt.toISOString(),
          }),
        );
        const safetyRevision = createProjectStorageRevision(
          request.saveRequest.project.id,
          currentObjects,
          'pre-restore-safety',
        );
        await tx.insert(schema.projectRevisions).values({
          id: safetyRevision.id,
          projectId: safetyRevision.projectId,
          reason: safetyRevision.reason,
          manifest: safetyRevision.manifest as unknown as JsonValue,
          checksum: safetyRevision.checksum,
          createdAt: new Date(safetyRevision.createdAt),
        });
        safetyRevisionId = safetyRevision.id;
      }

      await tx
        .insert(schema.projects)
        .values({
          id: request.saveRequest.project.id,
          name: request.saveRequest.project.name,
          metadata: request.saveRequest.project.metadata,
          currentRevisionBase: request.saveRequest.revision.id,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            name: request.saveRequest.project.name,
            metadata: request.saveRequest.project.metadata,
            currentRevisionBase: request.saveRequest.revision.id,
            updatedAt: now,
          },
        });

      await tx.delete(schema.projectObjects).where(eq(schema.projectObjects.projectId, request.saveRequest.project.id));
      for (const object of request.saveRequest.objects) {
        await tx.insert(schema.projectObjects).values({
          projectId: object.projectId,
          objectId: object.objectId,
          kind: object.kind,
          schemaVersion: object.schemaVersion,
          payload: object.payload,
          checksum: object.checksum,
          updatedAt: new Date(object.updatedAt),
        });
      }

      await tx.delete(schema.mediaMetadata).where(eq(schema.mediaMetadata.projectId, request.saveRequest.project.id));
      for (const entry of media) {
        await tx.insert(schema.mediaMetadata).values({
          projectId: request.saveRequest.project.id,
          mediaId: entry.mediaId,
          metadata: entry.metadata,
          fileName: entry.fileName ?? null,
          mimeType: entry.mimeType ?? null,
          contentBase64: entry.contentBase64 ?? null,
          checksum: entry.checksum ?? null,
          updatedAt: now,
        });
      }

      await tx.insert(schema.projectRevisions).values({
        id: request.saveRequest.revision.id,
        projectId: request.saveRequest.revision.projectId,
        reason: request.saveRequest.revision.reason,
        manifest: request.saveRequest.revision.manifest as unknown as JsonValue,
        checksum: request.saveRequest.revision.checksum,
        createdAt: now,
      });

      return Object.freeze({
        revision: request.saveRequest.revision,
        safetyRevisionId,
      });
    });
  }

  return Object.freeze({ listProjectBackupMedia, importProjectBackupSnapshot });
}

export type DrizzleProjectBackupRepository = ReturnType<typeof createDrizzleProjectBackupRepository>;
