import aiEs from '../../../locales/es/ai.json' with { type: 'json' };
import backendEs from '../../../locales/es/backend.json' with { type: 'json' };
import commonEs from '../../../locales/es/common.json' with { type: 'json' };
import contentEs from '../../../locales/es/content.json' with { type: 'json' };
import editorEs from '../../../locales/es/editor.json' with { type: 'json' };
import exportEs from '../../../locales/es/export.json' with { type: 'json' };
import formsEs from '../../../locales/es/forms.json' with { type: 'json' };
import helpEs from '../../../locales/es/help.json' with { type: 'json' };
import mediaEs from '../../../locales/es/media.json' with { type: 'json' };
import navigationEs from '../../../locales/es/navigation.json' with { type: 'json' };
import queriesEs from '../../../locales/es/queries.json' with { type: 'json' };
import settingsEs from '../../../locales/es/settings.json' with { type: 'json' };
import themesEs from '../../../locales/es/themes.json' with { type: 'json' };

export const electroCraftNamespaces = Object.freeze([
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
] as const);

export const resourcesEs = Object.freeze({
  common: commonEs,
  navigation: navigationEs,
  editor: editorEs,
  content: contentEs,
  queries: queriesEs,
  forms: formsEs,
  backend: backendEs,
  media: mediaEs,
  themes: themesEs,
  export: exportEs,
  settings: settingsEs,
  help: helpEs,
  ai: aiEs,
} as const);

export type ElectroCraftNamespace = (typeof electroCraftNamespaces)[number];
export type ElectroCraftResourceKey<Namespace extends ElectroCraftNamespace> = keyof (typeof resourcesEs)[Namespace] &
  string;
