import {
  createElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftMetadata,
  type JsonValue,
} from '@electrocraft/domain';
import {
  createProjectStorageRevision,
  projectRevisionSnapshotObjects,
  validateProjectStorageRevision,
  validateStoredProjectObject,
  type NormalizedIncrementalSaveProjectRequest,
  type NormalizedSaveProjectRequest,
  type OpenProjectResult,
  type ProjectIncrementalSaveResult,
  type ProjectIntegrityReport,
  type ProjectRecoveryCandidate,
  type ProjectStorageRevision,
  type ProjectSummary,
  type ProjectLifecycleStatus,
  type ListProjectsRequest,
  type DuplicateProjectRequest,
  type StoredProjectObject,
} from '@electrocraft/application';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';
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
  async function listProjects(request: Required<ListProjectsRequest>): Promise<readonly ProjectSummary[]> {
    const filters = [];
    if (request.status !== 'all') filters.push(eq(schema.projects.status, request.status));
    if (request.search) filters.push(ilike(schema.projects.name, `%${request.search}%`));
    const order =
      request.sort === 'name-asc'
        ? asc(schema.projects.name)
        : request.sort === 'name-desc'
          ? desc(schema.projects.name)
          : request.sort === 'updated-asc'
            ? asc(schema.projects.updatedAt)
            : desc(schema.projects.updatedAt);
    const rows = await db
      .select({
        id: schema.projects.id,
        name: schema.projects.name,
        metadata: schema.projects.metadata,
        status: schema.projects.status,
        createdAt: schema.projects.createdAt,
        updatedAt: schema.projects.updatedAt,
        objectCount: count(schema.projectObjects.objectId),
      })
      .from(schema.projects)
      .leftJoin(schema.projectObjects, eq(schema.projects.id, schema.projectObjects.projectId))
      .where(filters.length ? and(...filters) : undefined)
      .groupBy(schema.projects.id)
      .orderBy(order, asc(schema.projects.id));
    return Object.freeze(
      rows.map((row) =>
        Object.freeze({
          id: row.id,
          name: row.name,
          metadata: row.metadata as ElectroCraftMetadata,
          status: row.status as ProjectLifecycleStatus,
          objectCount: row.objectCount,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        }),
      ),
    );
  }
  async function setProjectStatus(projectId: string, status: ProjectLifecycleStatus): Promise<ProjectSummary> {
    const changed = await db
      .update(schema.projects)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.projects.id, projectId))
      .returning({ id: schema.projects.id });
    if (!changed[0]) throw new Error(`project not found: ${projectId}`);
    const project = (await listProjects({ search: '', status: 'all', sort: 'updated-desc' })).find(
      (item) => item.id === projectId,
    );
    if (!project) throw new Error(`project not found: ${projectId}`);
    return project;
  }
  async function renameProject(projectId: string, name: string): Promise<ProjectSummary> {
    const changed = await db
      .update(schema.projects)
      .set({ name, updatedAt: new Date() })
      .where(eq(schema.projects.id, projectId))
      .returning({ id: schema.projects.id });
    if (!changed[0]) throw new Error(`project not found: ${projectId}`);
    return (await listProjects({ search: '', status: 'all', sort: 'updated-desc' })).find(
      (item) => item.id === projectId,
    )!;
  }
  async function duplicateProject(request: DuplicateProjectRequest): Promise<ProjectSummary> {
    await db.transaction(async (tx) => {
      const source = (
        await tx.select().from(schema.projects).where(eq(schema.projects.id, request.sourceProjectId)).limit(1)
      )[0];
      if (!source) throw new Error(`project not found: ${request.sourceProjectId}`);
      const objects = await tx
        .select()
        .from(schema.projectObjects)
        .where(eq(schema.projectObjects.projectId, request.sourceProjectId));
      const now = new Date();
      await tx
        .insert(schema.projects)
        .values({
          id: request.projectId,
          name: request.name,
          metadata: source.metadata,
          status: 'active',
          currentRevisionBase: null,
          createdAt: now,
          updatedAt: now,
        });
      for (const object of objects) {
        const objectId = globalThis.crypto.randomUUID();
        await tx
          .insert(schema.projectObjects)
          .values({ ...object, projectId: request.projectId, objectId, updatedAt: now });
      }
    });
    return (await listProjects({ search: '', status: 'all', sort: 'updated-desc' })).find(
      (item) => item.id === request.projectId,
    )!;
  }
  async function deleteProjectPermanently(projectId: string): Promise<void> {
    const project = (
      await db
        .select({ status: schema.projects.status })
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .limit(1)
    )[0];
    if (!project) throw new Error(`project not found: ${projectId}`);
    if (project.status !== 'trashed') throw new Error('project must be trashed before permanent deletion');
    await db.delete(schema.projects).where(eq(schema.projects.id, projectId));
  }
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
          currentRevisionBase: request.revision.id,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            name: request.project.name,
            metadata: request.project.metadata,
            currentRevisionBase: request.revision.id,
            updatedAt: now,
          },
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
              and(
                eq(schema.projectObjects.projectId, request.project.id),
                eq(schema.projectObjects.objectId, objectId),
              ),
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

  async function saveProjectIncremental(
    request: NormalizedIncrementalSaveProjectRequest,
  ): Promise<ProjectIncrementalSaveResult> {
    for (const object of request.dirtyObjects) validateStoredProjectObject(object);
    const now = new Date(request.updatedAt);
    let currentRevisionBase: string | null = null;

    await db.transaction(async (tx) => {
      const existingProjects = await tx
        .select({ currentRevisionBase: schema.projects.currentRevisionBase })
        .from(schema.projects)
        .where(eq(schema.projects.id, request.project.id));
      currentRevisionBase = existingProjects[0]?.currentRevisionBase ?? null;

      await tx
        .insert(schema.projects)
        .values({
          id: request.project.id,
          name: request.project.name,
          metadata: request.project.metadata,
          currentRevisionBase,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            name: request.project.name,
            metadata: request.project.metadata,
            currentRevisionBase,
            updatedAt: now,
          },
        });

      for (const objectId of request.deletedObjectIds) {
        await tx
          .delete(schema.projectObjects)
          .where(
            and(eq(schema.projectObjects.projectId, request.project.id), eq(schema.projectObjects.objectId, objectId)),
          );
      }

      for (const object of request.dirtyObjects) {
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
    });

    return Object.freeze({
      projectId: request.project.id,
      updatedAt: request.updatedAt,
      upsertedObjectIds: Object.freeze(request.dirtyObjects.map(({ objectId }) => objectId)),
      deletedObjectIds: Object.freeze([...request.deletedObjectIds]),
      currentRevisionBase,
    });
  }

  async function createCheckpoint(projectId: string, reason: string): Promise<ProjectStorageRevision> {
    return db.transaction(async (tx) => {
      const projectRows = await tx
        .select({ id: schema.projects.id })
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId));
      if (!projectRows[0]) throw new Error(`project not found: ${projectId}`);

      const objectRows = await tx
        .select()
        .from(schema.projectObjects)
        .where(eq(schema.projectObjects.projectId, projectId));
      const objects = objectRows.map(toStoredObject);
      const revision = createProjectStorageRevision(projectId, objects, reason);
      const now = new Date(revision.createdAt);

      await tx.insert(schema.projectRevisions).values({
        id: revision.id,
        projectId: revision.projectId,
        reason: revision.reason,
        manifest: revision.manifest as unknown as JsonValue,
        checksum: revision.checksum,
        createdAt: now,
      });
      await tx
        .update(schema.projects)
        .set({ currentRevisionBase: revision.id, updatedAt: now })
        .where(eq(schema.projects.id, projectId));

      return revision;
    });
  }

  async function findRecoveryCandidate(projectId: string): Promise<ProjectRecoveryCandidate | null> {
    const rows = await db
      .select()
      .from(schema.projectRevisions)
      .where(eq(schema.projectRevisions.projectId, projectId))
      .orderBy(desc(schema.projectRevisions.createdAt));

    for (const row of rows) {
      try {
        const revision = toRevision(row);
        const snapshots = projectRevisionSnapshotObjects(revision);
        if (!snapshots) continue;
        return Object.freeze({
          projectId,
          revisionId: revision.id,
          reason: revision.reason,
          createdAt: revision.createdAt,
          objectCount: snapshots.length,
        });
      } catch {
        // Corrupted/non-restorable revisions are skipped until the newest valid checkpoint is found.
      }
    }
    return null;
  }

  async function restoreRevision(projectId: string, revisionId: string): Promise<ProjectStorageRevision> {
    return db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(schema.projectRevisions)
        .where(and(eq(schema.projectRevisions.projectId, projectId), eq(schema.projectRevisions.id, revisionId)))
        .limit(1);
      if (!rows[0]) throw new Error(`project revision not found: ${revisionId}`);

      const revision = toRevision(rows[0]);
      const snapshots = projectRevisionSnapshotObjects(revision);
      if (!snapshots) throw new Error(`project revision is not restorable: ${revisionId}`);
      const now = new Date();

      await tx.delete(schema.projectObjects).where(eq(schema.projectObjects.projectId, projectId));
      for (const snapshot of snapshots) {
        const object = validateStoredProjectObject({
          ...snapshot,
          projectId,
          checksum: snapshot.checksum as ElectroCraftCanonicalSnapshotChecksum,
          updatedAt: now.toISOString(),
        });
        await tx.insert(schema.projectObjects).values({
          projectId: object.projectId,
          objectId: object.objectId,
          kind: object.kind,
          schemaVersion: object.schemaVersion,
          payload: object.payload,
          checksum: object.checksum,
          updatedAt: now,
        });
      }
      await tx
        .update(schema.projects)
        .set({ currentRevisionBase: revision.id, updatedAt: now })
        .where(eq(schema.projects.id, projectId));

      return revision;
    });
  }

  async function openProject(projectId: string): Promise<OpenProjectResult | null> {
    const projectRows = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId));
    const project = projectRows[0];
    if (!project) return null;
    const objectRows = await db
      .select()
      .from(schema.projectObjects)
      .where(eq(schema.projectObjects.projectId, projectId));
    const revisionRows = project.currentRevisionBase
      ? await db
          .select()
          .from(schema.projectRevisions)
          .where(
            and(
              eq(schema.projectRevisions.projectId, projectId),
              eq(schema.projectRevisions.id, project.currentRevisionBase),
            ),
          )
          .limit(1)
      : await db
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
      objects: Object.freeze(
        objectRows.map(toStoredObject).sort((left, right) => left.objectId.localeCompare(right.objectId)),
      ),
      revision: revisionRows[0] ? toRevision(revisionRows[0]) : null,
    });
  }

  async function verifyProject(projectId: string): Promise<ProjectIntegrityReport> {
    const projectRows = await db
      .select({ id: schema.projects.id, currentRevisionBase: schema.projects.currentRevisionBase })
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId));
    const project = projectRows[0];
    if (!project) {
      return Object.freeze({
        projectId,
        coherent: false,
        checkedObjects: 0,
        invalidObjectIds: Object.freeze([]),
        revisionChecksumValid: false,
      });
    }

    const objectRows = await db
      .select()
      .from(schema.projectObjects)
      .where(eq(schema.projectObjects.projectId, projectId));
    const invalidObjectIds = objectRows
      .filter((object) => createElectroCraftCanonicalSnapshotChecksum(object.payload) !== object.checksum)
      .map(({ objectId }) => objectId)
      .sort();

    let revisionChecksumValid = true;
    if (project.currentRevisionBase) {
      const revisionRows = await db
        .select()
        .from(schema.projectRevisions)
        .where(
          and(
            eq(schema.projectRevisions.projectId, projectId),
            eq(schema.projectRevisions.id, project.currentRevisionBase),
          ),
        )
        .limit(1);
      if (!revisionRows[0]) {
        revisionChecksumValid = false;
      } else {
        try {
          toRevision(revisionRows[0]);
        } catch {
          revisionChecksumValid = false;
        }
      }
    }

    return Object.freeze({
      projectId,
      coherent: invalidObjectIds.length === 0 && revisionChecksumValid,
      checkedObjects: objectRows.length,
      invalidObjectIds: Object.freeze(invalidObjectIds),
      revisionChecksumValid,
    });
  }

  return Object.freeze({
    listProjects,
    setProjectStatus,
    renameProject,
    duplicateProject,
    deleteProjectPermanently,
    saveProject,
    saveProjectIncremental,
    createCheckpoint,
    findRecoveryCandidate,
    restoreRevision,
    openProject,
    verifyProject,
  });
}

export type DrizzleProjectRepository = ReturnType<typeof createDrizzleProjectRepository>;
