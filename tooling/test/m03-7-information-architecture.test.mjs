import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const closurePath = '.ai/evidence/F03/M03.7/CLOSURE_2026-08-19.md';

function hasActiveSuccessor(state, phase, microphase) {
  const match = state.match(/M(\d+)\.(\d+)[^\n]*ACTIVE/);
  if (!match) return false;
  const activePhase = Number(match[1]);
  const activeMicrophase = Number(match[2]);
  return activePhase > phase || (activePhase === phase && activeMicrophase > microphase);
}

const required = [
  '.ai/INFORMATION_ARCHITECTURE.md',
  '.ai/UX_INFORMATION_ARCHITECTURE.md',
  '.ai/evidence/F03/M03.7/IMPLEMENTATION_2026-08-19.md',
  '.ai/evidence/F03/M03.7/SCREEN_IA_AUDIT_2026-08-19.md',
  'apps/studio/src/i18n/information-architecture.es.ts',
  'apps/studio/src/shell/information-architecture.ts',
  'apps/studio/src/shell/information-architecture-ui.tsx',
  'apps/studio/src/shell/information-architecture.css',
  'apps/studio/src/shell/editor-workspace.tsx',
  'apps/studio/src/shell/studio-topbar.tsx',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/components/ui/collapsible.tsx',
  'packages/design-system/src/components/ui/empty-state.tsx',
  'tooling/vitest/unit/information-architecture.test.ts',
  'tooling/vitest/contract/information-architecture-boundary.test.ts',
  'tooling/vitest/integration/information-architecture-runtime.test.ts',
  'tooling/playwright/m03-7-information-architecture.spec.ts',
];

test('M03.7 structural gate enforces Progressive Disclosure and canonical information architecture', () => {
  for (const file of required) {
    assert.equal(exists(file), true, `M03.7 required file missing: ${file}`);
  }

  const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
  const ia = read('apps/studio/src/shell/information-architecture.ts');
  const iaUi = read('apps/studio/src/shell/information-architecture-ui.tsx');
  const editor = read('apps/studio/src/shell/editor-workspace.tsx');
  const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
  const collapsible = read('packages/design-system/src/components/ui/collapsible.tsx');
  const emptyState = read('packages/design-system/src/components/ui/empty-state.tsx');
  const help = read('apps/studio/src/help/help-registry.ts');
  const ownerDoc = read('.ai/INFORMATION_ARCHITECTURE.md');
  const aliasDoc = read('.ai/UX_INFORMATION_ARCHITECTURE.md');
  const audit = read('.ai/evidence/F03/M03.7/SCREEN_IA_AUDIT_2026-08-19.md');
  const state = read('.ai/STATE.md');
  const predecessor = read('.ai/evidence/F03/M03.6/CLOSURE_2026-08-19.md');

  for (const token of ["'primary'", "'contextual'", "'advanced'", "'diagnostic'"]) {
    assert.equal(ia.includes(token), true, `M03.7 information level missing: ${token}`);
  }
  assert.equal(
    ia.includes("level: 'advanced', visibility: 'disclosure'"),
    true,
    'Advanced options must use disclosure',
  );
  assert.equal(ia.includes('protectsSystemState: true'), true, 'Diagnostic system-state metadata must exist');

  assert.equal(collapsible.includes("from 'radix-ui'"), true, 'Progressive Disclosure must use the Radix owner');
  assert.equal(
    iaUi.includes('CollapsibleTrigger asChild'),
    true,
    'Progressive Disclosure must use the design-system Collapsible',
  );
  assert.equal(emptyState.includes('export function EmptyState'), true, 'Reusable EmptyState composition is required');

  for (const forbidden of [
    "id: 'elements'",
    "id: 'layers'",
    "id: 'fields'",
    "id: 'filters'",
    "id: 'dashboards'",
    "id: 'settings'",
    "id: 'import'",
  ]) {
    assert.equal(
      navigation.includes(forbidden),
      false,
      `Secondary concept leaked into top-level navigation: ${forbidden}`,
    );
  }

  assert.equal(editor.includes('<PuckEditorFields'), true, 'Inspector must preserve Puck.Fields ownership');
  assert.equal(editor.includes('id="inspector-advanced"'), true, 'Inspector Advanced disclosure missing');
  assert.equal(editor.includes('<StudioEmptyState id="canvas"'), true, 'Canvas empty state missing');
  assert.equal(editor.includes('<StudioEmptyState id="outline"'), true, 'Outline empty state missing');
  assert.equal(editor.includes('<StudioEmptyState id="inspector"'), true, 'Inspector empty state missing');

  const diagnosticIndex = topbar.indexOf('ec-ia-diagnostic-alert');
  const advancedIndex = topbar.indexOf('id="settings-advanced"');
  assert.ok(diagnosticIndex > 0, 'Settings diagnostic must be rendered when applicable');
  assert.ok(advancedIndex > diagnosticIndex, 'Diagnostics must remain outside the Advanced disclosure');

  for (const concept of ['Progressive Disclosure', 'primary', 'contextual', 'advanced', 'diagnostic']) {
    assert.equal(ownerDoc.includes(concept), true, `Canonical IA document missing concept: ${concept}`);
  }
  assert.equal(
    aliasDoc.includes('INFORMATION_ARCHITECTURE.md'),
    true,
    'UX_INFORMATION_ARCHITECTURE must remain a compatibility alias',
  );
  for (const surface of ['Settings', 'Inspector', 'List/Detail']) {
    assert.equal(audit.includes(surface), true, `Screen IA audit missing surface: ${surface}`);
  }
  assert.equal(help.includes('Progressive Disclosure'), true, 'Persistent help must explain Progressive Disclosure');

  assert.equal(predecessor.includes('GREEN'), true, 'M03.6 predecessor evidence must remain GREEN');
  const active = /M03\.7[^\n]*ACTIVE/.test(state);
  const complete = /M03\.7[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
  assert.equal(active || complete, true, 'M03.7 must be ACTIVE or post-closure COMPLETADA / GREEN');
  assert.equal((state.match(/`ACTIVE`/g) ?? []).length, 1, 'Exactly one microphase must remain ACTIVE');

  if (complete) {
    assert.equal(exists(closurePath), true, 'Completed M03.7 requires closure evidence');
    const closure = read(closurePath);
    assert.equal(closure.includes('GREEN'), true, 'M03.7 closure evidence must remain GREEN');
    assert.equal(
      hasActiveSuccessor(state, 3, 7),
      true,
      'M03.7 post-closure regression requires a later ACTIVE microphase, including a later phase',
    );
  }
});
