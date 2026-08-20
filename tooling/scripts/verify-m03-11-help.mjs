import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));
const fail = (message) => {
  throw new Error(`M03.11 contract: ${message}`);
};

const required = [
  'apps/studio/src/help/help-registry.ts',
  'apps/studio/src/help/help-ui.tsx',
  'apps/studio/src/shell/studio-topbar.tsx',
  'apps/studio/src/shell/information-architecture-ui.tsx',
  'packages/design-system/src/components/ui/popover.tsx',
  'locales/es/help.json',
  '.ai/SECTION_HELP_CATALOG_ES.md',
];
for (const relativePath of required) {
  if (!fs.existsSync(path.join(root, relativePath))) fail(`missing ${relativePath}`);
}

const registry = read('apps/studio/src/help/help-registry.ts');
const helpUi = read('apps/studio/src/help/help-ui.tsx');
const topbar = read('apps/studio/src/shell/studio-topbar.tsx');
const iaUi = read('apps/studio/src/shell/information-architecture-ui.tsx');
const popover = read('packages/design-system/src/components/ui/popover.tsx');
const uiIndex = read('packages/design-system/src/components/ui/index.ts');
const catalog = read('.ai/SECTION_HELP_CATALOG_ES.md');
const helpCatalog = json('locales/es/help.json');

for (const field of ['titleKey', 'shortKey', 'longKey', 'exampleKeys', 'relatedIds', 'learnMoreRef']) {
  if (!registry.includes(field)) fail(`HelpDescriptor missing ${field}`);
}
if (!registry.includes('searchStudioHelp')) fail('HelpRegistry must expose local search');
if (!registry.includes('navigationKeywords')) fail('HelpRegistry must index keywords');
if (!registry.includes('navigationSection')) fail('HelpRegistry must index canonical navigation section');

for (const forbiddenId of ['help.section.taxonomies', 'help.section.relations', 'help.section.roles']) {
  if (registry.includes(forbiddenId)) fail(`obsolete top-level Help ID leaked into registry: ${forbiddenId}`);
}
for (const forbiddenRow of ['| Datos | Taxonomías |', '| Datos | Relaciones |', '| App | Roles |']) {
  if (catalog.includes(forbiddenRow)) fail(`obsolete top-level destination leaked into canonical table: ${forbiddenRow}`);
}

for (const key of [
  'help.drawer.search',
  'help.related',
  'help.example',
  'help.moreInfo',
  'help.whatCanIDo',
  'help.close',
]) {
  if (!(key in helpCatalog)) fail(`help namespace missing ${key}`);
}
if (helpCatalog['help.drawer.search'] !== 'Buscar en la ayuda') fail('search label drift');
if (helpCatalog['help.whatCanIDo'] !== '¿Qué puedo hacer aquí?') fail('empty-state help label drift');

for (const itemId of [
  'editor',
  'screens',
  'components',
  'templates',
  'ai-generate',
  'records',
  'models',
  'data-sources',
  'queries',
  'workflows',
  'state',
  'forms',
  'navigation',
  'users',
  'admin',
  'media',
  'extensions',
  'themes',
  'design-system',
  'tokens',
  'preview',
  'compatibility',
  'export',
  'deploy',
]) {
  for (const suffix of ['title', 'short', 'long', 'example']) {
    if (!(`help.section.${itemId}.${suffix}` in helpCatalog)) fail(`missing help.section.${itemId}.${suffix}`);
  }
}

for (const fragment of [
  '<Popover>',
  '<PopoverContent',
  '<Sheet>',
  'MOBILE_HELP_QUERY',
  'HELP_METRICS_ENABLED = false',
  'data-help-drawer',
  'data-help-desktop-popover',
  'data-help-mobile-sheet',
]) {
  if (!helpUi.includes(fragment)) fail(`Help UI missing ${fragment}`);
}
if (!popover.includes('Popover as PopoverPrimitive') || !popover.includes('PopoverPrimitive.Portal')) {
  fail('Design System Popover must use radix-ui owner and Portal');
}
if (!popover.includes('w-[360px]')) fail('desktop contextual Popover must use contractual 360px width');
if (!uiIndex.includes("export * from './popover'")) fail('Popover must be exported from Design System public root');

const helpIndex = topbar.indexOf('ec-topbar-help-trigger');
const settingsIndex = topbar.indexOf('data-topbar-settings-trigger');
if (helpIndex < 0 || settingsIndex < 0 || helpIndex >= settingsIndex) fail('Ayuda must remain before Settings');
if (!topbar.includes('<HelpDrawerTrigger')) fail('Topbar must consume the reusable Help Drawer');

if (!iaUi.includes('labelKey="help.whatCanIDo"')) fail('empty states must link ¿Qué puedo hacer aquí?');
if (!iaUi.includes('<HelpTrigger helpId={helpId}')) fail('module H1 must expose contextual HelpTrigger');

const languageSettings = read('apps/studio/src/shell/language-settings.tsx');
if (!languageSettings.includes('<HelpTrigger helpId="help.studio.language"')) fail('Idioma must reuse HelpTrigger');
if (languageSettings.includes('<Tooltip') || languageSettings.includes('<Popover')) {
  fail('module-specific language help composition is forbidden');
}

const state = read('.ai/STATE.md');
const active = /M03\.11[^\n]*ACTIVE/.test(state);
const closed = /M03\.11[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
const successorReady = /M03\.12[^\n]*(?:ACTIVE|COMPLETADA[^\n]*GREEN)/.test(state);
if (closed && !successorReady) fail('M03.12 must be ACTIVE or closed GREEN after M03.11 closes');
if (!active && !closed) fail('M03.11 must remain ACTIVE or close GREEN before F03 advances');

console.log('PASS_M03_11_CONTEXTUAL_HELP descriptors=27 navigation=24 metrics=off');
