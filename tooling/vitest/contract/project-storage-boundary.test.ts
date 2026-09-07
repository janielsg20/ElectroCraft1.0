import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { STUDIO_STORAGE_SCHEMA_VERSION, STUDIO_STORAGE_TABLES } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(path, 'utf8');

describe('M04.1 storage ownership boundary', () => {
  it('keeps PGlite and Drizzle out of application ports', () => {
    const application = [
      read('packages/application/src/projects/project-storage.ts'),
      read('packages/application/src/projects/project-revisions.ts'),
    ].join('\n');
    expect(application).not.toContain('@electric-sql/pglite');
    expect(application).not.toContain('drizzle-orm');
  });

  it('keeps raw storage engines out of Studio project UI and runtime wiring', () => {
    const studioSources = [
      read('apps/studio/src/features/projects/project-storage-runtime.ts'),
      read('apps/studio/src/features/projects/revision-history-panel.tsx'),
      read('apps/studio/src/features/projects/storage-settings.tsx'),
      read('apps/studio/src/shell/studio-topbar.tsx'),
    ].join('\n');

    expect(studioSources).not.toContain('@electric-sql/pglite');
    expect(studioSources).not.toContain('drizzle-orm');
    expect(studioSources).not.toMatch(/\bPGlite(?:Worker)?\b/);
    expect(studioSources).toContain('@electrocraft/data-web');
  });

  it('registers data-web with the twenty stable packages and twenty-two public aliases', () => {
    const boundaries = JSON.parse(read('tooling/package-boundaries.json')) as {
      packages: Record<string, readonly string[]>;
      publicAliases: Record<string, string>;
      invariants: { expectedStablePackageCount: number };
    };
    expect(boundaries.invariants.expectedStablePackageCount).toBe(20);
    expect(Object.keys(boundaries.packages)).toHaveLength(20);
    expect(Object.keys(boundaries.publicAliases)).toHaveLength(22);
    expect(boundaries.packages['@electrocraft/data-web']).toEqual([
      '@electrocraft/domain',
      '@electrocraft/application',
    ]);
  });

  it('pins one physical schema independent of user-defined model count', () => {
    expect(STUDIO_STORAGE_SCHEMA_VERSION).toBe(8);
    expect(STUDIO_STORAGE_TABLES).toEqual(
      expect.arrayContaining([
        'projects',
        'project_objects',
        'project_object_versions',
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
    const incrementalMigration = read('packages/data-web/drizzle/0001_m04_3_incremental.sql');
    const integrityMigration = read('packages/data-web/drizzle/0003_m04_6_referential_integrity.sql');
    const revisionMigration = read('packages/data-web/drizzle/0004_m04_8_revision_object_versions.sql');
    const taxonomyMigration = read('packages/data-web/drizzle/0005_m08_10_taxonomy_terms.sql');
    expect(migration).toContain('data jsonb NOT NULL');
    expect(migration).toContain('record_field_index_fts_idx');
    expect(migration).not.toMatch(/CREATE TABLE[^;]*(user_model|dynamic_model)/i);
    expect(incrementalMigration).toContain('current_revision_base');
    expect(integrityMigration).toContain('ON DELETE CASCADE');
    expect(revisionMigration).toContain('project_object_versions');
    expect(revisionMigration).toContain('ON CONFLICT (project_id, version_id) DO NOTHING');
    expect(taxonomyMigration).toContain('parent_id');
    expect(taxonomyMigration).toContain('CREATE UNIQUE INDEX');
  });

  it('keeps autosave incremental and histories session-local', () => {
    const application = read('packages/application/src/projects/project-storage.ts');
    const repository = read('packages/data-web/src/repository.ts');
    const revisionRepository = read('packages/data-web/src/project-revision-repository.ts');
    const autosave = read('apps/studio/src/features/projects/project-storage-autosave.ts');

    expect(application).toContain('dirtyObjects');
    expect(application).toContain('deletedObjectIds');
    expect(repository).toContain('saveProjectIncremental');
    expect(revisionRepository).toContain('projectObjectVersions');
    expect(autosave).toContain('saveProjectIncremental');
    expect([application, repository, revisionRepository, autosave].join('\n')).not.toMatch(
      /PuckHistory|ReteHistory|historySnapshot/,
    );
  });
});
