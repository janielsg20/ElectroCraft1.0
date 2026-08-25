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
