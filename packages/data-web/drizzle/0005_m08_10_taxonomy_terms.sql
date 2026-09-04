ALTER TABLE taxonomy_terms ADD COLUMN IF NOT EXISTS parent_id text;
DROP INDEX IF EXISTS taxonomy_terms_taxonomy_idx;
CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_taxonomy_slug_idx
  ON taxonomy_terms(project_id, taxonomy_id, slug);
