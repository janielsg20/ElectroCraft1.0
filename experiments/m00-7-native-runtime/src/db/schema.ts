import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentRecords = sqliteTable(
  "content_records",
  {
    id: text("id").primaryKey(),
    modelKey: text("model_key").notNull(),
    dataJson: text("data_json").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("content_records_model_idx").on(table.modelKey)],
);

export const relationEdges = sqliteTable(
  "relation_edges",
  {
    id: text("id").primaryKey(),
    sourceRecordId: text("source_record_id").notNull(),
    relationKey: text("relation_key").notNull(),
    targetRecordId: text("target_record_id").notNull(),
  },
  (table) => [index("relation_edges_source_idx").on(table.sourceRecordId)],
);

export const recordFieldIndex = sqliteTable(
  "record_field_index",
  {
    id: text("id").primaryKey(),
    recordId: text("record_id").notNull(),
    fieldKey: text("field_key").notNull(),
    valueText: text("value_text"),
  },
  (table) => [
    index("record_field_index_lookup_idx").on(table.fieldKey, table.valueText),
    index("record_field_index_record_idx").on(table.recordId),
  ],
);

export const nativeSchema = { contentRecords, relationEdges, recordFieldIndex };
