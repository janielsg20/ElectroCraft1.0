import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'apps/studio/src/shell/app-shell.tsx',
  'apps/studio/src/shell/app-shell-route.tsx',
  'apps/studio/src/shell/sidebar-navigation.ts',
  'apps/studio/src/shell/workspace-preferences.ts',
  'apps/studio/src/shell/sidebar.css',
  'apps/studio/src/i18n/studio-shell.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'tooling/vitest/unit/sidebar-navigation.test.ts',
  'tooling/vitest/contract/sidebar-boundary.test.ts',
  'tooling/vitest/integration/sidebar-preferences-runtime.test.ts',
  'tooling/playwright/m03-3-sidebar.spec.ts',
  '.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md',
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`M03.3 required file missing: ${file}`);
}

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const shell = read('apps/studio/src/shell/app-shell.tsx');
const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
const preferences = read('apps/studio/src/shell/workspace-preferences.ts');
const css = read('apps/studio/src/shell/sidebar.css');
const i18n = read('apps/studio/src/i18n/studio-shell.es.ts');
const help = read('apps/studio/src/help/help-registry.ts');
const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
const state = read('.ai/STATE.md');
const closure = read('.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md');
const m033ClosurePath = path.join(root, '.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md');

for (const label of ['Construir', 'Datos', 'Lógica', 'App', 'Recursos', 'Apariencia', 'Publicar']) {
  if (!i18n.includes(`'${label}'`)) throw new Error(`M03.3 group label missing: ${label}`);
}
for (const token of ['aria-current', 'TooltipTrigger', 'useSyncExternalStore', 'data-sidebar-collapsed']) {
  if (!shell.includes(token)) throw new Error(`M03.3 AppShell behavior missing: ${token}`);
}
if (!preferences.includes('export interface WorkspacePreferencesPort'))
  throw new Error('M03.3 WorkspacePreferencesPort missing');
if (!preferences.includes('createMemoryWorkspacePreferencesPort')) throw new Error('M03.3 in-memory adapter missing');
if (preferences.includes('localStorage') || preferences.includes('PGlite'))
  throw new Error('M03.3 must not preempt F04 persistence');
if (!navigation.includes("iconId: 'studio.sidebar.editor'")) throw new Error('M03.3 semantic icon mapping missing');
if (!css.includes("data-sidebar-collapsed='true'") || !css.includes('grid-template-columns: 64px')) {
  throw new Error('M03.3 240 -> 64 collapse CSS missing');
}
if (!closure.includes('32272740576') || !closure.includes('GREEN'))
  throw new Error('M03.2 closure evidence is not GREEN');

const active = /M03\.3[^\n]*ACTIVE/.test(state);
const complete = /M03\.3[^\n]*COMPLETADA/.test(state);
if (!active && !complete) throw new Error('M03.3 must be ACTIVE or post-closure COMPLETADA');
if (complete) {
  if (!fs.existsSync(m033ClosurePath)) throw new Error('M03.3 post-closure evidence missing');
  const m033Closure = fs.readFileSync(m033ClosurePath, 'utf8');
  if (!m033Closure.includes('32275890306') || !m033Closure.includes('GREEN')) {
    throw new Error('M03.3 post-closure evidence is not GREEN');
  }
}

const report = {
  schemaVersion: 1,
  microphase: 'M03.3',
  mode: complete ? 'post-closure-regression' : 'active-gate',
  engine: 'shadcn/ui Radix + AppShell',
  baseCommit: '38b2f5aac504a406b42537b7aade8f3d26626e7d',
  groups: ['build', 'data', 'logic', 'app', 'resources', 'appearance', 'publish'],
  sidebar: { expandedPx: 240, collapsedPx: 64, preferencePort: 'WorkspacePreferencesPort' },
  responsive: ['desktop-toggle', 'laptop-rail', 'tablet-sheet', 'mobile-sheet'],
  helpId: 'help.studio.shell',
  blockers: [],
};
fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'tooling/dist/m03-3-sidebar-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`PASS_M03_3_SIDEBAR_STRUCTURE mode=${report.mode} blockers=0`);
