import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const closurePath = '.ai/evidence/F03/M03.6/CLOSURE_2026-08-19.md';

function hasActiveSuccessor(state, phase, microphase) {
  const match = state.match(/M(\d+)\.(\d+)[^\n]*ACTIVE/);
  if (!match) return false;
  const activePhase = Number(match[1]);
  const activeMicrophase = Number(match[2]);
  return activePhase > phase || (activePhase === phase && activeMicrophase > microphase);
}

const required = [
  'apps/studio/src/shell/editor-workspace.tsx',
  'apps/studio/src/shell/responsive-shell.css',
  'apps/studio/src/shell/editor-layout-model.ts',
  'apps/studio/src/shell/app-shell-layout.ts',
  'apps/studio/src/shell/sidebar-navigation.ts',
  'apps/studio/src/i18n/editor.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/components/ui/sheet.tsx',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'tooling/vitest/unit/responsive-editor-layout.test.ts',
  'tooling/vitest/contract/responsive-shell-boundary.test.ts',
  'tooling/vitest/integration/responsive-shell-runtime.test.ts',
  'tooling/playwright/m03-6-responsive-shell.spec.ts',
  '.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md',
  '.ai/evidence/F03/M03.6/IMPLEMENTATION_2026-08-19.md',
  closurePath,
];

test('M03.6 structural gate preserves capabilities across responsive modes', () => {
  for (const file of required) {
    assert.equal(exists(file), true, `M03.6 required file missing: ${file}`);
  }

  const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
  const responsiveCss = read('apps/studio/src/shell/responsive-shell.css');
  const model = read('apps/studio/src/shell/editor-layout-model.ts');
  const appShellLayout = read('apps/studio/src/shell/app-shell-layout.ts');
  const sheet = read('packages/design-system/src/components/ui/sheet.tsx');
  const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
  const help = read('apps/studio/src/help/help-registry.ts');
  const state = read('.ai/STATE.md');
  const predecessor = read('.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md');

  for (const token of [
    'laptopCanvasOverlayBelowPx: 1152',
    'tabletRailPx: 56',
    'mobileDockHeightPx: 58',
    "'components'",
    "'screens'",
    "'canvas'",
    "'properties'",
    "'more'",
  ]) {
    assert.equal(model.includes(token), true, `M03.6 responsive model token missing: ${token}`);
  }

  assert.equal(appShellLayout.includes('tabletRailPx: 56'), true, 'M03.6 tablet rail contract must be 56px');
  assert.equal(sheet.includes("export type SheetSide = 'left' | 'right' | 'bottom'"), true, 'M03.6 needs bottom Sheet');
  assert.equal(sheet.includes("from 'radix-ui'"), true, 'M03.6 must keep Radix Sheet ownership');
  assert.equal(workspace.includes("from '@puckeditor/core'"), false, 'Studio must not bypass editor-puck ownership');
  assert.equal(
    workspace.includes("getStudioSidebarNavigationItem('screens')"),
    true,
    'Screens must use canonical navigation',
  );

  for (const destination of ['components', 'screens', 'canvas', 'properties', 'more']) {
    assert.equal(
      workspace.includes(`data-mobile-destination="${destination}"`),
      true,
      `M03.6 mobile destination missing: ${destination}`,
    );
  }
  assert.equal(workspace.includes('data-editor-mobile-sheet="properties"'), true, 'Properties bottom Sheet missing');
  assert.equal(workspace.includes('data-editor-mobile-sheet="outline"'), true, 'Outline full-height Sheet missing');
  assert.equal(workspace.includes('side="bottom"'), true, 'M03.6 bottom Sheet composition missing');

  for (const token of [
    'grid-template-columns: 56px minmax(0, 1fr)',
    'grid-template-rows: minmax(0, 1fr) 58px',
    'min-height: 44px',
    '.ec-editor-mobile-full-sheet',
  ]) {
    assert.equal(responsiveCss.includes(token), true, `M03.6 responsive CSS token missing: ${token}`);
  }

  for (const iconId of [
    'studio.mobile.components',
    'studio.mobile.screens',
    'studio.mobile.canvas',
    'studio.mobile.properties',
    'studio.mobile.more',
  ]) {
    assert.equal(icons.includes(`'${iconId}'`), true, `M03.6 semantic icon missing: ${iconId}`);
  }

  for (const copy of ['rail global de 56px', 'navegación inferior', 'Sheets inferiores', 'altura completa']) {
    assert.equal(help.includes(copy), true, `M03.6 persistent help missing concept: ${copy}`);
  }

  assert.match(state, /M03\.5[^\n]*COMPLETADA[^\n]*GREEN/);
  const active = /M03\.6[^\n]*ACTIVE/.test(state);
  const complete = /M03\.6[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
  assert.equal(active || complete, true, 'M03.6 must be ACTIVE or post-closure COMPLETADA / GREEN');
  assert.equal((state.match(/`ACTIVE`/g) ?? []).length, 1, 'Exactly one microphase must remain ACTIVE');

  if (complete) {
    const closure = read(closurePath);
    assert.equal(closure.includes('32299990614'), true, 'M03.6 closure must pin the GREEN owner run');
    assert.equal(closure.includes('9382670739'), true, 'M03.6 closure must pin the GREEN artifact');
    assert.equal(closure.includes('GREEN'), true, 'M03.6 closure evidence must remain GREEN');

    const m03_7Active = /M03\.7[^\n]*ACTIVE/.test(state);
    const m03_7Complete = /M03\.7[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
    assert.equal(m03_7Active || m03_7Complete, true, 'M03.6 successor M03.7 must be ACTIVE or COMPLETADA / GREEN');

    if (m03_7Complete) {
      assert.equal(
        hasActiveSuccessor(state, 3, 7),
        true,
        'M03.6 post-closure regression requires an ACTIVE successor after M03.7, including a later phase',
      );
    }
  }

  assert.equal(predecessor.includes('32297534296'), true, 'M03.5 main GREEN run must be recorded');
  assert.equal(predecessor.includes('9381789348'), true, 'M03.5 main artifact must be recorded');
});
