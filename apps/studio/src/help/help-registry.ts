import { translateStrict, type ElectroCraftResourceKey } from '@electrocraft/i18n';
import { studioSidebarNavigation, type SidebarNavigationItemId } from '../shell/sidebar-navigation';

// M03.4 continuity: Configuración usa overlays Radix y restaura el foco al trigger al cerrar.
// M03.5 continuity: el workspace desktop conserva Contexto 288px, Lienzo flexible e Inspector 320px.
// M03.6 continuity: tablet conserva un rail global de 56px; móvil usa navegación inferior, Sheets inferiores y Más abre Capas/Outline a altura completa.
// M03.7 continuity: Progressive Disclosure clasifica información como primary, contextual, advanced o diagnostic; los diagnósticos críticos permanecen fuera de Advanced.
// M03.10 continuity: ElectroCraft se entrega en español. La infraestructura de idiomas permite añadir traducciones futuras sin cambiar la lógica de la aplicación.
// F04 continuity: almacenamiento, autosave, checkpoints, recovery y preferencias del workspace comparten help.projects.

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
  | 'help.screens'
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
    keywords: [
      'proyectos', 'almacenamiento', 'pglite', 'drizzle', 'opfs', 'indexeddb', 'persistencia', 'autosave',
      'checkpoint', 'restaurar', 'reparar', 'workspace', 'espacio de trabajo', 'preferencias', 'layout',
      'diseño guardado', 'panel lateral', 'sidebar', 'multi-tab',
    ],
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
    titleKey: helpKey('help.section.editor.title'),
    shortKey: helpKey('help.section.editor.short'),
    longKey: helpKey('help.section.editor.long'),
    exampleKeys: [helpKey('help.section.editor.example')],
    relatedIds: ['help.screens', 'help.navigation.builder', 'help.editor.advanced'],
    keywords: ['editor', 'pantalla', 'pantallas', 'screen composer', 'puck', 'plataforma', 'dispositivo', 'breakpoint'],
    learnMoreRef: '.ai/microphases/M07_3.md',
  },
  {
    id: 'help.navigation',
    sectionId: 'navigation-graph',
    navigationItemId: 'navigation',
    titleKey: helpKey('help.section.navigation.title'),
    shortKey: helpKey('help.section.navigation.short'),
    longKey: helpKey('help.section.navigation.long'),
    exampleKeys: [helpKey('help.section.navigation.example')],
    relatedIds: ['help.navigation.builder', 'help.screens', 'help.section.workflows'],
    keywords: ['navigation graph', 'pantallas', 'rutas', 'ruta', 'stack', 'tabs', 'drawer', 'modal', 'parámetros', 'deep link', 'guards'],
    learnMoreRef: '.ai/microphases/M07_1.md',
  },
  {
    id: 'help.navigation.builder',
    sectionId: 'navigation-builder',
    navigationItemId: 'navigation',
    titleKey: helpKey('help.section.navigation.title'),
    shortKey: helpKey('help.section.navigation.short'),
    longKey: helpKey('help.section.navigation.long'),
    exampleKeys: [helpKey('help.section.navigation.example')],
    relatedIds: ['help.navigation', 'help.screens', 'help.editor.screens'],
    keywords: ['navigation builder', 'reordenar', 'pila', 'pestañas', 'menú lateral', 'modal', 'pantalla inicial', 'header', 'atrás'],
    learnMoreRef: '.ai/microphases/M07_4.md',
  },
  {
    id: 'help.screens',
    sectionId: 'screens-management',
    navigationItemId: 'screens',
    titleKey: helpKey('help.section.screens.title'),
    shortKey: helpKey('help.section.screens.short'),
    longKey: helpKey('help.section.screens.long'),
    exampleKeys: [helpKey('help.section.screens.example')],
    relatedIds: ['help.navigation.builder', 'help.editor.screens'],
    keywords: ['pantallas', 'screen', 'ruta', 'navigator', 'plantilla', 'estado', 'duplicar', 'abrir en editor'],
    learnMoreRef: '.ai/microphases/M07_2.md',
  },
] as const satisfies readonly HelpDefinition[]);

const navigationKeywords: Readonly<Record<SidebarNavigationItemId, readonly string[]>> = Object.freeze({
  editor: ['editor', 'lienzo', 'canvas', 'inspector', 'puck'],
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
  navigation: ['help.navigation.builder', 'help.navigation', 'help.screens'],
  components: ['help.section.editor', 'help.section.templates'],
  records: ['help.section.models', 'help.section.queries', 'help.section.forms'],
  models: ['help.section.records', 'help.section.forms'],
  queries: ['help.section.records', 'help.section.data-sources'],
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
  titleKey: helpKey(`help.section.${itemId}.title`),
  shortKey: helpKey(`help.section.${itemId}.short`),
  longKey: helpKey(`help.section.${itemId}.long`),
  exampleKeys: [helpKey(`help.section.${itemId}.example`)],
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
