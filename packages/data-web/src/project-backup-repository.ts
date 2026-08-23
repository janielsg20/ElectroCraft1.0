import {
  createProjectBackupPackage,
  createProjectStorageRevision,
  validateStoredProjectObject,
  type NormalizedProjectBackupImportRequest,
  type ProjectBackupImpactSummary,
  type ProjectBackupImportResult,
  type ProjectBackupPackage,
  type ProjectBackupSnapshot,
  type ProjectLifecycleStatus,
  type StoredProjectObject,
} from '@electrocraft/application';
import { createElectroCraftCanonicalSnapshotChecksum, type ElectroCraftMetadata, type JsonValue } from '@electrocraft/domain';
import { eq } from 'drizzle-orm';
import type { StudioProjectDatabase } from './repository';
import * as schema from './schema';

function createId(prefix: string) {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function remapJsonReferences(value: JsonValue, idMap: ReadonlyMap<string, string>): JsonValue {
  if (typeof value === 'string') return idMap.get(value) ?? value;
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => remapJsonReferences(item, idMap));
  const next: Record<string, JsonValue> = {};
  for (const [key, item] of Object.entries(value)) {
    const nextKey = idMap.get(key) ?? key;
    if (Object.hasOwn(next, nextKey)) throw new Error(`duplicate payload key after id remap: ${nextKey}`);
    next[nextKey] = remapJsonReferences(item, idMap);
  }
  return next;
}

function remapMetadata(metadata: ElectroCraftMetadata, idMap: ReadonlyMap<string, string>): ElectroCraftMetadata {
  return remapJsonReferences(metadata as JsonValue, idMap) as ElectroCraftMetadata;
}

function impact(
  request: NormalizedProjectBackupImportRequest,
  projectCollision: boolean,
): ProjectBackupImpactSummary {
  const snapshot = request.package.snapshot;
  return Object.freeze({
    sourceProjectId: snapshot.project.id,
    targetProjectId: request.targetProjectId,
    strategy: request.strategy,
    projectCollision,
    objectCount: snapshot.objects.length,
    contentRecordCount: snapshot.content.records.length,
    taxonomyTermCount: snapshot.content.terms.length,
    relationCount: snapshot.content.relations.length,
    mediaReferenceCount: snapshot.media.length,
    mediaFilesIncluded: false,
  });
}

