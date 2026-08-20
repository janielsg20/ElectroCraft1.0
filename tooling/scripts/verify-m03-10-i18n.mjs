import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));
const fail = (message) => {
  throw new Error(`M03.10 contract: ${message}`);
};

const namespaces = [
  'common',
  'navigation',
  'editor',
  'content',
  'queries',
  'forms',
  'backend',
  'media',
  'themes',
  'export',
  'settings',
  'help',
  'ai',
];

const manifest = json('packages/i18n/package.json');
if (manifest.name !== '@electrocraft/i18n') fail('package owner must be @electrocraft/i18n');
if (manifest.dependencies?.i18next !== '26.3.6') fail('i18next pin must be 26.3.6');
if (manifest.dependencies?.['react-i18next'] !== '17.0.11') fail('react-i18next pin must be 17.0.11');
if (manifest.devDependencies?.['i18next-cli'] !== '1.69.0') fail('i18next-cli pin must be 1.69.0');

for (const namespace of namespaces) {
  const relative = `locales/es/${namespace}.json`;
  if (!fs.existsSync(path.join(root, relative))) fail(`missing ${relative}`);
  if (Object.keys(json(relative)).length === 0) fail(`${relative} must not be empty`);
}

const runtime = read('packages/i18n/src/index.ts');
for (const fragment of [
  "DEFAULT_LOCALE = 'es'",
  "FALLBACK_LOCALE = 'es'",
  'MissingTranslationError',
  'formatNumberEs',
  'formatDateEs',
  'formatCurrencyEs',
  'formatStudioErrorEs',
]) {
  if (!runtime.includes(fragment)) fail(`runtime missing ${fragment}`);
}

const resources = read('packages/i18n/src/resources.ts');
for (const namespace of namespaces) {
  if (!resources.includes(`'${namespace}'`)) fail(`resources missing namespace ${namespace}`);
}

const main = read('apps/studio/src/main.tsx');
if (!main.includes('initializeElectroCraftI18n')) fail('Studio root must initialize i18n');
if (!main.includes('ElectroCraftI18nProvider')) fail('Studio root must mount i18n provider');

const settings = read('apps/studio/src/shell/language-settings.tsx');
for (const fragment of [
  'data-settings-destination="general-language"',
  "settingsT('settings.general.title')",
  "settingsT('settings.language.label')",
  "settingsT('settings.language.spanish')",
  "settingsT('settings.language.save')",
  "settingsT('settings.language.cancel')",
  "getStudioIcon('studio.help')",
  'data-language-help-trigger',
]) {
  if (!settings.includes(fragment)) fail(`language settings missing ${fragment}`);
}
if (settings.includes('<select') || settings.includes('<option'))
  fail('language selector must not use native select/option');

const help = read('apps/studio/src/help/help-registry.ts');
const exactSummary =
  'ElectroCraft se entrega en español. La infraestructura de idiomas permite añadir traducciones futuras sin cambiar la lógica de la aplicación.';
if (!help.includes(exactSummary)) fail('language HelpDescriptor summary must match the contract');
if (!help.includes("id: 'help.studio.language'")) fail('language HelpDescriptor id missing');

const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
if (!navigation.includes("translateStrict('navigation', key)")) fail('Sidebar must consume navigation catalog');
if (!navigation.includes("href: '/content'")) fail('canonical /content route must remain stable');
if (!navigation.includes("id: 'editor'")) fail('canonical editor id must remain stable');

const route = read('apps/studio/src/shell/app-shell-route.tsx');
if (!route.includes("from '@electrocraft/i18n'")) fail('AppShell route must consume i18n public root');
if (route.includes('@electrocraft/i18n/')) fail('deep i18n imports are forbidden');

const puck = read('packages/editor-puck/src/puck-component-adapter.ts');
if (!puck.includes('PuckLabelResolver')) fail('Puck adapter must accept translated labels');
if (!puck.includes('electrocraftComponentId: definition.id')) fail('Puck canonical component id must remain stable');

const boundaries = json('tooling/package-boundaries.json');
if (!Object.hasOwn(boundaries.packages, '@electrocraft/i18n')) fail('boundary owner missing');
if (!boundaries.apps?.['@electrocraft/studio']?.includes('@electrocraft/i18n')) fail('Studio i18n dependency missing');
if (Object.keys(boundaries.packages).length !== 18) fail('workspace must own 18 stable packages after M03.10');

const state = read('.ai/STATE.md');
if (!state.includes('M03.10 — Infraestructura español-primero e i18n tipado: `ACTIVE`')) {
  fail('M03.10 must be the active microphase during implementation');
}

console.log(`PASS_M03_10_I18N_CONTRACT namespaces=${namespaces.length} locale=es packages=18`);
