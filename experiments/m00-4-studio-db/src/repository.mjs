import { and, eq, inArray, sql } from "drizzle-orm";
import {
  contentRecords,
  projectObjects,
  projectRevisions,
  projects,
  recordFieldIndex,
} from "./schema.mjs";
import { canonicalProjectObject, checksumCanonical } from "./canonical.mjs";
import { buildRecordIndexRows } from "./data-schema.mjs";
import { STUDIO_TABLES } from "./physical-contract.mjs";

export async function upsertProject(db, project) {
  const now = new Date();
  await db.insert(projects).values({ ...project, updatedAt: now }).onConflictDoUpdate({
    target: projects.id,
    set: { name: project.name, status: project.status ?? "active", metadata: project.metadata ?? {}, updatedAt: now },
  });
}

export async function saveProjectObject(db, object) {
  const row = await canonicalProjectObject(object);
  await db.insert(projectObjects).values(row).onConflictDoUpdate({
    target: [projectObjects.projectId, projectObjects.objectId],
    set: {
      kind: row.kind,
      version: row.version,
      payload: row.payload,
      checksum: row.checksum,
      updatedAt: row.updatedAt,
    },
  });
  return row;
}

export async function getProjectObject(db, projectId, objectId) {
  const rows = await db.select().from(projectObjects).where(and(
    eq(projectObjects.projectId, projectId),
    eq(projectObjects.objectId, objectId),
  ));
  return rows[0] ?? null;
}

export async function saveRecordAndIndex(db, { record, schema }) {
  const now = new Date();
  const indexRows = buildRecordIndexRows({
    projectId: record.projectId,
    modelId: record.modelId,
    recordId: record.id,
    data: record.data,
    schema,
  });

  await db.transaction(async (tx) => {
    await tx.insert(contentRecords).values({ ...record, updatedAt: now }).onConflictDoUpdate({
      target: [contentRecords.projectId, contentRecords.id],
      set: { modelId: record.modelId, data: record.data, state: record.state ?? "published", updatedAt: now },
    });
    await tx.delete(recordFieldIndex).where(and(
      eq(recordFieldIndex.projectId, record.projectId),
      eq(recordFieldIndex.recordId, record.id),
    ));
    if (indexRows.length > 0) await tx.insert(recordFieldIndex).values(indexRows);
  });
  return indexRows;
}

export async function queryFacetedText(db, { projectId, modelId, fieldId, value }) {
  const matches = await db.select({ recordId: recordFieldIndex.recordId }).from(recordFieldIndex).where(and(
    eq(recordFieldIndex.projectId, projectId),
    eq(recordFieldIndex.modelId, modelId),
    eq(recordFieldIndex.fieldId, fieldId),
    eq(recordFieldIndex.faceted, true),
    eq(recordFieldIndex.textValue, value),
  ));
  const ids = [...new Set(matches.map((match) => match.recordId))];
  if (ids.length === 0) return [];
  return db.select().from(contentRecords).where(and(
    eq(contentRecords.projectId, projectId),
    eq(contentRecords.modelId, modelId),
    inArray(contentRecords.id, ids),
  ));
}

export async function saveRevision(db, revision) {
  const checksum = await checksumCanonical(revision.manifest);
  await db.insert(projectRevisions).values({ ...revision, checksum });
  return checksum;
}

export async function listElectroCraftPhysicalTables(db) {
  const result = await db.execute(sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`);
  const rows = Array.isArray(result) ? result : result.rows;
  return rows.map((row) => row.tablename).filter((name) => STUDIO_TABLES.includes(name));
}
