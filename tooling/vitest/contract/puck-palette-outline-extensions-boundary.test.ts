import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M05.7 Puck palette/outline ownership boundary', () => {
  it('keeps Puck.Components and Puck.Outline as the engine-owned composition surfaces', () => {
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');

    expect(composition).toContain('PuckEditorComponents = Puck.Components');
    expect(composition).toContain('PuckEditorOutline = Puck.Outline');
    expect(workspace).toContain('<PuckEditorOutline />');
    expect(workspace).not.toContain('outline:');
    expect(workspace).not.toContain('overrides=');
    expect(workspace).not.toContain('plugins=');
  });

  it('adds discovery around Puck.Components without replacing the base component drawer', () => {
    const palette = read('apps/studio/src/shell/palette-panel.tsx');

    expect(palette).toContain('searchPaletteCatalog(query)');
    expect(palette).toContain('preferences.favorites');
    expect(palette).toContain('preferences.recent');
    expect(palette).toContain('paletteCategories.map');
    expect(palette).toContain('<PuckEditorComponents />');
    expect(palette).toContain('extensionsEnabled = true');
    expect(palette).toContain('data-palette-extension-mode="puck-base"');
    expect(palette).not.toContain("from '@puckeditor/core'");
  });

  it('keeps favorites and recents as workspace/user preferences instead of ComponentDefinitions', () => {
    const preferences = read('apps/studio/src/shell/palette-preferences.ts');
    const catalog = read('apps/studio/src/shell/palette-catalog.ts');

    expect(preferences).toContain("PALETTE_PREFERENCES_STORAGE_KEY = 'electrocraft.workspace.palette.v1'");
    expect(preferences).toContain('favorites');
    expect(preferences).toContain('recent');
    expect(preferences).not.toContain('ElectroCraftComponentDefinition');
    expect(catalog).not.toContain('localStorage');
  });

  it('uses public Puck categories and permissions instead of outline overrides or duplicated lock state', () => {
    const adapter = read('packages/editor-puck/src/puck-component-adapter.ts');

    expect(adapter).toContain('categories: createPuckCategories');
    expect(adapter).toContain('drag: false');
    expect(adapter).toContain('delete: false');
    expect(adapter).toContain('duplicate: false');
    expect(adapter).toContain('edit: false');
    expect(adapter).not.toContain('resolveOutline');
    expect(adapter).not.toContain('outlineOverride');
  });
});
