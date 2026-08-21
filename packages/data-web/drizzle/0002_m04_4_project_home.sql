ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('active', 'archived', 'trashed'));
CREATE INDEX IF NOT EXISTS projects_status_updated_idx ON projects(status, updated_at DESC);
