import type { StudioIconId } from '@electrocraft/design-system';
import { studioT } from '../i18n/studio-shell.es';

export interface SidebarNavigationItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly iconId: StudioIconId;
}

export interface SidebarNavigationGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly SidebarNavigationItem[];
}

const navigation = [
  {
    id: 'build',
    label: studioT('studio.sidebar.group.build'),
    items: [
      { id: 'editor', label: studioT('studio.sidebar.item.editor'), href: '/', iconId: 'studio.sidebar.editor' },
      {
        id: 'screens',
        label: studioT('studio.sidebar.item.screens'),
        href: '/screens',
        iconId: 'studio.sidebar.screens',
      },
      {
        id: 'components',
        label: studioT('studio.sidebar.item.components'),
        href: '/components',
        iconId: 'studio.sidebar.components',
      },
      {
        id: 'templates',
        label: studioT('studio.sidebar.item.templates'),
        href: '/templates',
        iconId: 'studio.sidebar.templates',
      },
      {
        id: 'ai-generate',
        label: studioT('studio.sidebar.item.aiGenerate'),
        href: '/ai',
        iconId: 'studio.sidebar.aiGenerate',
      },
    ],
  },
  {
    id: 'data',
    label: studioT('studio.sidebar.group.data'),
    items: [
      {
        id: 'records',
        label: studioT('studio.sidebar.item.records'),
        href: '/content',
        iconId: 'studio.sidebar.records',
      },
      { id: 'models', label: studioT('studio.sidebar.item.models'), href: '/models', iconId: 'studio.sidebar.models' },
      {
        id: 'data-sources',
        label: studioT('studio.sidebar.item.dataSources'),
        href: '/data-sources',
        iconId: 'studio.sidebar.dataSources',
      },
      {
        id: 'queries',
        label: studioT('studio.sidebar.item.queries'),
        href: '/queries',
        iconId: 'studio.sidebar.queries',
      },
    ],
  },
  {
    id: 'logic',
    label: studioT('studio.sidebar.group.logic'),
    items: [
      {
        id: 'workflows',
        label: studioT('studio.sidebar.item.workflows'),
        href: '/workflows',
        iconId: 'studio.sidebar.workflows',
      },
      { id: 'state', label: studioT('studio.sidebar.item.state'), href: '/state', iconId: 'studio.sidebar.state' },
      { id: 'forms', label: studioT('studio.sidebar.item.forms'), href: '/forms', iconId: 'studio.sidebar.forms' },
    ],
  },
  {
    id: 'app',
    label: studioT('studio.sidebar.group.app'),
    items: [
      {
        id: 'navigation',
        label: studioT('studio.sidebar.item.navigation'),
        href: '/navigation',
        iconId: 'studio.sidebar.navigation',
      },
      { id: 'users', label: studioT('studio.sidebar.item.users'), href: '/users', iconId: 'studio.sidebar.users' },
      { id: 'admin', label: studioT('studio.sidebar.item.admin'), href: '/admin', iconId: 'studio.sidebar.admin' },
    ],
  },
  {
    id: 'resources',
    label: studioT('studio.sidebar.group.resources'),
    items: [
      { id: 'media', label: studioT('studio.sidebar.item.media'), href: '/media', iconId: 'studio.sidebar.media' },
      {
        id: 'extensions',
        label: studioT('studio.sidebar.item.extensions'),
        href: '/extensions',
        iconId: 'studio.sidebar.extensions',
      },
    ],
  },
  {
    id: 'appearance',
    label: studioT('studio.sidebar.group.appearance'),
    items: [
      { id: 'themes', label: studioT('studio.sidebar.item.themes'), href: '/themes', iconId: 'studio.sidebar.themes' },
      {
        id: 'design-system',
        label: studioT('studio.sidebar.item.designSystem'),
        href: '/__design-system',
        iconId: 'studio.sidebar.designSystem',
      },
      { id: 'tokens', label: studioT('studio.sidebar.item.tokens'), href: '/tokens', iconId: 'studio.sidebar.tokens' },
    ],
  },
  {
    id: 'publish',
    label: studioT('studio.sidebar.group.publish'),
    items: [
      {
        id: 'preview',
        label: studioT('studio.sidebar.item.preview'),
        href: '/preview',
        iconId: 'studio.sidebar.preview',
      },
      {
        id: 'compatibility',
        label: studioT('studio.sidebar.item.compatibility'),
        href: '/compatibility',
        iconId: 'studio.sidebar.compatibility',
      },
      { id: 'export', label: studioT('studio.sidebar.item.export'), href: '/export', iconId: 'studio.sidebar.export' },
      { id: 'deploy', label: studioT('studio.sidebar.item.deploy'), href: '/deploy', iconId: 'studio.sidebar.deploy' },
    ],
  },
] as const satisfies readonly SidebarNavigationGroup[];

export const studioSidebarNavigation = Object.freeze(navigation);
export type SidebarNavigationItemId = (typeof navigation)[number]['items'][number]['id'];

export function getStudioSidebarNavigationItem(itemId: SidebarNavigationItemId): SidebarNavigationItem {
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.id === itemId) return item;
    }
  }
  throw new Error(`Unknown Studio navigation item: ${itemId}`);
}

export function resolveSidebarActiveItem(pathname: string): SidebarNavigationItemId | null {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  for (const group of navigation) {
    for (const item of group.items) {
      if (item.href === '/') {
        if (normalized === '/') return item.id;
        continue;
      }
      if (normalized === item.href || normalized.startsWith(`${item.href}/`)) return item.id;
    }
  }
  return null;
}
