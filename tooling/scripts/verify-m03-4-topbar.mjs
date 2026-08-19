import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'apps/studio/src/shell/app-shell.tsx',
  'apps/studio/src/shell/app-shell-route.tsx',
  'apps/studio/src/shell/topbar.tsx',
  'apps/studio/src/shell/topbar.css',
  'apps/studio/src/shell/workspace-preferences.ts',
  'apps/studio/src/i18n/studio-shell.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'tooling/vitest/unit/topbar-model.test.ts',
  'tooling/vitest/contract/topbar-boundary.test.ts',
  'tooling/vitest/integration/topbar-settings-runtime.test.ts',
  'tooling/playwright/m03-4-topbar.spec.ts',
  'tooling/scripts/verify-m03-3-sidebar.mjs',
  '.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md',
  '.ai/evidence/F03/M03.4/IMPLEMENTATION_2026-08-19.md',
  '.github/workflows/m03-4-topbar.yml',
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`M03.4 required file missing: ${file}`);
}

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const topbar = read('apps/studio/src/shell/topbar.tsx');
const topbarCss = read('apps/studio/src/shell/topbar.css');
const appShell = read('apps/studio/src/shell/app-shell.tsx');
const baseCss = read('apps/studio/src/styles.css');
const i18n = read('apps/studio/src/i18n/studio-shell.es.ts');
const help = read('apps/studio/src/help/help-registry.ts');
const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
const preferences = read('apps/studio/src/shell/workspace-preferences.ts');
const state = read('.ai/STATE.md');
const m033Closure = read('.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md');
const m033Verifier = read('tooling/scripts/verify-m03-3-sidebar.mjs');
const workflow = read('.github/workflows/m03-4-topbar.yml');

if (!baseCss.includes('height: 52px')) throw new Error('M03.4 Topbar 52px geometry missing');
for (const token of [
  'ec-topbar-left', 'ec-topbar-center', 'ec-topbar-right', 'PreviewExportLocal', 'HelpSheet', 'SettingsSheet',
  'preferencesPort.toggleSidebar', 'studio.topbar.undo', 'studio.topbar.redo',
]) {
  if (!topbar.includes(token)) throw new Error(`M03.4 Topbar capability missing: ${token}`);
}
const rightStart = topbar.indexOf('className="ec-topbar-right"');
const rightSource = topbar.slice(rightStart);
if (rightStart < 0 || rightSource.indexOf('<SettingsSheet') < rightSource.indexOf('<HelpSheet')) {
  throw new Error('M03.4 Settings Gear must be the final right-side control after Help');
}
if ((topbar.match(/disabled/g) ?? []).length < 2) throw new Error('M03.4 unavailable history actions must be explicitly disabled');
if (!topbar.includes("from '@electrocraft/design-system'")) throw new Error('M03.4 must consume design-system root export');
if (topbar.includes('lucide-react')) throw new Error('M03.4 Studio must not import Lucide directly');
if (!appShell.includes('helpId?') || !appShell.includes('help?: HelpDescriptor')) throw new Error('M03.4 must preserve AppShell helpId compatibility while adding persistent help');
if (!preferences.includes('WorkspacePreferencesPort') || preferences.includes('localStorage') || preferences.includes('PGlite')) throw new Error('M03.4 must reuse non-persistent F03 WorkspacePreferencesPort');

for (const key of [
  'studio.topbar.project', 'studio.topbar.save.ready', 'studio.topbar.document', 'studio.topbar.platform',
  'studio.topbar.breakpoint', 'studio.topbar.undo', 'studio.topbar.redo', 'studio.topbar.zoom', 'studio.topbar.local',
  'studio.topbar.tools', 'studio.settings.title', 'studio.settings.workspaceTitle', 'studio.settings.sidebarTitle',
]) {
  if (!i18n.includes(`'${key}'`)) throw new Error(`M03.4 i18n key missing: ${key}`);
}
for (const iconId of [
  'studio.topbar.document', 'studio.topbar.platform', 'studio.topbar.breakpoint', 'studio.topbar.undo',
  'studio.topbar.redo', 'studio.topbar.zoom', 'studio.topbar.tools', 'studio.topbar.local',
  'studio.topbar.preview', 'studio.topbar.export',
]) {
  if (!icons.includes(`'${iconId}'`)) throw new Error(`M03.4 Lucide registry ID missing: ${iconId}`);
}
if (!help.includes('Configuración es siempre el último control') || !help.includes('WorkspacePreferencesPort')) {
  throw new Error('M03.4 persistent help does not explain Topbar/Settings contract');
}
for (const token of ['@media (max-width: 1023px)', 'ec-topbar-tools-trigger', 'min-width: 44px', 'min-height: 44px']) {
  if (!topbarCss.includes(token)) throw new Error(`M03.4 responsive CSS missing: ${token}`);
}
if (!m033Closure.includes('32275890306') || !m033Closure.includes('9374022673') || !m033Closure.includes('GREEN')) {
  throw new Error('M03.3 closure evidence is incomplete');
}
if (!m033Verifier.includes('post-closure-regression')) throw new Error('M03.3 verifier must be a post-closure regression guard');
if (!/M03\.3[^\n]*COMPLETADA/.test(state) || !/M03\.4[^\n]*ACTIVE/.test(state)) {
  throw new Error('STATE transition M03.3 -> M03.4 is incomplete');
}
if (!workflow.includes('npx playwright install chromium') || workflow.includes('playwright install --with-deps')) {
  throw new Error('M03.4 workflow must avoid the apt-mirror-dependent Playwright install path');
}

const report = {
  schemaVersion: 1,
  microphase: 'M03.4',
  engine: 'shadcn/ui Radix + AppShell',
  baseCommit: '5d6e5d341222b924c3f8eb40567ab15dc1628ff8',
  topbarHeightPx: 52,
  regions: ['left', 'center', 'right'],
  settingsLast: true,
  settingsSheet: 'radix',
  preferencesPort: 'WorkspacePreferencesPort',
  responsive: ['desktop-full', 'laptop-reduced', 'tablet-tools-sheet', 'mobile-tools-sheet'],
  helpId: 'help.studio.shell',
  blockers: [],
};
fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'tooling/dist/m03-4-topbar-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('PASS_M03_4_TOPBAR_STRUCTURE blockers=0 settingsLast=true');
