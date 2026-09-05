import type { ElectroCraftMetadata, JsonValue } from '@electrocraft/domain';
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
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  metadata: jsonb('metadata').$type<ElectroCraftMetadata>().notNull().default({}),
  currentRevisionBase: text('current_revision_base'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectObjects = pgTable(
  'project_objects',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    objectId: text('object_id').notNull(),
    kind: text('kind').notNull(),
    schemaVersion: integer('schema_version').notNull(),
    payload: jsonb('payload').$type<JsonValue>().notNull(),
    checksum: text('checksum').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.objectId] }),
    index('project_objects_kind_idx').on(table.projectId, table.kind),
  ],
);

export const projectObjectVersions = pgTable(
  'project_object_versions',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    versionId: text('version_id').notNull(),
    kind: text('kind').notNull(),
    schemaVersion: integer('schema_version').notNull(),
    payload: jsonb('payload').$type<JsonValue>().notNull(),
    checksum: text('checksum').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.versionId] }),
    index('project_object_versions_checksum_idx').on(table.projectId, table.checksum, table.schemaVersion, table.kind),
  ],
);

export const projectRevisions = pgTable(
  'project_revisions',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    manifest: jsonb('manifest').$type<JsonValue>().notNull(),
    checksum: text('checksum').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('project_revisions_project_idx').on(table.projectId, table.createdAt)],
);

export const contentRecords = pgTable(
  'content_records',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    modelId: text('model_id').notNull(),
    data: jsonb('data').$type<JsonValue>().notNull(),
    state: text('state').notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.id] }),
    index('content_records_model_idx').on(table.projectId, table.modelId),
  ],
);

export const taxonomyTerms = pgTable(
  'taxonomy_terms',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    taxonomyId: text('taxonomy_id').notNull(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    parentId: text('parent_id'),
    metadata: jsonb('metadata').$type<ElectroCraftMetadata>().notNull().default({}),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.id] }),
    uniqueIndex('taxonomy_terms_taxonomy_slug_idx').on(table.projectId, table.taxonomyId, table.slug),
  ],
);

export const recordTerms = pgTable(
  'record_terms',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    recordId: text('record_id').notNull(),
    termId: text('term_id').notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.recordId, table.termId] })],
);

export const relationEdges = pgTable(
  'relation_edges',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    relationId: text('relation_id').notNull(),
    fromModelId: text('from_model_id').notNull(),
    fromRecordId: text('from_record_id').notNull(),
    toModelId: text('to_model_id').notNull(),
    toRecordId: text('to_record_id').notNull(),
    payload: jsonb('payload').$type<JsonValue>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('relation_edges_from_idx').on(table.projectId, table.fromModelId, table.fromRecordId, table.relationId),
    index('relation_edges_to_idx').on(table.projectId, table.toModelId, table.toRecordId, table.relationId),
  ],
);

export const recordFieldIndex = pgTable(
  'record_field_index',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    modelId: text('model_id').notNull(),
    recordId: text('record_id').notNull(),
    fieldId: text('field_id').notNull(),
    ordinal: integer('ordinal').notNull().default(0),
    valueKind: text('value_kind').notNull(),
    textValue: text('text_value'),
    numericValue: doublePrecision('numeric_value'),
    booleanValue: boolean('boolean_value'),
    timestampValue: timestamp('timestamp_value', { withTimezone: true }),
    searchable: boolean('searchable').notNull().default(false),
    filterable: boolean('filterable').notNull().default(false),
    sortable: boolean('sortable').notNull().default(false),
    faceted: boolean('faceted').notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.recordId, table.fieldId, table.ordinal] }),
    index('record_field_index_text_idx').on(table.projectId, table.modelId, table.fieldId, table.textValue),
    index('record_field_index_number_idx').on(table.projectId, table.modelId, table.fieldId, table.numericValue),
    index('record_field_index_boolean_idx').on(table.projectId, table.modelId, table.fieldId, table.booleanValue),
    index('record_field_index_timestamp_idx').on(table.projectId, table.modelId, table.fieldId, table.timestampValue),
  ],
);

export const workspacePreferences = pgTable(
  'workspace_preferences',
  {
    workspaceId: text('workspace_id').notNull(),
    key: text('key').notNull(),
    value: jsonb('value').$type<JsonValue>().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.workspaceId, table.key] })],
);

export const mediaMetadata = pgTable(
  'media_metadata',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    mediaId: text('media_id').notNull(),
    metadata: jsonb('metadata').$type<ElectroCraftMetadata>().notNull().default({}),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.mediaId] })],
);

export const auditEvents = pgTable(
  'audit_events',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').$type<JsonValue>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('audit_events_project_idx').on(table.projectId, table.createdAt)],
);

export const storageMigrationJournal = pgTable('storage_migration_journal', {
  schemaVersion: integer('schema_version').primaryKey(),
  checksum: text('checksum').notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
});
