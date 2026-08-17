export const STUDIO_TABLES = Object.freeze([
  "projects",
  "project_objects",
  "project_revisions",
  "content_records",
  "relation_edges",
  "record_field_index",
]);

export const MIGRATION_STATEMENTS = Object.freeze([
  `CREATE TABLE IF NOT EXISTS projects (
    id text PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS project_objects (
    project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    object_id text NOT NULL,
    kind text NOT NULL,
    version integer NOT NULL,
    payload jsonb NOT NULL,
    checksum text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, object_id)
  )`,
  `CREATE INDEX IF NOT EXISTS project_objects_kind_idx ON project_objects (project_id, kind)`,
  `CREATE TABLE IF NOT EXISTS project_revisions (
    id text PRIMARY KEY,
    project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reason text NOT NULL,
    manifest jsonb NOT NULL,
    checksum text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS project_revisions_project_idx ON project_revisions (project_id, created_at)`,
  `CREATE TABLE IF NOT EXISTS content_records (
    id text NOT NULL,
    project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    model_id text NOT NULL,
    data jsonb NOT NULL,
    state text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, id)
  )`,
  `CREATE INDEX IF NOT EXISTS content_records_model_idx ON content_records (project_id, model_id)`,
  `CREATE TABLE IF NOT EXISTS relation_edges (
    id text PRIMARY KEY,
    project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    relation_id text NOT NULL,
    from_model_id text NOT NULL,
    from_record_id text NOT NULL,
    to_model_id text NOT NULL,
    to_record_id text NOT NULL,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS relation_edges_from_idx ON relation_edges (project_id, from_model_id, from_record_id, relation_id)`,
  `CREATE INDEX IF NOT EXISTS relation_edges_to_idx ON relation_edges (project_id, to_model_id, to_record_id, relation_id)`,
  `CREATE TABLE IF NOT EXISTS record_field_index (
    project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    model_id text NOT NULL,
    record_id text NOT NULL,
    field_id text NOT NULL,
    ordinal integer NOT NULL DEFAULT 0,
    value_kind text NOT NULL,
    text_value text,
    numeric_value double precision,
    boolean_value boolean,
    timestamp_value timestamptz,
    faceted boolean NOT NULL DEFAULT false,
    PRIMARY KEY (project_id, record_id, field_id, ordinal)
  )`,
  `CREATE INDEX IF NOT EXISTS record_field_index_text_idx ON record_field_index (project_id, model_id, field_id, text_value)`,
  `CREATE INDEX IF NOT EXISTS record_field_index_number_idx ON record_field_index (project_id, model_id, field_id, numeric_value)`,
  `CREATE INDEX IF NOT EXISTS record_field_index_boolean_idx ON record_field_index (project_id, model_id, field_id, boolean_value)`,
  `CREATE INDEX IF NOT EXISTS record_field_index_timestamp_idx ON record_field_index (project_id, model_id, field_id, timestamp_value)`,
]);

export const MIGRATION_SQL = `${MIGRATION_STATEMENTS.join(";\n")}\n`;
export const DRIZZLE_MIGRATION_SQL = `${MIGRATION_STATEMENTS.join(";\n--> statement-breakpoint\n")}\n`;
