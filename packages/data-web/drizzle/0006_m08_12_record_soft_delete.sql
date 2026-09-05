ALTER TABLE content_records ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS content_records_active_model_idx
  ON content_records(project_id, model_id, created_at, id)
  WHERE deleted_at IS NULL;
