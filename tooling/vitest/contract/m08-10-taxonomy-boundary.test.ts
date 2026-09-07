import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_STORAGE_SCHEMA_VERSION } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('M08.10 taxonomy ownership boundary', () => {
  it('keeps metadata canonical and term persistence behind the existing adapter', () => {
    const domain = read('packages/domain/src/contracts/data-definition.ts');
    const adapter = read('packages/connectors/src/internal-data-source-adapter.ts');
    const repository = read('packages/data-web/src/internal-data-repository.ts');

    expect(domain).toContain('electroTaxonomySchema');
    expect(domain).not.toMatch(/drizzle|PGlite|CREATE TABLE/i);
    expect(adapter).toContain('parseTaxonomyResourceId');
    expect(repository).toContain('schema.taxonomyTerms');
    expect(STUDIO_STORAGE_SCHEMA_VERSION).toBe(8);
  });

  it('keeps definition and term management visible and separate in the canonical models route', () => {
    const workspace = read('apps/studio/src/features/data/data-models-workspace.tsx');
    const editor = read('apps/studio/src/features/data/taxonomy-editor.tsx');

    expect(workspace).toContain('<TaxonomyEditor');
    for (const copy of ['Definición', 'Jerarquía', 'Modelos', 'Campos', 'Plantillas', 'Gestor de términos']) {
      expect(editor).toContain(copy);
    }
  });
});
