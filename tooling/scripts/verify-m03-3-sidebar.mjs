import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const required = [
  'apps/studio/src/shell/app-shell.tsx', 'apps/studio/src/shell/sidebar-navigation.ts',
  'apps/studio/src/shell/workspace-preferences.ts', 'apps/studio/src/shell/sidebar.css',
  'apps/studio/src/i18n/studio-shell.es.ts', 'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/icons/studio-icon-registry.ts', 'tooling/playwright/m03-3-sidebar.spec.ts',
  '.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md',
];
for (const file of required) if (!fs.existsSync(path.join(root, file))) throw new Error(`M03.3 regression file missing: ${file}`);
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const shell = read('apps/studio/src/shell/app-shell.tsx');
const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
const preferences = read('apps/studio/src/shell/workspace-preferences.ts');
const css = read('apps/studio/src/shell/sidebar.css');
const help = read('apps/studio/src/help/help-registry.ts');
const closure = read('.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md');
const state = read('.ai/STATE.md');
for (const token of ['aria-current', 'TooltipTrigger', 'useSyncExternalStore', 'data-sidebar-collapsed']) if (!shell.includes(token)) throw new Error(`M03.3 regression missing: ${token}`);
if (!preferences.includes('WorkspacePreferencesPort') || !preferences.includes('createMemoryWorkspacePreferencesPort')) throw new Error('M03.3 preference port regressed');
if (preferences.includes('localStorage') || preferences.includes('PGlite')) throw new Error('M03.3 must not preempt F04 persistence');
if (!navigation.includes("iconId: 'studio.sidebar.editor'")) throw new Error('M03.3 semantic navigation regressed');
if (!css.includes("data-sidebar-collapsed='true'") || !css.includes('grid-template-columns: 64px')) throw new Error('M03.3 collapse regression');
if (!help.includes('WorkspacePreferencesPort')) throw new Error('M03.3 persistent help regression');
if (!closure.includes('32275890306') || !closure.includes('9374022673') || !closure.includes('GREEN')) throw new Error('M03.3 closure evidence invalid');
if (!/M03\.3[^\n]*COMPLETADA/.test(state)) throw new Error('M03.3 must remain COMPLETADA post-closure');
const report = { schemaVersion: 2, microphase: 'M03.3', mode: 'post-closure-regression', closureRun: 32275890306, groups: 7, sidebar: { expandedPx: 240, collapsedPx: 64 }, helpId: 'help.studio.shell', blockers: [] };
fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'tooling/dist/m03-3-sidebar-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('PASS_M03_3_SIDEBAR_REGRESSION blockers=0');
