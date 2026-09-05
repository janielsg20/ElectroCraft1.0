import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_STORAGE_SCHEMA_VERSION } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('M08.12 record CRUD architecture boundary', () => {
  it('keeps one generic store, canonical validation, soft delete and ConnectorRegistry writes', () => {
    const schema = read('packages/data-web/src/schema.ts');
    const migration = read('packages/data-web/drizzle/0006_m08_12_record_soft_delete.sql');
    const repository = read('packages/data-web/src/internal-data-repository.ts');
    const adapter = read('packages/connectors/src/internal-data-source-adapter.ts');
    const validator = read('packages/connectors/src/record-validation.ts');
    const workspace = read('apps/studio/src/features/data/records-workspace.tsx');
    expect(STUDIO_STORAGE_SCHEMA_VERSION).toBe(7);
    expect(schema).toContain("'content_records'");
    expect(schema).toContain("deletedAt: timestamp('deleted_at'");
    expect(migration).toContain('ALTER TABLE content_records ADD COLUMN IF NOT EXISTS deleted_at');
    expect(repository).toContain("set({ state: 'deleted', deletedAt: now");
    expect(repository).not.toMatch(/CREATE TABLE|user_model|dynamic_model/i);
    expect(adapter).toContain('compileElectroCraftRecordValidator');
    expect(validator).toContain('electroCraftDataSchemaSchema.parse');
    expect(workspace).toContain('dataSourceWorkspaceRuntime.mutate');
    expect(workspace).not.toContain('createDrizzleInternalDataRepository');
  });
});
