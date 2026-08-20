import {
  createElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftMetadata,
  type JsonValue,
} from '@electrocraft/domain';
import {
  validateProjectStorageRevision,
  validateStoredProjectObject,
  type NormalizedSaveProjectRequest,
  type OpenProjectResult,
  type ProjectIntegrityReport,
  type ProjectStorageRevision,
  type StoredProjectObject,
} from '@electrocraft/application';
import { and, desc, eq } from 'drizzle-orm';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';

export type StudioProjectDatabase = PgliteDatabase<typeof schema>;

function asChecksum(value: string) {
  return value as ElectroCraftCanonicalSnapshotChecksum;
}

function toStoredObject(row: typeof schema.projectObjects.$inferSelect): StoredProjectObject {
  return validateStoredProjectObject({
    projectId: row.projectId,
    objectId: row.objectId,
    kind: row.kind,
    schemaVersion: row.schemaVersion,
    payload: row.payload,
    checksum: asChecksum(row.checksum),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function toRevision(row: typeof schema.projectRevisions.$inferSelect): ProjectStorageRevision {
  return validateProjectStorageRevision({
    id: row.id,
    projectId: row.projectId,
    reason: row.reason,
    manifest: row.manifest as unknown as ProjectStorageRevision['manifest'],
    checksum: asChecksum(row.checksum),
    createdAt: row.createdAt.toISOString(),
  });
}

export function createDrizzleProjectRepository(db: StudioProjectDatabase) {
  async function saveProject(request: NormalizedSaveProjectRequest): Promise<ProjectStorageRevision> {
    validateProjectStorageRevision(request.revision);
    for (const object of request.objects) validateStoredProjectObject(object);
    const now = new Date(request.revision.createdAt);

    await db.transaction(async (tx) => {
      await tx
        .insert(schema.projects)
        .values({
          id: request.project.id,
          name: request.project.name,
          metadata: request.project.metadata,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: { name: request.project.name, metadata: request.project.metadata, updatedAt: now },
        });

      const expectedIds = request.objects.map(({ objectId }) => objectId);
      if (expectedIds.length === 0) {
        await tx.delete(schema.projectObjects).where(eq(schema.projectObjects.projectId, request.project.id));
      } else {
        const existing = await tx
          .select({ objectId: schema.projectObjects.objectId })
          .from(schema.projectObjects)
          .where(eq(schema.projectObjects.projectId, request.project.id));
        const staleIds = existing.map(({ objectId }) => objectId).filter((objectId) => !expectedIds.includes(objectId));
        for (const objectId of staleIds) {
          await tx
            .delete(schema.projectObjects)
            .where(
              and(eq(schema.projectObjects.projectId, request.project.id), eq(schema.projectObjects.objectId, objectId)),
            );
        }
      }

      for (const object of request.objects) {
        await tx
          .insert(schema.projectObjects)
          .values({
            projectId: object.projectId,
            objectId: object.objectId,
            kind: object.kind,
            schemaVersion: object.schemaVersion,
            payload: object.payload,
            checksum: object.checksum,
            updatedAt: new Date(object.updatedAt),
          })
          .onConflictDoUpdate({
            target: [schema.projectObjects.projectId, schema.projectObjects.objectId],
            set: {
              kind: object.kind,
              schemaVersion: object.schemaVersion,
              payload: object.payload,
              checksum: object.checksum,
              updatedAt: new Date(object.updatedAt),
            },
          });
      }

      await tx.insert(schema.projectRevisions).values({
        id: request.revision.id,
        projectId: request.revision.projectId,
        reason: request.revision.reason,
        manifest: request.revision.manifest as unknown as JsonValue,
        checksum: request.revision.checksum,
        createdAt: now,
      });
    });

    return request.revision;
  }

  async function openProject(projectId: string): Promise<OpenProjectResult | null> {
    const projectRows = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
    const project = projectRows[0];
    if (!project) return null;
    const objectRows = await db.select().from(schema.projectObjects).where(eq(schema.projectObjects.projectId, projectId));
    const revisionRows = await db
      .select()
      .from(schema.projectRevisions)
      .where(eq(schema.projectRevisions.projectId, projectId))
      .orderBy(desc(schema.projectRevisions.createdAt))
      .limit(1);

    return Object.freeze({
      project: Object.freeze({
        id: project.id,
        name: project.name,
        metadata: project.metadata as ElectroCraftMetadata,
      }),
      objects: Object.freeze(objectRows.map(toStoredObject).sort((left, right) => left.objectId.localeCompare(right.objectId))),
      revision: revisionRows[0] ? toRevision(revisionRows[0]) : null,
    });
  }

  async function verifyProject(projectId: string): Promise<ProjectIntegrityReport> {
    const projectRows = await db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.id, projectId));
    if (!projectRows[0]) {
      return Object.freeze({
        projectId,
        coherent: false,
        checkedObjects: 0,
        invalidObjectIds: Object.freeze([]),
        revisionChecksumValid: false,
      });
    }

    const objectRows = await db.select().from(schema.projectObjects).where(eq(schema.projectObjects.projectId, projectId));
    const invalidObjectIds = objectRows
      .filter((object) => createElectroCraftCanonicalSnapshotChecksum(object.payload) !== object.checksum)
      .map(({ objectId }) => objectId)
      .sort();

    const revisionRows = await db
      .select()
      .from(schema.projectRevisions)
      .where(eq(schema.projectRevisions.projectId, projectId))
      .orderBy(desc(schema.projectRevisions.createdAt))
      .limit(1);

    let revisionChecksumValid = true;
    let manifestMatches = true;
    if (revisionRows[0]) {
      try {
        const revision = toRevision(revisionRows[0]);
        const manifestIds = revision.manifest.objects.map(({ objectId }) => objectId).sort();
        const actualIds = objectRows.map(({ objectId }) => objectId).sort();
        manifestMatches = JSON.stringify(manifestIds) === JSON.stringify(actualIds);
      } catch {
        revisionChecksumValid = false;
        manifestMatches = false;
      }
    }

    return Object.freeze({
      projectId,
      coherent: invalidObjectIds.length === 0 && revisionChecksumValid && manifestMatches,
      checkedObjects: objectRows.length,
      invalidObjectIds: Object.freeze(invalidObjectIds),
      revisionChecksumValid,
    });
  }

  return Object.freeze({ saveProject, openProject, verifyProject });
}

export type DrizzleProjectRepository = ReturnType<typeof createDrizzleProjectRepository>;
