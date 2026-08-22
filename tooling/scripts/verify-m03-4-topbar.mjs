import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'apps/studio/src/shell/studio-topbar.tsx',
  'apps/studio/src/shell/topbar-model.ts',
  'apps/studio/src/shell/topbar.css',
  'apps/studio/src/shell/app-shell.tsx',
  'apps/studio/src/shell/app-shell-layout.ts',
  'apps/studio/src/shell/app-shell-route.tsx',
  'apps/studio/src/i18n/studio-shell.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/components/ui/sheet.tsx',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'packages/design-system/src/styles/tokens.css',
  'tooling/vitest/unit/topbar-model.test.ts',
  'tooling/vitest/contract/topbar-boundary.test.ts',
  'tooling/vitest/integration/topbar-runtime.test.ts',
  'tooling/playwright/m03-4-topbar.spec.ts',
  '.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md',
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`M03.4 required file missing: ${file}`);
}

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
const css = read('apps/studio/src/shell/topbar.css');
const appCss = read('apps/studio/src/styles.css');
const layout = read('apps/studio/src/shell/app-shell-layout.ts');
const tokens = read('packages/design-system/src/styles/tokens.css');
const route = read('apps/studio/src/shell/app-shell-route.tsx');
const i18n = read('apps/studio/src/i18n/studio-shell.es.ts');
const help = read('apps/studio/src/help/help-registry.ts');
const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
const sheet = read('packages/design-system/src/components/ui/sheet.tsx');
const state = read('.ai/STATE.md');
const predecessorClosure = read('.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md');
const m034ClosurePath = path.join(root, '.ai/evidence/F03/M03.4/CLOSURE_2026-08-19.md');

if (!appCss.includes('height: var(--ec-shell-topbar-height)')) {
  throw new Error('M03.4 AppShell must consume the shared Topbar height token');
}
if (!layout.includes('topbarPx: 52')) throw new Error('M03.4 layout contract must preserve default Topbar height 52px');
if (!tokens.includes('--ec-shell-topbar-height: 52px;')) {
  throw new Error('M03.4 design-system tokens must preserve default Topbar height 52px');
}
for (const token of [
  'ec-topbar-left',
  'ec-topbar-center',
  'ec-topbar-right',
  'data-topbar-settings-trigger',
  'data-topbar-settings-sheet',
  'preferencesPort.toggleSidebar',
  'useSyncExternalStore',
]) {
  if (!topbar.includes(token)) throw new Error(`M03.4 Topbar behavior missing: ${token}`);
}
if (topbar.lastIndexOf('data-topbar-settings-trigger') <= topbar.lastIndexOf('ec-topbar-help-trigger')) {
  throw new Error('M03.4 Settings gear must be the final right-side action');
}
if (topbar.includes('onCloseAutoFocus')) throw new Error('M03.4 must preserve Radix default focus restoration');
if (!sheet.includes('Dialog as DialogPrimitive')) throw new Error('M03.4 Settings must use the real Radix Sheet owner');
for (const token of ['max-width: 1279px', 'max-width: 1023px', 'max-width: 767px', '44px']) {
  if (!css.includes(token)) throw new Error(`M03.4 responsive contract missing: ${token}`);
}
for (const label of [
  'Proyecto local',
  'Documento',
  'Plataforma',
  'Breakpoint',
  'Deshacer',
  'Rehacer',
  'Zoom',
  'Vista previa',
  'Exportar',
  'Local',
  'Ayuda',
  'Configuración',
  'Espacio de trabajo',
]) {
  if (!i18n.includes(`'${label}'`)) throw new Error(`M03.4 Spanish copy missing: ${label}`);
}
for (const iconId of [
  'studio.topbar.tools',
  'studio.topbar.document',
  'studio.topbar.platform',
  'studio.topbar.breakpoint',
  'studio.topbar.undo',
  'studio.topbar.redo',
  'studio.topbar.zoom',
]) {
  if (!icons.includes(`'${iconId}'`)) throw new Error(`M03.4 Lucide registry ID missing: ${iconId}`);
}
if (!route.includes('<StudioTopbar')) throw new Error('M03.4 Topbar is not composed inside AppShell route');
if (!help.includes('Configuración') || !help.includes('restaura el foco')) {
  throw new Error('M03.4 persistent help does not explain Configuración/focus behavior');
}
if (!predecessorClosure.includes('32275890306') || !predecessorClosure.includes('GREEN')) {
  throw new Error('M03.3 closure evidence is not GREEN');
}

const active = /M03\.4[^\n]*ACTIVE/.test(state);
const complete = /M03\.4[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
if (!active && !complete) throw new Error('M03.4 must be ACTIVE or post-closure COMPLETADA/GREEN');
if (complete) {
  if (!fs.existsSync(m034ClosurePath)) throw new Error('M03.4 post-closure evidence missing');
  const closure = fs.readFileSync(m034ClosurePath, 'utf8');
  if (!closure.includes('32278183037') || !closure.includes('GREEN')) {
    throw new Error('M03.4 post-closure evidence is not GREEN');
  }

  const activeSuccessor = state.match(/M(\d+)\.(\d+)[^\n]*ACTIVE/);
  const successorMajor = Number(activeSuccessor?.[1] ?? 0);
  const successorMinor = Number(activeSuccessor?.[2] ?? 0);
  if (!activeSuccessor || successorMajor < 3 || (successorMajor === 3 && successorMinor <= 4)) {
    throw new Error('M03.4 post-closure regression requires an ACTIVE successor after M03.4');
  }
}

const report = {
  schemaVersion: 1,
  microphase: 'M03.4',
  mode: complete ? 'post-closure-regression' : 'active-gate',
  engine: 'shadcn/ui Radix + AppShell',
  baseCommit: '5d6e5d341222b924c3f8eb40567ab15dc1628ff8',
  topbar: { heightPx: 52, regions: ['left', 'center', 'right'], settingsLast: true },
  responsive: ['desktop-full', 'laptop-tools-sheet', 'tablet-tools-sheet', 'mobile-icon-actions'],
  settings: { surface: 'Radix Sheet', restoreFocus: 'default', preferencePort: 'WorkspacePreferencesPort' },
  helpId: 'help.studio.shell',
  blockers: [],
};
fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'tooling/dist/m03-4-topbar-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`PASS_M03_4_TOPBAR_STRUCTURE mode=${report.mode} blockers=0`);
