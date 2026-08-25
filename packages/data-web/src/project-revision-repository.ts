import {
  inferProjectRevisionActor,
  inferProjectRevisionSource,
  summarizeProjectRevisionDiff,
  type ProjectObjectVersionReference,
  type ProjectRevisionActor,
  type ProjectRevisionHistoryEntry,
  type ProjectRevisionPort,
  type ProjectRevisionRestoreResult,
  type ProjectRevisionSource,
  type ProjectStorageRevision,
} from '@electrocraft/application';
import {
  createElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftCanonicalSnapshotChecksum,
  type JsonValue,
} from '@electrocraft/domain';
import { and, desc, eq } from 'drizzle-orm';
import type { StudioProjectDatabase } from './repository';
import * as schema from './schema';

type RevisionRow = typeof schema.projectRevisions.$inferSelect;
type ProjectObjectRow = typeof schema.projectObjects.$inferSelect;
type ProjectTransaction = Parameters<Parameters<StudioProjectDatabase['transaction']>[0]>[0];

type VersionIdentity = Readonly<{
  kind: string;
  schemaVersion: number;
  checksum: ElectroCraftCanonicalSnapshotChecksum;
}>;

interface EnhancedRevisionManifest {
  readonly schemaVersion: 1;
  readonly projectId: string;
  readonly revisionId: string;
  readonly timestamp: string;
  readonly reason: string;
  readonly actor: ProjectRevisionActor;
  readonly source: ProjectRevisionSource;
  readonly objects: readonly ProjectObjectVersionReference[];
}

