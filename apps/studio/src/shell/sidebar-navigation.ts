import type { StudioIconId } from '@electrocraft/design-system';
import type { StudioShellMessageKey } from '../i18n/studio-shell.es';

export interface SidebarNavigationItemDefinition {
  readonly id: string;
  readonly labelKey: StudioShellMessageKey;
  readonly href: string;
  readonly iconId: StudioIconId;
}

export interface SidebarNavigationGroupDefinition {
  readonly id: string;
  readonly labelKey: StudioShellMessageKey;
  readonly items: readonly SidebarNavigationItemDefinition[];
}

export const studioSidebarNavigationGroups = Object.freeze([
  {
    id: 'build',
    labelKey: 'studio.sidebar.group.build',
    items: [
      { id: 'editor', labelKey: 'studio.navigation.editor', href: '/', iconId: 'studio.navigation.editor' },
      { id: 'screens', labelKey: 'studio.navigation.screens', href: '/pantallas', iconId: 'studio.navigation.screens' },
      { id: 'components', labelKey: 'studio.navigation.components', href: '/componentes', iconId: 'studio.navigation.components' },
      { id: 'templates', labelKey: 'studio.navigation.templates', href: '/plantillas', iconId: 'studio.navigation.templates' },
      { id: 'ai-generate', labelKey: 'studio.navigation.aiGenerate', href: '/generar-con-ia', iconId: 'studio.navigation.aiGenerate' },
    ],
  },
  {
    id: 'data',
    labelKey: 'studio.sidebar.group.data',
    items: [
      { id: 'records', labelKey: 'studio.navigation.records', href: '/registros', iconId: 'studio.navigation.records' },
      { id: 'models', labelKey: 'studio.navigation.models', href: '/modelos', iconId: 'studio.navigation.models' },
      { id: 'data-sources', labelKey: 'studio.navigation.dataSources', href: '/fuentes-de-datos', iconId: 'studio.navigation.dataSources' },
      { id: 'queries', labelKey: 'studio.navigation.queries', href: '/consultas', iconId: 'studio.navigation.queries' },
    ],
  },
  {
    id: 'logic',
    labelKey: 'studio.sidebar.group.logic',
    items: [
      { id: 'actions-workflows', labelKey: 'studio.navigation.actionsWorkflows', href: '/acciones-workflows', iconId: 'studio.navigation.actionsWorkflows' },
      { id: 'state-variables', labelKey: 'studio.navigation.stateVariables', href: '/estado-variables', iconId: 'studio.navigation.stateVariables' },
      { id: 'forms', labelKey: 'studio.navigation.forms', href: '/formularios', iconId: 'studio.navigation.forms' },
    ],
  },
  {
    id: 'app',
    labelKey: 'studio.sidebar.group.app',
    items: [
      { id: 'navigation', labelKey: 'studio.navigation.navigation', href: '/navegacion', iconId: 'studio.navigation.navigation' },
      { id: 'users-permissions', labelKey: 'studio.navigation.usersPermissions', href: '/usuarios-permisos', iconId: 'studio.navigation.usersPermissions' },
      { id: 'admin', labelKey: 'studio.navigation.admin', href: '/administracion', iconId: 'studio.navigation.admin' },
    ],
  },
  {
    id: 'resources',
    labelKey: 'studio.sidebar.group.resources',
    items: [
      { id: 'media', labelKey: 'studio.navigation.media', href: '/medios', iconId: 'studio.navigation.media' },
      { id: 'extensions', labelKey: 'studio.navigation.extensions', href: '/extensiones', iconId: 'studio.navigation.extensions' },
    ],
  },
  {
    id: 'appearance',
    labelKey: 'studio.sidebar.group.appearance',
    items: [
      { id: 'themes', labelKey: 'studio.navigation.themes', href: '/temas', iconId: 'studio.navigation.themes' },
      { id: 'design-system', labelKey: 'studio.navigation.designSystem', href: '/sistema-de-diseno', iconId: 'studio.navigation.designSystem' },
      { id: 'tokens', labelKey: 'studio.navigation.tokens', href: '/tokens', iconId: 'studio.navigation.tokens' },
    ],
  },
  {
    id: 'publish',
    labelKey: 'studio.sidebar.group.publish',
    items: [
      { id: 'preview', labelKey: 'studio.navigation.preview', href: '/vista-previa', iconId: 'studio.navigation.preview' },
      { id: 'compatibility', labelKey: 'studio.navigation.compatibility', href: '/compatibilidad', iconId: 'studio.navigation.compatibility' },
      { id: 'export', labelKey: 'studio.navigation.export', href: '/exportar', iconId: 'studio.navigation.export' },
      { id: 'deploy', labelKey: 'studio.navigation.deploy', href: '/desplegar', iconId: 'studio.navigation.deploy' },
    ],
  },
] as const satisfies readonly SidebarNavigationGroupDefinition[]);

type SidebarGroup = (typeof studioSidebarNavigationGroups)[number];
export type StudioSidebarItemId = SidebarGroup['items'][number]['id'];

export function resolveStudioSidebarItemId(pathname: string): StudioSidebarItemId | null {
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : pathname;
  for (const group of studioSidebarNavigationGroups) {
    for (const item of group.items) {
      if (item.href === normalized) return item.id;
    }
  }
  return null;
}
