import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('M03.8 required artifacts exist', () => {
  for (const file of [
    '.ai/PALETTE_CATALOG_MATRIX.md',
    'apps/studio/src/shell/palette-catalog.ts',
    'apps/studio/src/shell/palette-panel.tsx',
    'apps/studio/src/shell/palette.css',
    'apps/studio/src/help/help-registry.ts',
  ]) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file);
  }
});

test('Palette owns discovery but not Puck ComponentDefinitions', () => {
  const catalog = read('apps/studio/src/shell/palette-catalog.ts');
  const panel = read('apps/studio/src/shell/palette-panel.tsx');
  assert.equal(catalog.includes("type PaletteCategoryId ="), true);
  assert.equal(catalog.includes('componentDefinition'), false);
  assert.equal(catalog.includes('ComponentDefinition'), false);
  assert.equal(panel.includes('PuckEditorComponents'), true);
  assert.equal(panel.includes('usePuckPaletteInsert'), true);
  assert.equal(panel.includes('@puckeditor/core'), false);
});

test('Palette exposes the exact category and synonym contract', () => {
  const catalog = read('apps/studio/src/shell/palette-catalog.ts');
  for (const category of [
    'layout',
    'basic',
    'content',
    'navigation',
    'dynamic-data',
    'forms',
    'filters',
    'social-contact',
    'admin',
    'commerce-pack',
  ]) {
    assert.equal(catalog.includes(`id: '${category}'`), true, category);
  }
  for (const synonym of ['posts', 'menu', 'login', 'jetengine', 'social', 'commerce']) {
    assert.equal(catalog.toLowerCase().includes(`'${synonym}'`), true, synonym);
  }
});

test('Workspace preferences store palette ids and fail closed', () => {
  const preferences = read('apps/studio/src/shell/palette-preferences.ts');
  assert.equal(preferences.includes('paletteItemId'), true);
  assert.equal(preferences.includes('componentDefinition'), false);
  assert.equal(preferences.includes('throw new TypeError'), true);
});

test('Responsive Palette uses 2 columns only when useful and supports mobile', () => {
  const css = read('apps/studio/src/shell/palette.css');
  const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
  assert.equal(css.includes('container-type: inline-size'), true);
  assert.equal(css.includes('@container (min-width: 272px)'), true);
  assert.equal(css.includes('repeat(2, minmax(0, 1fr))'), true);
  assert.equal(workspace.includes('data-editor-mobile-sheet="components"'), true);
  assert.equal(workspace.includes('<StudioPalette />'), true);
});

test('Unsupported insertion remains a visible diagnostic', () => {
  const catalog = read('apps/studio/src/shell/palette-catalog.ts');
  const panel = read('apps/studio/src/shell/palette-panel.tsx');
  assert.equal(catalog.includes('PALETTE_MAPPING_PENDING'), true);
  assert.equal(catalog.includes('PALETTE_COMPONENT_UNAVAILABLE'), true);
  assert.equal(panel.includes('data-palette-diagnostic'), true);
  assert.equal(panel.includes('diagnostic.location'), true);
  assert.equal(panel.includes('diagnostic.cause'), true);
  assert.equal(panel.includes('diagnostic.action'), true);
});

test('M03.8 continuity remains GREEN before later F03 microphases advance', () => {
  const state = read('.ai/STATE.md');
  const active = /M03\.8[^\n]*ACTIVE/.test(state);
  const closed = /M03\.8[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
  if (closed) {
    assert.match(
      state,
      /M03\.9[^\n]*(?:ACTIVE|COMPLETADA[^\n]*GREEN)/,
      'M03.9 must have become ACTIVE or closed GREEN before F03 advances beyond M03.8',
    );
  }
  assert.equal(active || closed, true, 'M03.8 must remain ACTIVE or close GREEN before later F03 microphases advance');
});
