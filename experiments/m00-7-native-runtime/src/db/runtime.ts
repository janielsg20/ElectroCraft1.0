import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { contentRecords, nativeSchema } from "./schema";

export type ElectroCraftContentRecord = {
  id: string;
  modelKey: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

let sqlite: SQLiteDatabase | null = null;
let initialized = false;

function getRuntime() {
  if (!sqlite) sqlite = openDatabaseSync("electrocraft-m007.db");
  const orm = drizzle(sqlite, { schema: nativeSchema });
  return { sqlite, orm };
}

export async function ensureNativeSchema() {
  const runtime = getRuntime();
  if (initialized) return runtime;
  await runtime.sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS content_records (
      id TEXT PRIMARY KEY NOT NULL,
      model_key TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS content_records_model_idx ON content_records(model_key);
    CREATE TABLE IF NOT EXISTS relation_edges (
      id TEXT PRIMARY KEY NOT NULL,
      source_record_id TEXT NOT NULL,
      relation_key TEXT NOT NULL,
      target_record_id TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS relation_edges_source_idx ON relation_edges(source_record_id);
    CREATE TABLE IF NOT EXISTS record_field_index (
      id TEXT PRIMARY KEY NOT NULL,
      record_id TEXT NOT NULL,
      field_key TEXT NOT NULL,
      value_text TEXT
    );
    CREATE INDEX IF NOT EXISTS record_field_index_lookup_idx ON record_field_index(field_key, value_text);
    CREATE INDEX IF NOT EXISTS record_field_index_record_idx ON record_field_index(record_id);
  `);
  initialized = true;
  return runtime;
}

function fromRow(row: typeof contentRecords.$inferSelect): ElectroCraftContentRecord {
  return {
    id: row.id,
    modelKey: row.modelKey,
    data: JSON.parse(row.dataJson) as Record<string, unknown>,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listContentRecords(modelKey?: string) {
  const { orm } = await ensureNativeSchema();
  const rows = modelKey
    ? await orm.select().from(contentRecords).where(eq(contentRecords.modelKey, modelKey))
    : await orm.select().from(contentRecords);
  return rows.map(fromRow);
}

export async function getContentRecord(id: string) {
  const { orm } = await ensureNativeSchema();
  const rows = await orm.select().from(contentRecords).where(eq(contentRecords.id, id)).limit(1);
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function upsertContentRecord(record: ElectroCraftContentRecord) {
  const { orm } = await ensureNativeSchema();
  await orm.insert(contentRecords).values({
    id: record.id,
    modelKey: record.modelKey,
    dataJson: JSON.stringify(record.data),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }).onConflictDoUpdate({
    target: contentRecords.id,
    set: { modelKey: record.modelKey, dataJson: JSON.stringify(record.data), updatedAt: record.updatedAt },
  });
  return record;
}

export async function deleteContentRecord(id: string) {
  const current = await getContentRecord(id);
  if (!current) return null;
  const { orm } = await ensureNativeSchema();
  await orm.delete(contentRecords).where(eq(contentRecords.id, id));
  return current;
}
