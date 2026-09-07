import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_STORAGE_SCHEMA_VERSION } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('M08.13 GenericFieldIndexer architecture boundary', () => {
  it('keeps one generic typed index without per-field DDL or expression indexes', () => {
    const schema = read('packages/data-web/src/schema.ts');
    const migration = read('packages/data-web/drizzle/0007_m08_13_generic_field_index.sql');
    const indexer = read('packages/data-web/src/generic-field-indexer.ts');
    expect(STUDIO_STORAGE_SCHEMA_VERSION).toBe(8);
    expect(schema).toContain("'record_field_index'");
    expect(schema).toContain("normalizedText: text('normalized_text')");
    expect(migration).toContain('DROP INDEX IF EXISTS record_field_index_fts_idx');
    expect(migration).not.toMatch(/CREATE\s+(?:UNIQUE\s+)?INDEX/i);
    expect(indexer).not.toMatch(/CREATE TABLE|ALTER TABLE|CREATE INDEX/i);
    expect(indexer).toContain('db.transaction');
    expect(indexer).toContain('replaceRecordIndex');
  });

  it('keeps query/rebuild access behind ConnectorRegistry and exposes explicit Studio flags', () => {
    const adapter = read('packages/connectors/src/generic-field-index-adapter.ts');
    const studioRuntime = read('apps/studio/src/features/data/data-model-index-runtime.ts');
    const editor = read('apps/studio/src/features/data/advanced-field-editor.tsx');
    expect(adapter).toContain('dataModelIndexResourceId');
    expect(adapter).toContain('repository.queryRecords');
    expect(studioRuntime).toContain('dataSourceWorkspaceRuntime.registry');
    expect(editor).toContain('Búsqueda y filtros');
    for (const label of ['Searchable', 'Filterable', 'Sortable', 'Faceted']) expect(editor).toContain(label);
    expect(editor).not.toMatch(/SELECT |INSERT |UPDATE |DELETE FROM/i);
  });
});
