import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { advancedFieldStorageDescriptor } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('M08.9 advanced field ownership boundary', () => {
  it('keeps generic PGlite storage and forbids dynamic DDL or eval', () => {
    const domain = read('packages/domain/src/data/advanced-fields.ts');
    const runtime = read('packages/connectors/src/advanced-field-runtime.ts');
    const validator = read('packages/connectors/src/record-validation.ts');
    const adapter = read('packages/connectors/src/internal-data-source-adapter.ts');

    expect(advancedFieldStorageDescriptor).toEqual({
      owner: 'PGlite generic content store',
      physicalTable: 'content_records',
      payloadColumn: 'data',
      storage: 'jsonb-generic',
      dynamicDdl: false,
      fieldTables: false,
    });
    expect(domain).toContain("ELECTROCRAFT_ADVANCED_FIELD_CAPABILITY = 'data.advanced-fields'");
    expect(runtime).not.toMatch(/\beval\s*\(|new Function\s*\(/);
    expect(validator).toContain('normalizeElectroCraftAdvancedFieldRecord');
    expect(adapter).toContain('compileElectroCraftRecordValidator');
    expect(`${domain}\n${runtime}\n${validator}\n${adapter}`).not.toMatch(/CREATE TABLE|ALTER TABLE|DROP TABLE/i);
  });

  it('integrates the advanced editor into the canonical models route', () => {
    const workspace = read('apps/studio/src/features/data/data-models-workspace.tsx');
    const editor = read('apps/studio/src/features/data/advanced-field-editor.tsx');

    expect(workspace).toContain('<AdvancedFieldEditor');
    expect(workspace).toContain('orderAdvancedFieldsForDisplay');
    for (const copy of ['Estructura y dependencias', 'Subir', 'Bajar', 'Guardar estructura']) {
      expect(editor).toContain(copy);
    }
  });
});
