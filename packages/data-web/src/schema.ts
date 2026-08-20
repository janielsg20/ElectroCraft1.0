import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import type { JsonValue } from '@electrocraft/domain';

export const projectTable = pgTable('project', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  schemaVersion: integer('schema_version').notNull(),
  projectJson: jsonb('project_json').$type<JsonValue>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectObjectTable = pgTable(
  'project_object',
  {
    projectId: text('project_id').notNull().references(() => projectTable.id, { onDelete: 'cascade' }),
    objectId: text('object_id').notNull(),
    kind: text('kind').notNull(),
    schemaVersion: integer('schema_version').notNull(),
    payload: jsonb('payload').$type<JsonValue>().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.objectId] }),
    index('project_object_project_kind_idx').on(table.projectId, table.kind),
  ],
);

export const projectRevisionTable = pgTable(
  'project_revision',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().references(() => projectTable.id, { onDelete: 'cascade' }),
    snapshot: jsonb('snapshot_json').$type<JsonValue>().notNull(),
    checksum: text('checksum').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('project_revision_project_created_idx').on(table.projectId, table.createdAt)],
);

export const appExtensionStateTable = pgTable('app_extension_state', {
  extensionId: text('extension_id').primaryKey(),
  schemaVersion: integer('schema_version').notNull(),
  state: jsonb('state_json').$type<JsonValue>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const capabilitySnapshotTable = pgTable('capability_snapshot', {
  targetId: text('target_id').primaryKey(),
  payload: jsonb('payload_json').$type<JsonValue>().notNull(),
  capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userPreferenceTable = pgTable('user_preference', {
  key: text('key').primaryKey(),
  value: jsonb('value_json').$type<JsonValue>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const migrationJournalTable = pgTable('migration_journal', {
  migrationId: text('migration_id').primaryKey(),
  checksum: text('checksum').notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull().defaultNow(),
  successful: boolean('successful').notNull().default(true),
});
