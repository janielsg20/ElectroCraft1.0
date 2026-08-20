export interface StudioDbMigration {
  readonly id: string;
  readonly checksum: string;
  readonly sql: string;
}

export const studioDbMigrations: readonly StudioDbMigration[] = Object.freeze([
  {
    id: '0001_m04_1_project_storage',
    checksum: 'm04.1:0001:project-storage:v1',
    sql: `
CREATE TABLE IF NOT EXISTS project (
  id text PRIMARY KEY,
  name text NOT NULL,
  schema_version integer NOT NULL,
  project_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_object (
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  object_id text NOT NULL,
  kind text NOT NULL,
  schema_version integer NOT NULL,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  search_document tsvector GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, coalesce(payload::text, ''))) STORED,
  PRIMARY KEY (project_id, object_id)
);
CREATE INDEX IF NOT EXISTS project_object_project_kind_idx ON project_object(project_id, kind);
CREATE INDEX IF NOT EXISTS project_object_search_idx ON project_object USING GIN(search_document);
CREATE TABLE IF NOT EXISTS project_revision (
  id text PRIMARY KEY,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  snapshot_json jsonb NOT NULL,
  checksum text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS project_revision_project_created_idx ON project_revision(project_id, created_at DESC);
CREATE TABLE IF NOT EXISTS app_extension_state (
  extension_id text PRIMARY KEY,
  schema_version integer NOT NULL,
  state_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS capability_snapshot (
  target_id text PRIMARY KEY,
  payload_json jsonb NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS user_preference (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS migration_journal (
  migration_id text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  successful boolean NOT NULL DEFAULT true
);
`,
  },
]);
