import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const requiredNamespaces = [
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
] as const;

describe('M03.10 i18n ownership contract', () => {
  it('owns a single Spanish JSON catalog set behind @electrocraft/i18n', () => {
    const manifest = JSON.parse(read('packages/i18n/package.json')) as { name: string };
    expect(manifest.name).toBe('@electrocraft/i18n');
    for (const namespace of requiredNamespaces) {
      expect(fs.existsSync(path.join(root, `locales/es/${namespace}.json`))).toBe(true);
    }
  });

  it('keeps canonical route/component ids stable while moving visible labels to Spanish resources', () => {
    const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');
    expect(navigation).toContain("id: 'editor'");
    expect(navigation).toContain("href: '/content'");
    expect(navigation).toContain("translateStrict('navigation', key)");
    expect(navigation).not.toContain("studioT('studio.sidebar.item.editor')");
  });

  it('wires the AppShell through the typed owner without deep imports', () => {
    const route = read('apps/studio/src/shell/app-shell-route.tsx');
    expect(route).toContain("from '@electrocraft/i18n'");
    expect(route).not.toContain('@electrocraft/i18n/');
    expect(route).toContain("commonT('studio.appShell.title')");
  });

  it('exposes General > Idioma with Spanish copy, reusable Help and explicit Save/Cancel', () => {
    const settings = read('apps/studio/src/shell/language-settings.tsx');
    const helpUi = read('apps/studio/src/help/help-ui.tsx');
    expect(settings).toContain('data-settings-destination="general-language"');
    expect(settings).toContain("settingsT('settings.general.title')");
    expect(settings).toContain("settingsT('settings.language.label')");
    expect(settings).toContain("settingsT('settings.language.spanish')");
    expect(settings).toContain("settingsT('settings.language.save')");
    expect(settings).toContain("settingsT('settings.language.cancel')");
    expect(settings).toContain('<HelpTrigger helpId="help.studio.language"');
    expect(helpUi).toContain("getStudioIcon('studio.help')");
  });

  it('prevents known English shell labels from entering Spanish catalogs', () => {
    const catalogs = requiredNamespaces.map((namespace) => read(`locales/es/${namespace}.json`)).join('\n');
    for (const forbidden of ['Settings', 'Save changes', 'Cancel changes', 'Components panel', 'Export project']) {
      expect(catalogs).not.toContain(`\"${forbidden}\"`);
    }
  });
});