interface ParsedRevision {
  readonly revision: ProjectStorageRevision;
  readonly entries: readonly ProjectObjectVersionReference[];
  readonly actor: ProjectRevisionActor;
  readonly source: ProjectRevisionSource;
  readonly timestamp: string;
  readonly payloads: ReadonlyMap<string, JsonValue>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function versionIdFor(entry: VersionIdentity) {
  return `v:${entry.schemaVersion}:${entry.kind}:${entry.checksum}`;
}

function isRevisionSource(value: unknown): value is ProjectRevisionSource {
  return (
    value === 'initial' ||
    value === 'manual' ||
    value === 'automatic' ||
    value === 'pre-import' ||
    value === 'pre-migration' ||
    value === 'publish' ||
    value === 'export' ||
    value === 'restore' ||
    value === 'recovery'
  );
}

function isRevisionActor(value: unknown): value is ProjectRevisionActor {
  return value === 'user' || value === 'system';
}

function parseRevision(row: RevisionRow): ParsedRevision {
  const manifest = asRecord(row.manifest);
  if (!manifest || manifest.projectId !== row.projectId || !Array.isArray(manifest.objects)) {
    throw new Error(`invalid project revision manifest: ${row.id}`);
  }
  const checksum = createElectroCraftCanonicalSnapshotChecksum(row.manifest);
  if (checksum !== row.checksum) throw new Error(`project revision checksum mismatch: ${row.id}`);

  const payloads = new Map<string, JsonValue>();
  const entries = manifest.objects.map((value) => {
    const entry = asRecord(value);
    if (
      !entry ||
      typeof entry.objectId !== 'string' ||
      typeof entry.kind !== 'string' ||
      typeof entry.schemaVersion !== 'number' ||
      !Number.isSafeInteger(entry.schemaVersion) ||
      entry.schemaVersion < 1 ||
      typeof entry.checksum !== 'string'
    ) {
      throw new Error(`invalid project revision object reference: ${row.id}`);
    }
    const checksum = entry.checksum as ElectroCraftCanonicalSnapshotChecksum;
    const reference: ProjectObjectVersionReference = Object.freeze({
      objectId: entry.objectId,
      kind: entry.kind,
      schemaVersion: entry.schemaVersion,
      checksum,
      versionId:
        typeof entry.versionId === 'string' && entry.versionId
          ? entry.versionId
          : versionIdFor({ kind: entry.kind, schemaVersion: entry.schemaVersion, checksum }),
    });
    if (entry.payload !== undefined) payloads.set(reference.objectId, entry.payload as JsonValue);
    return reference;
  });
  const source = isRevisionSource(manifest.source) ? manifest.source : inferProjectRevisionSource(row.reason);
  const actor = isRevisionActor(manifest.actor) ? manifest.actor : inferProjectRevisionActor(source);
  const timestamp =
    typeof manifest.timestamp === 'string' && !Number.isNaN(new Date(manifest.timestamp).getTime())
      ? new Date(manifest.timestamp).toISOString()
      : row.createdAt.toISOString();

  return Object.freeze({
    revision: Object.freeze({
      id: row.id,
      projectId: row.projectId,
      reason: row.reason,
      manifest: row.manifest as unknown as ProjectStorageRevision['manifest'],
      checksum: row.checksum as ElectroCraftCanonicalSnapshotChecksum,
      createdAt: row.createdAt.toISOString(),
    }),
    entries: Object.freeze(entries),
    actor,
    source,
    timestamp,
    payloads,
  });
}

function createRevisionDiagnostic(row: RevisionRow, cause: unknown) {
  return Object.freeze({
    code: 'REVISION_NOT_RESTORABLE' as const,
    location: `project_revisions/${row.id}`,
    cause: cause instanceof Error ? cause.message : 'Fallo de integridad desconocido en la revisión.',
    action: 'Conserva esta revisión como evidencia y restaura otra versión válida. Revisa Almacenamiento si el problema se repite.',
  });
}

function toStoredObject(row: ProjectObjectRow) {
  return Object.freeze({
    projectId: row.projectId,
    objectId: row.objectId,
    kind: row.kind,
    schemaVersion: row.schemaVersion,
    payload: row.payload,
    checksum: row.checksum as ElectroCraftCanonicalSnapshotChecksum,
    updatedAt: row.updatedAt.toISOString(),
  });
}

async function createReferenceRevision(
  tx: ProjectTransaction,
  projectId: string,
  objects: readonly ReturnType<typeof toStoredObject>[],
  reason: string,
  timestamp = new Date().toISOString(),
): Promise<ProjectStorageRevision> {
  const revisionId = globalThis.crypto.randomUUID();
  const source = inferProjectRevisionSource(reason);
  const actor = inferProjectRevisionActor(source);
  const references: ProjectObjectVersionReference[] = [];

  for (const object of [...objects].sort((left, right) => left.objectId.localeCompare(right.objectId))) {
    const versionId = versionIdFor(object);
    await tx
      .insert(schema.projectObjectVersions)
      .values({
        projectId,
        versionId,
        kind: object.kind,
        schemaVersion: object.schemaVersion,
        payload: object.payload,
        checksum: object.checksum,
        createdAt: new Date(object.updatedAt),
      })
      .onConflictDoNothing({ target: [schema.projectObjectVersions.projectId, schema.projectObjectVersions.versionId] });
    references.push(
      Object.freeze({
        objectId: object.objectId,
        kind: object.kind,
        schemaVersion: object.schemaVersion,
        checksum: object.checksum,
        versionId,
      }),
    );
  }

  const manifest: EnhancedRevisionManifest = Object.freeze({
    schemaVersion: 1,
    projectId,
    revisionId,
    timestamp,
    reason,
    actor,
    source,
    objects: Object.freeze(references),
  });
  const checksum = createElectroCraftCanonicalSnapshotChecksum(manifest as unknown as JsonValue);
  await tx.insert(schema.projectRevisions).values({
    id: revisionId,
    projectId,
    reason,
    manifest: manifest as unknown as JsonValue,
    checksum,
    createdAt: new Date(timestamp),
  });

  return Object.freeze({
    id: revisionId,
    projectId,
    reason,
    manifest: manifest as unknown as ProjectStorageRevision['manifest'],
    checksum,
    createdAt: timestamp,
  });
}

async function hydrateRevisionObjects(tx: ProjectTransaction, parsed: ParsedRevision) {
  const result: Array<{
    projectId: string;
    objectId: string;
    kind: string;
    schemaVersion: number;
    payload: JsonValue;
    checksum: ElectroCraftCanonicalSnapshotChecksum;
    updatedAt: string;
  }> = [];
  const updatedAt = new Date().toISOString();

  for (const entry of parsed.entries) {
    const legacyPayload = parsed.payloads.get(entry.objectId);
    if (legacyPayload !== undefined) {
      if (createElectroCraftCanonicalSnapshotChecksum(legacyPayload) !== entry.checksum) {
        throw new Error(`legacy revision object checksum mismatch: ${entry.objectId}`);
      }
      result.push(Object.freeze({ ...entry, projectId: parsed.revision.projectId, payload: legacyPayload, updatedAt }));
      continue;
    }

    const rows = await tx
      .select()
      .from(schema.projectObjectVersions)
      .where(
        and(
          eq(schema.projectObjectVersions.projectId, parsed.revision.projectId),
          eq(schema.projectObjectVersions.versionId, entry.versionId),
        ),
      )
      .limit(1);
    const version = rows[0];
    if (!version) throw new Error(`project object version not found: ${entry.versionId}`);
    if (
      version.checksum !== entry.checksum ||
      version.kind !== entry.kind ||
      version.schemaVersion !== entry.schemaVersion ||
      createElectroCraftCanonicalSnapshotChecksum(version.payload) !== entry.checksum
    ) {
      throw new Error(`project object version integrity failure: ${entry.versionId}`);
    }
    result.push(
      Object.freeze({
        projectId: parsed.revision.projectId,
        objectId: entry.objectId,
        kind: entry.kind,
        schemaVersion: entry.schemaVersion,
        payload: version.payload,
        checksum: entry.checksum,
        updatedAt,
      }),
    );
  }

  return Object.freeze(result);
}

export function createDrizzleProjectRevisionRepository(db: StudioProjectDatabase): ProjectRevisionPort {
  return Object.freeze({
    async createCheckpoint(projectId: string, reason: string) {
      return db.transaction(async (tx) => {
        const projects = await tx
          .select({ id: schema.projects.id })
          .from(schema.projects)
          .where(eq(schema.projects.id, projectId))
          .limit(1);
        if (!projects[0]) throw new Error(`project not found: ${projectId}`);
        const rows = await tx
          .select()
          .from(schema.projectObjects)
          .where(eq(schema.projectObjects.projectId, projectId));
        const revision = await createReferenceRevision(tx, projectId, rows.map(toStoredObject), reason);
        await tx
          .update(schema.projects)
          .set({ currentRevisionBase: revision.id, updatedAt: new Date(revision.createdAt) })
          .where(eq(schema.projects.id, projectId));
        return revision;
      });
    },

    async listRevisionHistory(projectId: string): Promise<readonly ProjectRevisionHistoryEntry[]> {
      const rows = await db
        .select()
        .from(schema.projectRevisions)
        .where(eq(schema.projectRevisions.projectId, projectId))
        .orderBy(desc(schema.projectRevisions.createdAt), desc(schema.projectRevisions.id));

      const parsed = rows.map((row) => {
        try {
          return Object.freeze({ revision: parseRevision(row), error: null as unknown });
        } catch (error) {
          return Object.freeze({ revision: null, error });
        }
      });
      const previousEntries: Array<readonly ProjectObjectVersionReference[]> = new Array(rows.length);
      let olderEntries: readonly ProjectObjectVersionReference[] = [];
      for (let index = rows.length - 1; index >= 0; index -= 1) {
        previousEntries[index] = olderEntries;
        const current = parsed[index]?.revision;
        if (current) olderEntries = current.entries;
      }

      const history: ProjectRevisionHistoryEntry[] = [];
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index]!;
        const current = parsed[index]!;
        if (!current.revision) {
          const source = inferProjectRevisionSource(row.reason);
          history.push(
            Object.freeze({
              revisionId: row.id,
              projectId,
              timestamp: row.createdAt.toISOString(),
              reason: row.reason,
              actor: inferProjectRevisionActor(source),
              source,
              objectCount: 0,
              diff: summarizeProjectRevisionDiff([], []),
              restorable: false,
              diagnostic: createRevisionDiagnostic(row, current.error),
            }),
          );
          continue;
        }

        let diagnostic: ProjectRevisionHistoryEntry['diagnostic'] = null;
        try {
          await db.transaction(async (tx) => {
            await hydrateRevisionObjects(tx, current.revision!);
          });
        } catch (cause) {
          diagnostic = createRevisionDiagnostic(row, cause);
        }

        history.push(
          Object.freeze({
            revisionId: current.revision.revision.id,
            projectId,
            timestamp: current.revision.timestamp,
            reason: current.revision.revision.reason,
            actor: current.revision.actor,
            source: current.revision.source,
            objectCount: current.revision.entries.length,
            diff: summarizeProjectRevisionDiff(previousEntries[index] ?? [], current.revision.entries),
            restorable: diagnostic === null,
            diagnostic,
          }),
        );
      }
      return Object.freeze(history);
    },

    async restoreRevision(projectId: string, revisionId: string): Promise<ProjectRevisionRestoreResult> {
      return db.transaction(async (tx) => {
        const selectedRows = await tx
          .select()
          .from(schema.projectRevisions)
          .where(and(eq(schema.projectRevisions.projectId, projectId), eq(schema.projectRevisions.id, revisionId)))
          .limit(1);
        if (!selectedRows[0]) throw new Error(`project revision not found: ${revisionId}`);
        const selected = parseRevision(selectedRows[0]);
        const targetObjects = await hydrateRevisionObjects(tx, selected);

        const currentRows = await tx
          .select()
          .from(schema.projectObjects)
          .where(eq(schema.projectObjects.projectId, projectId));
        const safetyTimestamp = new Date().toISOString();
        const safetyRevision = await createReferenceRevision(
          tx,
          projectId,
          currentRows.map(toStoredObject),
          'pre-restore-safety',
          safetyTimestamp,
        );

        await tx.delete(schema.projectObjects).where(eq(schema.projectObjects.projectId, projectId));
        const restoreTimestamp = new Date(new Date(safetyTimestamp).getTime() + 1).toISOString();
        const now = new Date(restoreTimestamp);
        for (const object of targetObjects) {
          await tx.insert(schema.projectObjects).values({
            projectId,
            objectId: object.objectId,
            kind: object.kind,
            schemaVersion: object.schemaVersion,
            payload: object.payload,
            checksum: object.checksum,
            updatedAt: now,
          });
        }

        const restoredRevision = await createReferenceRevision(
          tx,
          projectId,
          targetObjects.map((object) => ({ ...object, updatedAt: restoreTimestamp })),
          `restore:${revisionId}`,
          restoreTimestamp,
        );
        await tx
          .update(schema.projects)
          .set({ currentRevisionBase: restoredRevision.id, updatedAt: now })
          .where(eq(schema.projects.id, projectId));

        return Object.freeze({
          projectId,
          restoredFromRevisionId: revisionId,
          safetyRevisionId: safetyRevision.id,
          currentRevision: restoredRevision,
        });
      });
    },
  });
}