export function createDrizzleProjectBackupRepository(db: StudioProjectDatabase) {
  async function createProjectBackup(projectId: string): Promise<ProjectBackupPackage> {
    return db.transaction(async (tx) => {
      const project = (await tx.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1))[0];
      if (!project) throw new Error(`project not found: ${projectId}`);

      const [objects, records, terms, recordTerms, relations, media] = await Promise.all([
        tx.select().from(schema.projectObjects).where(eq(schema.projectObjects.projectId, projectId)),
        tx.select().from(schema.contentRecords).where(eq(schema.contentRecords.projectId, projectId)),
        tx.select().from(schema.taxonomyTerms).where(eq(schema.taxonomyTerms.projectId, projectId)),
        tx.select().from(schema.recordTerms).where(eq(schema.recordTerms.projectId, projectId)),
        tx.select().from(schema.relationEdges).where(eq(schema.relationEdges.projectId, projectId)),
        tx.select().from(schema.mediaMetadata).where(eq(schema.mediaMetadata.projectId, projectId)),
      ]);

      const snapshot: ProjectBackupSnapshot = Object.freeze({
        project: Object.freeze({
          id: project.id,
          name: project.name,
          metadata: project.metadata as ElectroCraftMetadata,
        }),
        status: project.status as ProjectLifecycleStatus,
        objects: Object.freeze(
          objects
            .map((row) => {
              const object = validateStoredProjectObject({
                projectId,
                objectId: row.objectId,
                kind: row.kind,
                schemaVersion: row.schemaVersion,
                payload: row.payload,
                checksum: row.checksum as StoredProjectObject['checksum'],
                updatedAt: row.updatedAt.toISOString(),
              });
              return Object.freeze({
                objectId: object.objectId,
                kind: object.kind,
                schemaVersion: object.schemaVersion,
                payload: object.payload,
                checksum: object.checksum,
              });
            })
            .sort((left, right) => left.objectId.localeCompare(right.objectId)),
        ),
        content: Object.freeze({
          records: Object.freeze(
            records
              .map((row) =>
                Object.freeze({
                  id: row.id,
                  modelId: row.modelId,
                  data: row.data,
                  state: row.state,
                  createdAt: row.createdAt.toISOString(),
                  updatedAt: row.updatedAt.toISOString(),
                }),
              )
              .sort((left, right) => left.id.localeCompare(right.id)),
          ),
          terms: Object.freeze(
            terms
              .map((row) =>
                Object.freeze({
                  id: row.id,
                  taxonomyId: row.taxonomyId,
                  slug: row.slug,
                  name: row.name,
                  metadata: row.metadata as ElectroCraftMetadata,
                }),
              )
              .sort((left, right) => left.id.localeCompare(right.id)),
          ),
          recordTerms: Object.freeze(
            recordTerms
              .map((row) => Object.freeze({ recordId: row.recordId, termId: row.termId }))
              .sort((left, right) => `${left.recordId}:${left.termId}`.localeCompare(`${right.recordId}:${right.termId}`)),
          ),
          relations: Object.freeze(
            relations
              .map((row) =>
                Object.freeze({
                  id: row.id,
                  relationId: row.relationId,
                  fromModelId: row.fromModelId,
                  fromRecordId: row.fromRecordId,
                  toModelId: row.toModelId,
                  toRecordId: row.toRecordId,
                  payload: row.payload,
                  createdAt: row.createdAt.toISOString(),
                }),
              )
              .sort((left, right) => left.id.localeCompare(right.id)),
          ),
        }),
        media: Object.freeze(
          media
            .map((row) =>
              Object.freeze({
                mediaId: row.mediaId,
                metadata: row.metadata as ElectroCraftMetadata,
                updatedAt: row.updatedAt.toISOString(),
              }),
            )
            .sort((left, right) => left.mediaId.localeCompare(right.mediaId)),
        ),
      });
      return createProjectBackupPackage(snapshot);
    });
  }

  async function projectExists(projectId: string) {
    return Boolean((await db.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1))[0]);
  }

  async function inspectProjectBackupImport(
    request: NormalizedProjectBackupImportRequest,
  ): Promise<ProjectBackupImpactSummary> {
    return impact(request, await projectExists(request.targetProjectId));
  }

  async function importProjectBackup(
    request: NormalizedProjectBackupImportRequest,
  ): Promise<ProjectBackupImportResult> {
    return db.transaction(async (tx) => {
      const existing = (
        await tx.select({ id: schema.projects.id }).from(schema.projects).where(eq(schema.projects.id, request.targetProjectId)).limit(1)
      )[0];
      const projectCollision = Boolean(existing);
      if (projectCollision && request.strategy === 'reject') {
        throw new Error(`project import collision: ${request.targetProjectId}`);
      }
      if (projectCollision && request.strategy === 'copy') {
        throw new Error(`copy project id already exists: ${request.targetProjectId}`);
      }

      const source = request.package.snapshot;
      const objectIdMap = new Map<string, string>();
      const recordIdMap = new Map<string, string>();
      const termIdMap = new Map<string, string>();
      if (request.strategy === 'copy') {
        for (const object of source.objects) objectIdMap.set(object.objectId, createId('object'));
        for (const record of source.content.records) recordIdMap.set(record.id, createId('record'));
        for (const term of source.content.terms) termIdMap.set(term.id, createId('term'));
      }
      const allIdMap = new Map<string, string>([...objectIdMap, ...recordIdMap, ...termIdMap]);
      const now = new Date();
      let safetyRevisionId: string | null = null;

      if (projectCollision && request.strategy === 'replace') {
        const currentRows = await tx.select().from(schema.projectObjects).where(eq(schema.projectObjects.projectId, request.targetProjectId));
        const safetyObjects = currentRows.map((row) =>
          validateStoredProjectObject({
            projectId: request.targetProjectId,
            objectId: row.objectId,
            kind: row.kind,
            schemaVersion: row.schemaVersion,
            payload: row.payload,
            checksum: createElectroCraftCanonicalSnapshotChecksum(row.payload),
            updatedAt: row.updatedAt.toISOString(),
          }),
        );
        const safety = createProjectStorageRevision(
          request.targetProjectId,
          safetyObjects,
          'pre-import-restore-safety',
        );
        safetyRevisionId = safety.id;
        await tx.insert(schema.projectRevisions).values({
          id: safety.id,
          projectId: safety.projectId,
          reason: safety.reason,
          manifest: safety.manifest as unknown as JsonValue,
          checksum: safety.checksum,
          createdAt: new Date(safety.createdAt),
        });

        await tx.delete(schema.recordFieldIndex).where(eq(schema.recordFieldIndex.projectId, request.targetProjectId));
        await tx.delete(schema.recordTerms).where(eq(schema.recordTerms.projectId, request.targetProjectId));
        await tx.delete(schema.relationEdges).where(eq(schema.relationEdges.projectId, request.targetProjectId));
        await tx.delete(schema.taxonomyTerms).where(eq(schema.taxonomyTerms.projectId, request.targetProjectId));
        await tx.delete(schema.contentRecords).where(eq(schema.contentRecords.projectId, request.targetProjectId));
        await tx.delete(schema.mediaMetadata).where(eq(schema.mediaMetadata.projectId, request.targetProjectId));
        await tx.delete(schema.projectObjects).where(eq(schema.projectObjects.projectId, request.targetProjectId));
      }

      const metadata = request.strategy === 'copy' ? remapMetadata(source.project.metadata, allIdMap) : source.project.metadata;
      await tx
        .insert(schema.projects)
        .values({
          id: request.targetProjectId,
          name: request.targetName,
          metadata,
          status: request.strategy === 'copy' ? 'active' : source.status,
          currentRevisionBase: null,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.projects.id,
          set: {
            name: request.targetName,
            metadata,
            status: source.status,
            updatedAt: now,
          },
        });

      const importedObjects: StoredProjectObject[] = [];
      for (const input of source.objects) {
        const objectId = objectIdMap.get(input.objectId) ?? input.objectId;
        const payload = request.strategy === 'copy' ? remapJsonReferences(input.payload, allIdMap) : input.payload;
        const object = validateStoredProjectObject({
          projectId: request.targetProjectId,
          objectId,
          kind: input.kind,
          schemaVersion: input.schemaVersion,
          payload,
          checksum: createElectroCraftCanonicalSnapshotChecksum(payload),
          updatedAt: now.toISOString(),
        });
        importedObjects.push(object);
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

      for (const record of source.content.records) {
        await tx.insert(schema.contentRecords).values({
          projectId: request.targetProjectId,
          id: recordIdMap.get(record.id) ?? record.id,
          modelId: objectIdMap.get(record.modelId) ?? record.modelId,
          data: request.strategy === 'copy' ? remapJsonReferences(record.data, allIdMap) : record.data,
          state: record.state,
          createdAt: new Date(record.createdAt),
          updatedAt: new Date(record.updatedAt),
        });
      }
      for (const term of source.content.terms) {
        await tx.insert(schema.taxonomyTerms).values({
          projectId: request.targetProjectId,
          id: termIdMap.get(term.id) ?? term.id,
          taxonomyId: objectIdMap.get(term.taxonomyId) ?? term.taxonomyId,
          slug: term.slug,
          name: term.name,
          metadata: request.strategy === 'copy' ? remapMetadata(term.metadata, allIdMap) : term.metadata,
        });
      }
      for (const item of source.content.recordTerms) {
        await tx.insert(schema.recordTerms).values({
          projectId: request.targetProjectId,
          recordId: recordIdMap.get(item.recordId) ?? item.recordId,
          termId: termIdMap.get(item.termId) ?? item.termId,
        });
      }
      for (const relation of source.content.relations) {
        await tx.insert(schema.relationEdges).values({
          id: request.strategy === 'copy' ? createId('relation-edge') : relation.id,
          projectId: request.targetProjectId,
          relationId: objectIdMap.get(relation.relationId) ?? relation.relationId,
          fromModelId: objectIdMap.get(relation.fromModelId) ?? relation.fromModelId,
          fromRecordId: recordIdMap.get(relation.fromRecordId) ?? relation.fromRecordId,
          toModelId: objectIdMap.get(relation.toModelId) ?? relation.toModelId,
          toRecordId: recordIdMap.get(relation.toRecordId) ?? relation.toRecordId,
          payload: request.strategy === 'copy' ? remapJsonReferences(relation.payload, allIdMap) : relation.payload,
          createdAt: new Date(relation.createdAt),
        });
      }
      for (const media of source.media) {
        await tx.insert(schema.mediaMetadata).values({
          projectId: request.targetProjectId,
          mediaId: media.mediaId,
          metadata: request.strategy === 'copy' ? remapMetadata(media.metadata, allIdMap) : media.metadata,
          updatedAt: new Date(media.updatedAt),
        });
      }

      const importedRevision = createProjectStorageRevision(
        request.targetProjectId,
        importedObjects,
        request.strategy === 'replace' ? 'backup-restored' : 'backup-imported',
      );
      await tx.insert(schema.projectRevisions).values({
        id: importedRevision.id,
        projectId: importedRevision.projectId,
        reason: importedRevision.reason,
        manifest: importedRevision.manifest as unknown as JsonValue,
        checksum: importedRevision.checksum,
        createdAt: new Date(importedRevision.createdAt),
      });
      await tx
        .update(schema.projects)
        .set({ currentRevisionBase: importedRevision.id, updatedAt: now })
        .where(eq(schema.projects.id, request.targetProjectId));

      return Object.freeze({
        ...impact(request, projectCollision),
        safetyRevisionId,
        importedRevisionId: importedRevision.id,
      });
    });
  }

  return Object.freeze({ createProjectBackup, inspectProjectBackupImport, importProjectBackup });
}

export type DrizzleProjectBackupRepository = ReturnType<typeof createDrizzleProjectBackupRepository>;
