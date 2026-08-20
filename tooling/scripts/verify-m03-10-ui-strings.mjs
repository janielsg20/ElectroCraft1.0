import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => {
  throw new Error(`M03.10 UI-string lint: ${message}`);
};

const migratedUiFiles = [
  'apps/studio/src/shell/language-settings.tsx',
  'apps/studio/src/shell/app-shell-route.tsx',
  'apps/studio/src/shell/sidebar-navigation.ts',
];

const forbiddenVisibleEnglish = [
  'Save changes',
  'Cancel changes',
  'Open settings',
  'Components panel',
  'Export project',
  'Language settings',
];

for (const relativePath of migratedUiFiles) {
  const source = read(relativePath);
  for (const text of forbiddenVisibleEnglish) {
    if (source.includes(`>${text}<`) || source.includes(`'${text}'`) || source.includes(`\"${text}\"`)) {
      fail(`${relativePath} contains forbidden visible English: ${text}`);
    }
  }
}

const language = read('apps/studio/src/shell/language-settings.tsx');
const forbiddenHardcodedSpanish = [
  '>Idioma<',
  '>Español<',
  '>Configuración general<',
  '>Guardar<',
  '>Cancelar<',
];
for (const fragment of forbiddenHardcodedSpanish) {
  if (language.includes(fragment)) fail(`language-settings must obtain ${fragment} from translation keys`);
}

const route = read('apps/studio/src/shell/app-shell-route.tsx');
if (route.includes("studioT('studio.appShell.")) fail('AppShell visible copy must not fall back to legacy TS catalog');
if (route.includes("studioT('studio.topbar.")) fail('Topbar visible copy must not fall back to legacy TS catalog');

const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
if (navigation.includes("studioT('studio.sidebar.")) fail('Sidebar visible copy must not fall back to legacy TS catalog');

console.log(`PASS_M03_10_UI_STRING_LINT files=${migratedUiFiles.length} forbiddenEnglish=${forbiddenVisibleEnglish.length}`);
