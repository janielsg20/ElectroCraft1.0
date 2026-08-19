import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const closurePath = '.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md';

const required = [
  'apps/studio/src/shell/editor-workspace.tsx',
  'apps/studio/src/shell/editor-workspace.css',
  'apps/studio/src/shell/editor-layout-model.ts',
  'apps/studio/src/shell/use-editor-layout-mode.ts',
  'apps/studio/src/shell/palette-panel.tsx',
  'apps/studio/src/i18n/editor.es.ts',
  'packages/design-system/src/components/ui/resizable-pane-layout.tsx',
  'packages/editor-puck/src/puck-editor-composition.ts',
  'tooling/scripts/verify-m03-4-topbar.mjs',
  'tooling/playwright/m03-5-editor-layout.spec.ts',
  '.ai/evidence/F03/M03.4/CLOSURE_2026-08-19.md',
  '.ai/evidence/F03/M03.5/IMPLEMENTATION_2026-08-19.md',
  closurePath,
];

test('M03.5 structural gate keeps exact editor dimensions and ownership', () => {
  for (const file of required) {
    assert.equal(exists(file), true, `M03.5 required file missing: ${file}`);
  }

  const model = read('apps/studio/src/shell/editor-layout-model.ts');
  const studio = read('apps/studio/src/shell/editor-workspace.tsx');
  const palette = read('apps/studio/src/shell/palette-panel.tsx');
  const css = read('apps/studio/src/shell/editor-workspace.css');
  const appCss = read('apps/studio/src/styles.css');
  const puck = read('packages/editor-puck/src/puck-editor-composition.ts');
  const help = read('apps/studio/src/help/help-registry.ts');
  const m034Verifier = read('tooling/scripts/verify-m03-4-topbar.mjs');
  const state = read('.ai/STATE.md');

  for (const token of [
    'defaultSize: 288',
    'minSize: 240',
    'maxSize: 380',
    'defaultSize: 320',
    'minSize: 280',
    'maxSize: 440',
    'statusHeight: 26',
  ]) {
    assert.equal(model.includes(token), true, `M03.5 pane token missing: ${token}`);
  }

  assert.equal(appCss.includes('height: 26px'), true, 'M03.5 must preserve the AppShell 26px Statusbar');
  assert.equal(studio.includes("from '@puckeditor/core'"), false, 'Studio must not bypass editor-puck ownership');
  assert.equal(palette.includes("from '@puckeditor/core'"), false, 'Palette must not bypass editor-puck ownership');
  assert.equal(studio.includes('<StudioPalette />'), true, 'M03.5 Context must retain the successor Palette composition');
  assert.equal(
    palette.includes('PuckEditorComponents'),
    true,
    'M03.5 Puck Components composition must remain reachable through StudioPalette',
  );
  for (const token of ['PuckEditorOutline', 'PuckEditorPreview', 'PuckEditorFields', 'ResizableTriPane', '<ToolSheet']) {
    assert.equal(studio.includes(token), true, `M03.5 composition missing: ${token}`);
  }
  for (const token of ['Puck.Components', 'Puck.Outline', 'Puck.Preview', 'Puck.Fields']) {
    assert.equal(puck.includes(token), true, `M03.5 public Puck surface missing: ${token}`);
  }
  for (const token of [
    'role="separator"',
    'aria-valuemin',
    'aria-valuemax',
    'ArrowLeft',
    'ArrowRight',
    'Home',
    'End',
  ]) {
    assert.equal(
      read('packages/design-system/src/components/ui/resizable-pane-layout.tsx').includes(token),
      true,
      `M03.5 accessible resize behavior missing: ${token}`,
    );
  }
  for (const token of [
    '@media (max-width: 1023px)',
    '@media (max-width: 767px)',
    'grid-template-columns: 240px minmax(0, 1fr)',
  ]) {
    assert.equal(css.includes(token), true, `M03.5 responsive contract missing: ${token}`);
  }
  assert.equal(help.includes('Contexto 288px'), true, 'Persistent help must explain the M03.5 editor geometry');
  assert.match(state, /M03\.4[^\n]*COMPLETADA[^\n]*GREEN/);

  const active = /M03\.5[^\n]*ACTIVE/.test(state);
  const complete = /M03\.5[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
  assert.equal(active || complete, true, 'M03.5 must be ACTIVE or post-closure COMPLETADA / GREEN');

  if (complete) {
    const closure = read(closurePath);
    assert.equal(closure.includes('32296070741'), true, 'M03.5 closure must pin the GREEN owner run');
    assert.equal(closure.includes('9381289623'), true, 'M03.5 closure must pin the GREEN artifact');
    assert.equal(closure.includes('GREEN'), true, 'M03.5 closure evidence must remain GREEN');

    const activeSuccessor = state.match(/M03\.(\d+)[^\n]*ACTIVE/);
    assert.notEqual(activeSuccessor, null, 'A later F03 microphase must remain ACTIVE after M03.5 closes');
    assert.equal(
      Number(activeSuccessor?.[1]) > 5,
      true,
      'M03.5 post-closure regression requires an ACTIVE F03 successor after M03.5',
    );
  }

  assert.equal(
    m034Verifier.includes('post-closure-regression'),
    true,
    'M03.4 verifier must support post-closure regression mode',
  );
  assert.equal(m034Verifier.includes('32278183037'), true, 'M03.4 verifier must pin the real GREEN closure run');
});
