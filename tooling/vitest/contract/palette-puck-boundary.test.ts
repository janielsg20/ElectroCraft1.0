import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { paletteCatalog } from '../../../apps/studio/src/shell/palette-catalog';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('M03.8 Palette ownership boundary', () => {
  it('keeps Studio independent from @puckeditor/core internals', () => {
    const panel = read('apps/studio/src/shell/palette-panel.tsx');
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    expect(panel).not.toContain("from '@puckeditor/core'");
    expect(workspace).not.toContain("from '@puckeditor/core'");
    expect(panel).toContain("from '@electrocraft/editor-puck'");
  });

  it('keeps Puck dispatch isolated behind the editor-puck adapter', () => {
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');
    expect(adapter).toContain("from '@puckeditor/core'");
    expect(adapter).toContain('createUsePuck');
    expect(adapter).toContain("type: 'insert'");
  });

  it('does not derive the discoverable catalog from the active ComponentRegistry', () => {
    const catalog = read('apps/studio/src/shell/palette-catalog.ts');
    expect(catalog).toContain('paletteCatalog');
    expect(catalog).not.toContain('ComponentRegistry');
    expect(catalog).not.toContain('structuralPuckConfig');
  });

  it('allows many palette aliases and presets to share one canonical component ref', () => {
    const textRefs = paletteCatalog.filter((item) => item.componentRef === 'Text');
    expect(textRefs.length).toBeGreaterThan(3);
    expect(new Set(textRefs.map((item) => item.id)).size).toBe(textRefs.length);
  });

  it('stores workspace palette preferences by paletteItemId only', () => {
    const preferences = read('apps/studio/src/shell/palette-preferences.ts');
    expect(preferences).toContain("PaletteItemDescriptor['id']");
    expect(preferences).not.toContain('ComponentDefinition');
    expect(preferences).not.toContain('ElectroCraftDocument');
  });

  it('keeps the matrix and UX specification as explicit project contracts', () => {
    expect(read('.ai/PALETTE_CATALOG_MATRIX.md')).toContain('PALETTE CATALOG MATRIX');
    expect(read('.ai/PALETTE_UX_SPEC.md')).toContain('PALETTE UX SPEC');
    expect(read('.ai/PALETTE_SEARCH_SYNONYM_INDEX.md')).toContain('PALETTE SEARCH SYNONYM INDEX');
  });
});
