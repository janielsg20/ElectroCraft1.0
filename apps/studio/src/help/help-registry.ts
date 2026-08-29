import { translateStrict, type ElectroCraftResourceKey } from '@electrocraft/i18n';
import { studioSidebarNavigation, type SidebarNavigationItemId } from '../shell/sidebar-navigation';

type HelpMessageKey = ElectroCraftResourceKey<'help'>;

export type StudioHelpId =
  | 'help.studio.shell'
  | 'help.studio.appearance'
  | 'help.studio.language'
  | 'help.projects'
  | 'help.editor.advanced'
  | 'help.editor.screens'
  | 'help.navigation'
  | 'help.navigation.builder'
  | 'help.navigation.routes'
  | 'help.navigation.guards'
  | 'help.navigation.compiler'
  | 'help.screens'
  | 'help.data.sources'
  | 'help.data.internal'
  | 'help.data.rest'
  | `help.section.${SidebarNavigationItemId}`;

export interface HelpDescriptor {
  readonly id: StudioHelpId;
  readonly sectionId: string;
  readonly section: string;
  readonly titleKey: HelpMessageKey;
  readonly shortKey: HelpMessageKey;
  readonly longKey: HelpMessageKey;
  readonly exampleKeys: readonly HelpMessageKey[];
  readonly relatedIds: readonly StudioHelpId[];
  readonly keywords: readonly string[];
  readonly learnMoreRef?: string;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

interface HelpDefinition {
  readonly id: StudioHelpId;
  readonly sectionId: string;
  readonly navigationItemId?: SidebarNavigationItemId;
  readonly titleKey: HelpMessageKey;
  readonly shortKey: HelpMessageKey;
  readonly longKey: HelpMessageKey;
  readonly exampleKeys: readonly HelpMessageKey[];
  readonly relatedIds: readonly StudioHelpId[];
  readonly keywords: readonly string[];
  readonly learnMoreRef?: string;
}

const helpT = (key: HelpMessageKey) => translateStrict('help', key);
const helpKey = (value: string) => value as HelpMessageKey;

function navigationSection(itemId: SidebarNavigationItemId): string {
  for (const group of studioSidebarNavigation) {
    if (group.items.some((item) => item.id === itemId)) return group.label;
  }
  return helpT('help.shell.title');
}

function resolveDefinition(definition: HelpDefinition): HelpDescriptor {
  const exampleDetails = definition.exampleKeys.map((key) => helpT(key));
  return Object.freeze({
    ...definition,
    section: definition.navigationItemId ? navigationSection(definition.navigationItemId) : helpT(definition.titleKey),
    title: helpT(definition.titleKey),
    summary: helpT(definition.shortKey),
    details: Object.freeze([helpT(definition.longKey), ...exampleDetails]),
  });
}

function sectionKeys(section: SidebarNavigationItemId) {
  return Object.freeze({
    titleKey: helpKey(`help.section.${section}.title`),
    shortKey: helpKey(`help.section.${section}.short`),
    longKey: helpKey(`help.section.${section}.long`),
    exampleKeys: Object.freeze([helpKey(`help.section.${section}.example`)]),
  });
}

const navigationKeys = sectionKeys('navigation');
const dataSourceKeys = sectionKeys('data-sources');
const screensKeys = sectionKeys('screens');

const studioDefinitions = Object.freeze([
  {
    id: 'help.studio.shell',
    sectionId: 'studio',
    titleKey: 'help.shell.title',
    shortKey: 'help.shell.short',
    longKey: 'help.shell.long',
    exampleKeys: ['help.shell.behavior', 'help.shell.example'],
    relatedIds: ['help.section.editor', 'help.studio.appearance', 'help.studio.language', 'help.projects'],
    keywords: ['appshell', 'sidebar', 'topbar', 'statusbar', 'workspace', 'configuración', 'navegación'],
    learnMoreRef: '.ai/APP_SHELL_SPEC.md',
  },
  {
    id: 'help.studio.appearance',
    sectionId: 'settings-appearance',
    titleKey: 'help.appearance.title',
    shortKey: 'help.appearance.short',
    longKey: 'help.appearance.long',
    exampleKeys: ['help.appearance.example'],
    relatedIds: ['help.studio.shell', 'help.section.themes', 'help.section.tokens'],
    keywords: ['apariencia', 'densidad', 'color', 'tipografía', 'movimiento', 'studio'],
  },
  {
    id: 'help.studio.language',
    sectionId: 'settings-language',
    titleKey: 'help.language.title',
    shortKey: 'help.language.summary',
    longKey: 'help.language.detail',
    exampleKeys: ['help.language.example'],
    relatedIds: ['help.studio.shell'],
    keywords: ['idioma', 'español', 'i18n', 'traducción', 'fallback'],
    learnMoreRef: '.ai/I18N_SPEC.md',
  },
  {
    id: 'help.projects',
    sectionId: 'settings-projects-workspace',
    titleKey: 'help.projects.title',
    shortKey: 'help.projects.short',
    longKey: 'help.projects.long',
    exampleKeys: ['help.projects.example'],
    relatedIds: ['help.studio.shell', 'help.section.records', 'help.section.media'],
    keywords: ['proyectos', 'almacenamiento', 'pglite', 'drizzle', 'persistencia', 'autosave', 'checkpoint', 'restaurar', 'workspace', 'multi-tab'],
    learnMoreRef: '.ai/microphases/M04_7.md',
  },
  {
    id: 'help.editor.advanced',
    sectionId: 'editor-advanced',
    navigationItemId: 'editor',
    titleKey: 'help.editor.advanced.title',
    shortKey: 'help.editor.advanced.short',
    longKey: 'help.editor.advanced.long',
    exampleKeys: ['help.editor.advanced.example'],
    relatedIds: ['help.section.editor', 'help.section.tokens'],
    keywords: ['layout', 'diseño', 'estilo', 'fila', 'columna', 'cuadrícula', 'tokens', 'restablecer', 'heredado'],
    learnMoreRef: '.ai/microphases/M06_1.md',
  },
  {
    id: 'help.editor.screens',
    sectionId: 'editor-screens',
    navigationItemId: 'editor',
    ...sectionKeys('editor'),
    relatedIds: ['help.screens', 'help.navigation.builder', 'help.editor.advanced'],
    keywords: ['editor', 'pantalla', 'pantallas', 'screen composer', 'puck', 'plataforma', 'dispositivo', 'breakpoint'],
    learnMoreRef: '.ai/microphases/M07_3.md',
  },
  {
    id: 'help.navigation',
    sectionId: 'navigation-graph',
    navigationItemId: 'navigation',
    ...navigationKeys,
    relatedIds: ['help.navigation.builder', 'help.navigation.routes', 'help.navigation.guards', 'help.navigation.compiler'],
    keywords: ['navigation graph', 'pantallas', 'rutas', 'stack', 'tabs', 'drawer', 'modal', 'parámetros', 'deep link', 'guards', 'compiler'],
    learnMoreRef: '.ai/microphases/M07_1.md',
  },
  {
    id: 'help.navigation.builder',
    sectionId: 'navigation-builder',
    navigationItemId: 'navigation',
    ...navigationKeys,
    relatedIds: ['help.navigation', 'help.navigation.routes', 'help.screens'],
    keywords: ['navigation builder', 'reordenar', 'pila', 'pestañas', 'menú lateral', 'modal', 'pantalla inicial', 'header', 'atrás'],
    learnMoreRef: '.ai/microphases/M07_4.md',
  },
  {
    id: 'help.navigation.routes',
    sectionId: 'navigation-routes',
    navigationItemId: 'navigation',
    ...navigationKeys,
    relatedIds: ['help.navigation.builder', 'help.navigation.guards', 'help.section.workflows'],
    keywords: ['rutas', 'parámetros', 'enlace profundo', 'deep link', 'destino', 'reemplazar', 'volver', 'enlace externo', 'binding'],
    learnMoreRef: '.ai/microphases/M07_5.md',
  },
  {
    id: 'help.navigation.guards',
    sectionId: 'navigation-guards',
    navigationItemId: 'navigation',
    ...navigationKeys,
    relatedIds: ['help.navigation.routes', 'help.navigation', 'help.section.users'],
    keywords: ['acceso', 'público', 'autenticado', 'iniciar sesión', 'permiso', 'condición', 'redirect', 'redirigir', 'guards', 'seguridad'],
    learnMoreRef: '.ai/microphases/M07_6.md',
  },
  {
    id: 'help.navigation.compiler',
    sectionId: 'navigation-compiler',
    navigationItemId: 'navigation',
    ...navigationKeys,
    relatedIds: ['help.navigation', 'help.section.compatibility', 'help.section.export'],
    keywords: ['compiler', 'react router', 'expo router', 'wordpress', 'capacitor', 'static web', 'lamp', 'slim', 'compatibilidad', 'diagnóstico'],
    learnMoreRef: '.ai/microphases/M07_7.md',
  },
  {
    id: 'help.screens',
    sectionId: 'screens-management',
    navigationItemId: 'screens',
    ...screensKeys,
    relatedIds: ['help.navigation.builder', 'help.editor.screens'],
    keywords: ['pantallas', 'screen', 'ruta', 'navigator', 'plantilla', 'estado', 'duplicar', 'abrir en editor'],
    learnMoreRef: '.ai/microphases/M07_2.md',
  },
  {
    id: 'help.data.sources',
    sectionId: 'data-sources-management',
    navigationItemId: 'data-sources',
    ...dataSourceKeys,
    relatedIds: ['help.data.internal', 'help.data.rest', 'help.section.queries', 'help.section.records', 'help.projects'],
    keywords: ['fuentes de datos', 'data sources', 'connector registry', 'adapter', 'capabilities', 'authref', 'credenciales', 'gateway', 'esquema', 'entornos', 'seguridad'],
    learnMoreRef: '.ai/microphases/M08_1.md',
  },
  {
    id: 'help.data.internal',
    sectionId: 'data-internal',
    navigationItemId: 'data-sources',
    ...dataSourceKeys,
    relatedIds: ['help.data.sources', 'help.data.rest', 'help.section.models', 'help.section.records', 'help.projects'],
    keywords: ['electrocraft data', 'pglite', 'drizzle', 'local', 'offline', 'disponible sin conexión', 'modelos', 'registros', 'content_records', 'copia de seguridad'],
    learnMoreRef: '.ai/microphases/M08_2.md',
  },
  {
    id: 'help.data.rest',
    sectionId: 'data-rest',
    navigationItemId: 'data-sources',
    ...dataSourceKeys,
    relatedIds: ['help.data.sources', 'help.data.internal', 'help.section.queries'],
    keywords: ['rest api', 'openapi', 'swagger', 'endpoint', 'secretref', 'connectorgateway', 'cors', 'fetch', 'operaciones', 'autenticación'],
    learnMoreRef: '.ai/microphases/M08_3.md',
  },
] as const satisfies readonly HelpDefinition[]);

const navigationKeywords: Readonly<Record<SidebarNavigationItemId, readonly string[]>> = Object.freeze({
  editor: ['editor', 'lienzo', 'canvas', 'inspector', 'puck', 'construir'],
  screens: ['pantallas', 'screens', 'rutas'],
  components: ['componentes', 'palette', 'puck', 'widgets'],
  templates: ['plantillas', 'templates', 'reutilizar'],
  'ai-generate': ['ia', 'ai', 'generar', 'asistente'],
  records: ['registros', 'contenido', 'content', 'list detail'],
  models: ['modelos', 'campos', 'schema', 'contenido'],
  'data-sources': ['fuentes', 'datos', 'conexiones', 'adapters'],
  queries: ['consultas', 'queries', 'filtros', 'rqb'],
  workflows: ['acciones', 'workflows', 'rete', 'lógica'],
  state: ['estado', 'variables', 'zustand'],
  forms: ['formularios', 'forms', 'validación', 'zod'],
  navigation: ['navegación', 'rutas', 'destinos'],
  users: ['usuarios', 'permisos', 'roles', 'auth'],
  admin: ['administración', 'admin', 'refine'],
  media: ['medios', 'media', 'assets', 'archivos'],
  extensions: ['extensiones', 'plugins', 'capabilities'],
  themes: ['temas', 'theme', 'frontend'],
  'design-system': ['sistema de diseño', 'design system', 'radix', 'lucide'],
  tokens: ['tokens', 'color', 'spacing', 'tipografía'],
  preview: ['vista previa', 'preview', 'breakpoint'],
  compatibility: ['compatibilidad', 'capabilities', 'targets'],
  export: ['exportar', 'export', 'exportir', 'target'],
  deploy: ['desplegar', 'deploy', 'publicar'],
});

const navigationRelated: Partial<Record<SidebarNavigationItemId, readonly StudioHelpId[]>> = Object.freeze({
  editor: ['help.editor.screens', 'help.section.components', 'help.screens'],
  screens: ['help.screens', 'help.navigation.builder', 'help.editor.screens'],
  navigation: ['help.navigation.builder', 'help.navigation.routes', 'help.navigation'],
  components: ['help.section.editor', 'help.section.templates'],
  records: ['help.section.models', 'help.section.queries', 'help.section.forms'],
  models: ['help.section.records', 'help.section.forms'],
  'data-sources': ['help.data.sources', 'help.data.internal', 'help.data.rest', 'help.section.queries'],
  queries: ['help.section.records', 'help.data.sources'],
  forms: ['help.section.models', 'help.section.workflows'],
  themes: ['help.studio.appearance', 'help.section.tokens'],
  preview: ['help.section.compatibility', 'help.section.export'],
  compatibility: ['help.section.preview', 'help.section.export'],
  export: ['help.section.compatibility', 'help.section.deploy'],
  deploy: ['help.section.export'],
});

const navigationItemIds = Object.freeze(
  studioSidebarNavigation.flatMap((group) => group.items.map((item) => item.id)) as SidebarNavigationItemId[],
);

const navigationDefinitions: readonly HelpDefinition[] = navigationItemIds.map((itemId) => ({
  id: `help.section.${itemId}` as StudioHelpId,
  sectionId: itemId,
  navigationItemId: itemId,
  ...sectionKeys(itemId),
  relatedIds: navigationRelated[itemId] ?? ['help.studio.shell'],
  keywords: navigationKeywords[itemId],
}));

const helpDefinitions = Object.freeze([...studioDefinitions, ...navigationDefinitions]);
const resolvedDescriptors = helpDefinitions.map(resolveDefinition);

export const studioHelpRegistry = Object.freeze(
  Object.fromEntries(resolvedDescriptors.map((descriptor) => [descriptor.id, descriptor])) as Readonly<
    Record<StudioHelpId, HelpDescriptor>
  >,
);

export const studioHelpDescriptors = Object.freeze(resolvedDescriptors);
export const studioShellHelpDescriptor = studioHelpRegistry['help.studio.shell'];
export const studioAppearanceHelpDescriptor = studioHelpRegistry['help.studio.appearance'];
export const studioLanguageHelpDescriptor = studioHelpRegistry['help.studio.language'];

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  const descriptor = studioHelpRegistry[helpId];
  if (!descriptor) throw new Error(`Unknown Studio help descriptor: ${helpId}`);
  return descriptor;
}

export function getHelpIdForNavigationItem(itemId: SidebarNavigationItemId): StudioHelpId {
  if (itemId === 'editor') return 'help.editor.screens';
  if (itemId === 'screens') return 'help.screens';
  if (itemId === 'navigation') return 'help.navigation.builder';
  if (itemId === 'data-sources') return 'help.data.sources';
  return `help.section.${itemId}`;
}

export function searchStudioHelp(query: string): readonly HelpDescriptor[] {
  const normalized = query.trim().toLocaleLowerCase('es');
  if (!normalized) return studioHelpDescriptors;

  return studioHelpDescriptors.filter((descriptor) => {
    const searchable = [
      descriptor.title,
      descriptor.summary,
      descriptor.section,
      ...descriptor.details,
      ...descriptor.keywords,
    ]
      .join(' ')
      .toLocaleLowerCase('es');
    return searchable.includes(normalized);
  });
}
