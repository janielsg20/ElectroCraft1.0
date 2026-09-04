import { STUDIO_STORAGE_SCHEMA_VERSION } from './schema-contract';

export const M04_1_MIGRATION_CHECKSUM = 'm04.1:storage-schema-v1' as const;
export const M04_3_MIGRATION_CHECKSUM = 'm04.3:incremental-storage-v2' as const;
export const M04_4_MIGRATION_CHECKSUM = 'm04.4:project-home-v3' as const;
export const M04_6_REFERENTIAL_INTEGRITY_CHECKSUM = 'm04.6:referential-integrity-v4' as const;
export const M04_8_REVISION_STORE_CHECKSUM = 'm04.8:revision-object-versions-v5' as const;
export const M08_10_TAXONOMY_TERMS_CHECKSUM = 'm08.10:taxonomy-terms-v6' as const;

export const M04_1_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  parent_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_objects (
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  object_id text NOT NULL,
  kind text NOT NULL,
  schema_version integer NOT NULL CHECK (schema_version > 0),
  payload jsonb NOT NULL,
  checksum text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, object_id)
);
CREATE INDEX IF NOT EXISTS project_objects_kind_idx ON project_objects(project_id, kind);
CREATE TABLE IF NOT EXISTS project_revisions (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reason text NOT NULL,
  manifest jsonb NOT NULL,
  checksum text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_revisions_project_idx ON project_revisions(project_id, created_at);
CREATE TABLE IF NOT EXISTS content_records (
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  id text NOT NULL,
  model_id text NOT NULL,
  data jsonb NOT NULL,
  state text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, id)
);
CREATE INDEX IF NOT EXISTS content_records_model_idx ON content_records(project_id, model_id);
CREATE TABLE IF NOT EXISTS taxonomy_terms (
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  id text NOT NULL,
  taxonomy_id text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (project_id, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_taxonomy_slug_idx ON taxonomy_terms(project_id, taxonomy_id, slug);
CREATE TABLE IF NOT EXISTS record_terms (
  project_id text NOT NULL,
  record_id text NOT NULL,
  term_id text NOT NULL,
  PRIMARY KEY (project_id, record_id, term_id)
);
CREATE TABLE IF NOT EXISTS relation_edges (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  relation_id text NOT NULL,
  from_model_id text NOT NULL,
  from_record_id text NOT NULL,
  to_model_id text NOT NULL,
  to_record_id text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS relation_edges_from_idx ON relation_edges(project_id, from_model_id, from_record_id, relation_id);
CREATE INDEX IF NOT EXISTS relation_edges_to_idx ON relation_edges(project_id, to_model_id, to_record_id, relation_id);
CREATE TABLE IF NOT EXISTS record_field_index (
  project_id text NOT NULL,
  model_id text NOT NULL,
  record_id text NOT NULL,
  field_id text NOT NULL,
  ordinal integer NOT NULL DEFAULT 0,
  value_kind text NOT NULL,
  text_value text,
  numeric_value double precision,
  boolean_value boolean,
  timestamp_value timestamptz,
  searchable boolean NOT NULL DEFAULT false,
  filterable boolean NOT NULL DEFAULT false,
  sortable boolean NOT NULL DEFAULT false,
  faceted boolean NOT NULL DEFAULT false,
  PRIMARY KEY (project_id, record_id, field_id, ordinal)
);
CREATE INDEX IF NOT EXISTS record_field_index_text_idx ON record_field_index(project_id, model_id, field_id, text_value);
CREATE INDEX IF NOT EXISTS record_field_index_number_idx ON record_field_index(project_id, model_id, field_id, numeric_value);
CREATE INDEX IF NOT EXISTS record_field_index_boolean_idx ON record_field_index(project_id, model_id, field_id, boolean_value);
CREATE INDEX IF NOT EXISTS record_field_index_timestamp_idx ON record_field_index(project_id, model_id, field_id, timestamp_value);
CREATE INDEX IF NOT EXISTS record_field_index_fts_idx ON record_field_index USING gin (to_tsvector('simple', coalesce(text_value, ''))) WHERE searchable = true;
CREATE TABLE IF NOT EXISTS workspace_preferences (
  workspace_id text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, key)
);
CREATE TABLE IF NOT EXISTS media_metadata (
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, media_id)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id text PRIMARY KEY,
  project_id text REFERENCES projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_project_idx ON audit_events(project_id, created_at);
CREATE TABLE IF NOT EXISTS storage_migration_journal (
  schema_version integer PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`;

export const M04_3_INCREMENTAL_SQL = `
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_revision_base text;
UPDATE projects AS project
SET current_revision_base = latest.id
FROM (
  SELECT DISTINCT ON (project_id) project_id, id
  FROM project_revisions
  ORDER BY project_id, created_at DESC, id DESC
) AS latest
WHERE project.id = latest.project_id
  AND project.current_revision_base IS NULL;
`;
export const M04_4_PROJECT_HOME_SQL = `
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('active', 'archived', 'trashed'));
CREATE INDEX IF NOT EXISTS projects_status_updated_idx ON projects(status, updated_at DESC);
`;
export const M04_6_REFERENTIAL_INTEGRITY_SQL = `
DELETE FROM record_terms AS child
WHERE NOT EXISTS (SELECT 1 FROM projects AS project WHERE project.id = child.project_id);
DELETE FROM record_field_index AS child
WHERE NOT EXISTS (SELECT 1 FROM projects AS project WHERE project.id = child.project_id);
ALTER TABLE record_terms DROP CONSTRAINT IF EXISTS record_terms_project_id_projects_id_fk;
ALTER TABLE record_terms
  ADD CONSTRAINT record_terms_project_id_projects_id_fk
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE record_field_index DROP CONSTRAINT IF EXISTS record_field_index_project_id_projects_id_fk;
ALTER TABLE record_field_index
  ADD CONSTRAINT record_field_index_project_id_projects_id_fk
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
`;
export const M04_8_REVISION_STORE_SQL = `
CREATE TABLE IF NOT EXISTS project_object_versions (
  project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_id text NOT NULL,
  kind text NOT NULL,
  schema_version integer NOT NULL CHECK (schema_version > 0),
  payload jsonb NOT NULL,
  checksum text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, version_id)
);
CREATE INDEX IF NOT EXISTS project_object_versions_checksum_idx
  ON project_object_versions(project_id, checksum, schema_version, kind);
INSERT INTO project_object_versions(project_id, version_id, kind, schema_version, payload, checksum, created_at)
SELECT
  project_id,
  concat('v:', schema_version, ':', kind, ':', checksum),
  kind,
  schema_version,
  payload,
  checksum,
  updated_at
FROM project_objects
ON CONFLICT (project_id, version_id) DO NOTHING;
`;
export const M08_10_TAXONOMY_TERMS_SQL = `
ALTER TABLE taxonomy_terms ADD COLUMN IF NOT EXISTS parent_id text;
DROP INDEX IF EXISTS taxonomy_terms_taxonomy_idx;
CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_taxonomy_slug_idx
  ON taxonomy_terms(project_id, taxonomy_id, slug);
`;

export interface PGliteMigrationClient {
  exec(query: string): Promise<unknown>;
  query<T extends Record<string, unknown>>(query: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

async function applyMigration(client: PGliteMigrationClient, schemaVersion: number, checksum: string, sql: string) {
  const existing = await client
    .query<{ checksum: string }>('SELECT checksum FROM storage_migration_journal WHERE schema_version = $1', [
      schemaVersion,
    ])
    .catch(() => ({ rows: [] }));

  if (existing.rows[0]?.checksum === checksum) return;
  if (existing.rows.length > 0) throw new Error('storage migration checksum mismatch');

  await client.exec(
    `BEGIN;${sql}\nINSERT INTO storage_migration_journal(schema_version, checksum) VALUES (${schemaVersion}, '${checksum}') ON CONFLICT (schema_version) DO NOTHING;COMMIT;`,
  );
}

export async function applyStudioStorageMigrations(client: PGliteMigrationClient) {
  await client.exec(`CREATE TABLE IF NOT EXISTS storage_migration_journal (
    schema_version integer PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  );`);
  await applyMigration(client, 1, M04_1_MIGRATION_CHECKSUM, M04_1_SCHEMA_SQL);
  await applyMigration(client, 2, M04_3_MIGRATION_CHECKSUM, M04_3_INCREMENTAL_SQL);
  await applyMigration(client, 3, M04_4_MIGRATION_CHECKSUM, M04_4_PROJECT_HOME_SQL);
  await applyMigration(client, 4, M04_6_REFERENTIAL_INTEGRITY_CHECKSUM, M04_6_REFERENTIAL_INTEGRITY_SQL);
  await applyMigration(client, 5, M04_8_REVISION_STORE_CHECKSUM, M04_8_REVISION_STORE_SQL);
  await applyMigration(
    client,
    STUDIO_STORAGE_SCHEMA_VERSION,
    M08_10_TAXONOMY_TERMS_CHECKSUM,
    M08_10_TAXONOMY_TERMS_SQL,
  );
}
