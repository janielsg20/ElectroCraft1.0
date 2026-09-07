export const STUDIO_STORAGE_SCHEMA_VERSION = 8 as const;

export const STUDIO_STORAGE_TABLES = Object.freeze([
  'projects',
  'project_objects',
  'project_object_versions',
  'project_revisions',
  'content_records',
  'taxonomy_terms',
  'record_terms',
  'relation_edges',
  'record_field_index',
  'workspace_preferences',
  'media_metadata',
  'audit_events',
  'storage_migration_journal',
] as const);

export type StudioStorageTableName = (typeof STUDIO_STORAGE_TABLES)[number];

export function isStudioStorageTableName(value: string): value is StudioStorageTableName {
  return (STUDIO_STORAGE_TABLES as readonly string[]).includes(value);
}
