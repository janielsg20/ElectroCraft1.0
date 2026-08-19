import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const required = [
  'apps/studio/src/shell/app-shell.tsx',
  'apps/studio/src/shell/app-shell-route.tsx',
  'apps/studio/src/shell/sidebar-navigation.ts',
  'apps/studio/src/shell/workspace-preferences-port.ts',
  'apps/studio/src/shell/sidebar.css',
  'apps/studio/src/i18n/studio-shell.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'tooling/vitest/unit/workspace-preferences-port.test.ts',
  'tooling/vitest/contract/sidebar-navigation-boundary.test.ts',
  'tooling/vitest/integration/sidebar-runtime.test.ts',
  'tooling/playwright/m03-3-sidebar.spec.ts',
  '.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md',
  '.ai/evidence/F03/M03.3/IMPLEMENTATION_2026-08-19.md',
  '.github/workflows/m03-3-sidebar.yml',
];

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`M03.3 required file missing: ${file}`);
}

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const shell = read('apps/studio/src/shell/app-shell.tsx');
const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
const preferences = read('apps/studio/src/shell/workspace-preferences-port.ts');
const css = read('apps/studio/src/shell/sidebar.css');
const i18n = read('apps/studio/src/i18n/studio-shell.es.ts');
const help = read('apps/studio/src/help/help-registry.ts');
const icons = read('packages/design-system/src/icons/studio-icon-registry.ts');
const state = read('.ai/STATE.md');
const closure = read('.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md');
const workflow = read('.github/workflows/m03-3-sidebar.yml');

for (const group of ['Construir', 'Datos', 'Lógica', 'App', 'Recursos', 'Apariencia', 'Publicar']) {
  if (!i18n.includes(`'${group}'`)) throw new Error(`M03.3 group missing: ${group}`);
}
for (const label of [
  'Editor', 'Pantallas', 'Componentes', 'Plantillas', 'Generar con IA', 'Registros', 'Modelos', 'Fuentes de datos',
  'Consultas', 'Acciones y workflows', 'Estado y variables', 'Formularios', 'Navegación', 'Usuarios y permisos',
  'Administración', 'Medios', 'Extensiones', 'Temas', 'Sistema de diseño', 'Tokens', 'Vista previa', 'Compatibilidad',
  'Exportar', 'Desplegar',
]) {
  if (!i18n.includes(`'${label}'`)) throw new Error(`M03.3 Spanish item missing: ${label}`);
}
if (navigation.includes('Taxonomías') || navigation.includes('Relaciones')) {
  throw new Error('M03.3 Taxonomías/Relaciones must not be top-level Sidebar items');
}
for (const token of ['aria-current', 'WorkspacePreferencesPort', 'TooltipContent', 'setSidebarCollapsed']) {
  if (!shell.includes(token)) throw new Error(`M03.3 AppShell capability missing: ${token}`);
}
for (const token of ['getSnapshot', 'subscribe', 'setSidebarCollapsed', 'createInMemoryWorkspacePreferencesPort']) {
  if (!preferences.includes(token)) throw new Error(`M03.3 preferences port missing: ${token}`);
}
for (const token of ["data-sidebar-collapsed='true'", 'grid-template-columns: 64px', 'min-height: 44px']) {
  if (!css.includes(token)) throw new Error(`M03.3 Sidebar CSS missing: ${token}`);
}
for (const iconId of [
  'studio.navigation.editor', 'studio.navigation.screens', 'studio.navigation.components', 'studio.navigation.templates',
  'studio.navigation.aiGenerate', 'studio.navigation.records', 'studio.navigation.models', 'studio.navigation.dataSources',
  'studio.navigation.queries', 'studio.navigation.actionsWorkflows', 'studio.navigation.stateVariables', 'studio.navigation.forms',
  'studio.navigation.navigation', 'studio.navigation.usersPermissions', 'studio.navigation.admin', 'studio.navigation.media',
  'studio.navigation.extensions', 'studio.navigation.themes', 'studio.navigation.designSystem', 'studio.navigation.tokens',
  'studio.navigation.preview', 'studio.navigation.compatibility', 'studio.navigation.export', 'studio.navigation.deploy',
  'studio.sidebar.collapse', 'studio.sidebar.expand',
]) {
  if (!icons.includes(`'${iconId}'`)) throw new Error(`M03.3 Lucide registry ID missing: ${iconId}`);
}
if (!help.includes("id: 'help.studio.shell'")) throw new Error('M03.3 persistent help.studio.shell missing');
if (!help.includes('WorkspacePreferencesPort')) throw new Error('M03.3 help must explain the workspace preference port');
if (!closure.includes('32272564567') || !closure.includes('9372759537') || !closure.includes('GREEN')) {
  throw new Error('M03.2 closure evidence is incomplete');
}
if (!state.includes('M03.2') || !state.includes('COMPLETADA') || !state.includes('M03.3') || !state.includes('ACTIVE')) {
  throw new Error('STATE transition M03.2 -> M03.3 is incomplete');
}
if (!workflow.includes('npx playwright install chromium') || workflow.includes('playwright install --with-deps')) {
  throw new Error('M03.3 workflow must avoid the apt-mirror-dependent Playwright install path');
}

const report = {
  schemaVersion: 1,
  microphase: 'M03.3',
  engine: 'shadcn/ui Radix + AppShell',
  baseCommit: '38b2f5aac504a406b42537b7aade8f3d26626e7d',
  groups: 7,
  items: 24,
  geometry: { expanded: 240, collapsed: 64 },
  preferencesPort: 'WorkspacePreferencesPort',
  adapter: 'in-memory',
  helpId: 'help.studio.shell',
  blockers: [],
};
fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'tooling/dist/m03-3-sidebar-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log('PASS_M03_3_SIDEBAR_STRUCTURE blockers=0 groups=7 items=24');
