import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(path, 'utf8');

test('M03.6 structural gate preserves capabilities across responsive modes', async () => {
  const [workspace, layoutModel, responsiveCss, icons, help, state] = await Promise.all([
    read('apps/studio/src/shell/editor-workspace.tsx'),
    read('apps/studio/src/shell/editor-layout-model.ts'),
    read('apps/studio/src/shell/responsive-shell.css'),
    read('packages/design-system/src/icons/studio-icon-registry.ts'),
    read('apps/studio/src/help/help-registry.ts'),
    read('.ai/STATE.md'),
  ]);

  for (const mode of ['desktop', 'laptop', 'tablet', 'mobile']) {
    assert.equal(layoutModel.includes(`'${mode}'`), true, `M03.6 editor mode missing: ${mode}`);
  }

  for (const token of [
    '<ContextRegion',
    '<CanvasRegion',
    '<InspectorRegion',
    'ResponsiveEditorLayout',
    'MobileEditorLayout',
    'data-editor-responsive-mode',
    'data-laptop-panel-strategy',
    'useEditorViewportWidth',
  ]) {
    assert.equal(workspace.includes(token), true, `M03.6 workspace token missing: ${token}`);
  }

  assert.equal(workspace.includes('getStudioSidebarNavigationItem'), true, 'Canonical navigation resolver missing');
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
    'grid-template-rows: minmax(0, 1fr) 64px',
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
});
