import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectObjects = pgTable("project_objects", {
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  objectId: text("object_id").notNull(),
  kind: text("kind").notNull(),
  version: integer("version").notNull(),
  payload: jsonb("payload").notNull(),
  checksum: text("checksum").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.objectId] }),
  index("project_objects_kind_idx").on(table.projectId, table.kind),
]);

export const projectRevisions = pgTable("project_revisions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  manifest: jsonb("manifest").notNull(),
  checksum: text("checksum").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("project_revisions_project_idx").on(table.projectId, table.createdAt)]);

export const contentRecords = pgTable("content_records", {
  id: text("id").notNull(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  modelId: text("model_id").notNull(),
  data: jsonb("data").notNull(),
  state: text("state").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.id] }),
  index("content_records_model_idx").on(table.projectId, table.modelId),
]);

export const relationEdges = pgTable("relation_edges", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  relationId: text("relation_id").notNull(),
  fromModelId: text("from_model_id").notNull(),
  fromRecordId: text("from_record_id").notNull(),
  toModelId: text("to_model_id").notNull(),
  toRecordId: text("to_record_id").notNull(),
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("relation_edges_from_idx").on(table.projectId, table.fromModelId, table.fromRecordId, table.relationId),
  index("relation_edges_to_idx").on(table.projectId, table.toModelId, table.toRecordId, table.relationId),
]);

export const recordFieldIndex = pgTable("record_field_index", {
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  modelId: text("model_id").notNull(),
  recordId: text("record_id").notNull(),
  fieldId: text("field_id").notNull(),
  ordinal: integer("ordinal").notNull().default(0),
  valueKind: text("value_kind").notNull(),
  textValue: text("text_value"),
  numericValue: doublePrecision("numeric_value"),
  booleanValue: boolean("boolean_value"),
  timestampValue: timestamp("timestamp_value", { withTimezone: true }),
  faceted: boolean("faceted").notNull().default(false),
}, (table) => [
  primaryKey({ columns: [table.projectId, table.recordId, table.fieldId, table.ordinal] }),
  index("record_field_index_text_idx").on(table.projectId, table.modelId, table.fieldId, table.textValue),
  index("record_field_index_number_idx").on(table.projectId, table.modelId, table.fieldId, table.numericValue),
  index("record_field_index_boolean_idx").on(table.projectId, table.modelId, table.fieldId, table.booleanValue),
  index("record_field_index_timestamp_idx").on(table.projectId, table.modelId, table.fieldId, table.timestampValue),
]);
