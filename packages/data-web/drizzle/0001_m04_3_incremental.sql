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
