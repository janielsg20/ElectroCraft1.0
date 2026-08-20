import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

const requiredFiles = [
  '.ai/PALETTE_CATALOG_MATRIX.md',
  '.ai/PALETTE_UX_SPEC.md',
  '.ai/PALETTE_SEARCH_SYNONYM_INDEX.md',
  'apps/studio/src/shell/palette-catalog.ts',
  'apps/studio/src/shell/palette-preferences.ts',
  'apps/studio/src/shell/palette-panel.tsx',
  'apps/studio/src/shell/palette-panel.css',
  'apps/studio/src/i18n/palette.es.ts',
  'tooling/vitest/unit/palette-catalog.test.ts',
  'tooling/vitest/unit/palette-preferences.test.ts',
  'tooling/vitest/contract/palette-puck-boundary.test.ts',
  'tooling/vitest/integration/palette-runtime.test.ts',
  'tooling/playwright/m03-8-palette.spec.ts',
];

test('M03.8 required artifacts exist', () => {
  for (const path of requiredFiles) assert.equal(existsSync(path), true, `missing ${path}`);
});

test('Palette owns discovery but not Puck ComponentDefinitions', () => {
  const palette = read('apps/studio/src/shell/palette-panel.tsx');
  const catalog = read('apps/studio/src/shell/palette-catalog.ts');
  const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');
  assert.equal(palette.includes("from '@puckeditor/core'"), false);
  assert.equal(catalog.includes('ComponentRegistry'), false);
  assert.equal(catalog.includes('structuralPuckConfig'), false);
  assert.equal(adapter.includes("from '@puckeditor/core'"), true);
  assert.equal(palette.includes('<PuckEditorComponents />'), true);
});

test('Palette exposes the exact category and synonym contract', () => {
  const catalog = read('apps/studio/src/shell/palette-catalog.ts');
  for (const category of [
    'Layout',
    'Basic',
    'Content',
    'Navigation',
    'Dynamic Data',
    'Forms',
    'Filters',
    'Social / Contact',
    'Admin',
    'Commerce Pack',
  ]) {
    assert.equal(catalog.includes(`'${category}'`), true, `missing category ${category}`);
  }
  for (const synonym of ['posts', 'menu', 'login', 'jetengine', 'social', 'commerce']) {
    assert.match(catalog, new RegExp(`\\b${synonym}\\b`, 'i'));
  }
});

test('Workspace preferences store palette ids and fail closed', () => {
  const preferences = read('apps/studio/src/shell/palette-preferences.ts');
  assert.equal(preferences.includes('electrocraft.workspace.palette.v1'), true);
  assert.equal(preferences.includes('ComponentDefinition'), false);
  assert.equal(preferences.includes('ElectroCraftDocument'), false);
  assert.equal(preferences.includes('localStorage'), true);
});

test('Responsive Palette uses 2 columns only when useful and supports mobile', () => {
  const css = read('apps/studio/src/shell/palette-panel.css');
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
