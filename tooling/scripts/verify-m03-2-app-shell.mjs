import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'apps/studio/src/shell/app-shell.tsx',
  'apps/studio/src/shell/app-shell-layout.ts',
  'apps/studio/src/shell/app-shell-route.tsx',
  'apps/studio/src/i18n/studio-shell.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/components/ui/sheet.tsx',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'tooling/playwright/m03-2-app-shell.spec.ts',
  'tooling/vitest/unit/app-shell-layout.test.ts',
  'tooling/vitest/contract/app-shell-boundary.test.ts',
  'tooling/vitest/integration/app-shell-runtime.test.ts',
  '.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md',
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`M03.2 required file missing: ${file}`);
}

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('apps/studio/src/styles.css');
const shell = read('apps/studio/src/shell/app-shell.tsx');
const layout = read('apps/studio/src/shell/app-shell-layout.ts');
const i18n = read('apps/studio/src/i18n/studio-shell.es.ts');
const help = read('apps/studio/src/help/help-registry.ts');
const sheet = read('packages/design-system/src/components/ui/sheet.tsx');
const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
const state = read('.ai/STATE.md');
const closure = read('.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md');

for (const token of ['100dvh', '240px', '64px', '52px', '26px', 'overflow: hidden', 'min-width: 0']) {
  if (!css.includes(token)) throw new Error(`M03.2 CSS contract missing: ${token}`);
}
for (const token of ['sidebarExpandedPx: 240', 'sidebarCollapsedPx: 64', 'topbarPx: 52', 'statusbarPx: 26']) {
  if (!layout.includes(token)) throw new Error(`M03.2 layout contract missing: ${token}`);
}
for (const label of [
  'Editor',
  'Pantallas',
  'Plantillas',
  'Componentes',
  'Generar con IA',
  'Contenido',
  'Modelos',
  'Consultas',
  'Formularios',
  'Automatizaciones',
  'Administración',
  'Roles',
  'Medios',
  'Extensiones',
  'Temas',
  'Vista previa',
  'Compatibilidad',
  'Exportar',
  'Desplegar',
  'Ayuda',
  'Configuración',
]) {
  if (!i18n.includes(`'${label}'`)) throw new Error(`M03.2 Spanish navigation label missing: ${label}`);
}
if (!shell.includes("from '@electrocraft/design-system'")) {
  throw new Error('M03.2 must consume design-system root export');
}
if (shell.includes('@electrocraft/design-system/')) throw new Error('M03.2 deep workspace import is forbidden');
if (!help.includes("id: 'help.studio.shell'")) throw new Error('M03.2 help.studio.shell missing');
if (!sheet.includes("side?: 'left' | 'right'")) throw new Error('M03.2 left/right Radix Sheet support missing');
if (!icons.includes("'studio.menu': Menu")) throw new Error('M03.2 Lucide menu icon ID missing');
if (!closure.includes('32267795991') || !closure.includes('GREEN')) {
  throw new Error('M03.1 closure evidence is not GREEN');
}
if (
  !state.includes('M03.1') ||
  !state.includes('COMPLETADA') ||
  !state.includes('M03.2') ||
  !state.includes('ACTIVE')
) {
  throw new Error('STATE transition M03.1 -> M03.2 is incomplete');
}

const report = {
  schemaVersion: 1,
  microphase: 'M03.2',
  engine: 'shadcn/ui Radix + AppShell',
  baseCommit: 'c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae',
  geometry: { root: '100dvh', sidebar: [240, 64], topbar: 52, statusbar: 26 },
  responsive: ['desktop', 'laptop', 'tablet-sheet', 'mobile-sheet'],
  helpId: 'help.studio.shell',
  blockers: [],
};
fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'tooling/dist/m03-2-app-shell-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('PASS_M03_2_APP_SHELL_STRUCTURE blockers=0');
