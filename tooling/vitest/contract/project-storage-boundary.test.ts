import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STUDIO_STORAGE_SCHEMA_VERSION, STUDIO_STORAGE_TABLES } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(path, 'utf8');

describe('M04.1 storage ownership boundary', () => {
  it('keeps PGlite and Drizzle out of application ports', () => {
    const application = read('packages/application/src/projects/project-storage.ts');
    expect(application).not.toContain('@electric-sql/pglite');
    expect(application).not.toContain('drizzle-orm');
  });

  it('registers data-web as the nineteenth stable package and twenty-first public alias', () => {
    const boundaries = JSON.parse(read('tooling/package-boundaries.json')) as {
      packages: Record<string, readonly string[]>;
      publicAliases: Record<string, string>;
      invariants: { expectedStablePackageCount: number };
    };
    expect(boundaries.invariants.expectedStablePackageCount).toBe(19);
    expect(Object.keys(boundaries.packages)).toHaveLength(19);
    expect(Object.keys(boundaries.publicAliases)).toHaveLength(21);
    expect(boundaries.packages['@electrocraft/data-web']).toEqual(['@electrocraft/domain', '@electrocraft/application']);
  });

  it('pins one physical schema independent of user-defined model count', () => {
    expect(STUDIO_STORAGE_SCHEMA_VERSION).toBe(1);
    expect(STUDIO_STORAGE_TABLES).toEqual(
      expect.arrayContaining([
        'projects',
        'project_objects',
        'project_revisions',
        'content_records',
        'taxonomy_terms',
        'record_terms',
        'relation_edges',
        'record_field_index',
        'workspace_preferences',
        'media_metadata',
        'audit_events',
      ]),
    );
    const migration = read('packages/data-web/drizzle/0000_m04_1_storage.sql');
    expect(migration).toContain('data jsonb NOT NULL');
    expect(migration).toContain('record_field_index_fts_idx');
    expect(migration).not.toMatch(/CREATE TABLE[^;]*(user_model|dynamic_model)/i);
  });
});
