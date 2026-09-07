ALTER TABLE record_field_index ADD COLUMN IF NOT EXISTS normalized_text text;
DROP INDEX IF EXISTS record_field_index_fts_idx;
