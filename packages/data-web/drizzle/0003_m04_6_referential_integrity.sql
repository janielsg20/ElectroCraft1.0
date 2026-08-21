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
