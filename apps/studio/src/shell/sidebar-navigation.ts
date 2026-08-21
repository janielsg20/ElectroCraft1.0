import type { StudioIconId } from '@electrocraft/design-system';
import { translateStrict, type ElectroCraftResourceKey } from '@electrocraft/i18n';

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

type NavigationKey = ElectroCraftResourceKey<'navigation'>;
const navigationT = (key: NavigationKey) => translateStrict('navigation', key);

const navigation = [
  {
    id: 'build',
    label: navigationT('studio.sidebar.group.build'),
    items: [
      {
        id: 'editor',
        label: navigationT('studio.sidebar.item.editor'),
        href: '/editor',
        iconId: 'studio.sidebar.editor',
      },
      {
        id: 'screens',
        label: navigationT('studio.sidebar.item.screens'),
        href: '/screens',
        iconId: 'studio.sidebar.screens',
      },
      {
        id: 'components',
        label: navigationT('studio.sidebar.item.components'),
        href: '/components',
        iconId: 'studio.sidebar.components',
      },
      {
        id: 'templates',
        label: navigationT('studio.sidebar.item.templates'),
        href: '/templates',
        iconId: 'studio.sidebar.templates',
      },
      {
        id: 'ai-generate',
        label: navigationT('studio.sidebar.item.aiGenerate'),
        href: '/ai',
        iconId: 'studio.sidebar.aiGenerate',
      },
    ],
  },
  {
    id: 'data',
    label: navigationT('studio.sidebar.group.data'),
    items: [
      {
        id: 'records',
        label: navigationT('studio.sidebar.item.records'),
        href: '/content',
        iconId: 'studio.sidebar.records',
      },
      {
        id: 'models',
        label: navigationT('studio.sidebar.item.models'),
        href: '/models',
        iconId: 'studio.sidebar.models',
      },
      {
        id: 'data-sources',
        label: navigationT('studio.sidebar.item.dataSources'),
        href: '/data-sources',
        iconId: 'studio.sidebar.dataSources',
      },
      {
        id: 'queries',
        label: navigationT('studio.sidebar.item.queries'),
        href: '/queries',
        iconId: 'studio.sidebar.queries',
      },
    ],
  },
  {
    id: 'logic',
    label: navigationT('studio.sidebar.group.logic'),
    items: [
      {
        id: 'workflows',
        label: navigationT('studio.sidebar.item.workflows'),
        href: '/workflows',
        iconId: 'studio.sidebar.workflows',
      },
      {
        id: 'state',
        label: navigationT('studio.sidebar.item.state'),
        href: '/state',
        iconId: 'studio.sidebar.state',
      },
      {
        id: 'forms',
        label: navigationT('studio.sidebar.item.forms'),
        href: '/forms',
        iconId: 'studio.sidebar.forms',
      },
    ],
  },
  {
    id: 'app',
    label: navigationT('studio.sidebar.group.app'),
    items: [
      {
        id: 'navigation',
        label: navigationT('studio.sidebar.item.navigation'),
        href: '/navigation',
        iconId: 'studio.sidebar.navigation',
      },
      {
        id: 'users',
        label: navigationT('studio.sidebar.item.users'),
        href: '/users',
        iconId: 'studio.sidebar.users',
      },
      {
        id: 'admin',
        label: navigationT('studio.sidebar.item.admin'),
        href: '/admin',
        iconId: 'studio.sidebar.admin',
      },
    ],
  },
  {
    id: 'resources',
    label: navigationT('studio.sidebar.group.resources'),
    items: [
      {
        id: 'media',
        label: navigationT('studio.sidebar.item.media'),
        href: '/media',
        iconId: 'studio.sidebar.media',
      },
      {
        id: 'extensions',
        label: navigationT('studio.sidebar.item.extensions'),
        href: '/extensions',
        iconId: 'studio.sidebar.extensions',
      },
    ],
  },
  {
    id: 'appearance',
    label: navigationT('studio.sidebar.group.appearance'),
    items: [
      {
        id: 'themes',
        label: navigationT('studio.sidebar.item.themes'),
        href: '/themes',
        iconId: 'studio.sidebar.themes',
      },
      {
        id: 'design-system',
        label: navigationT('studio.sidebar.item.designSystem'),
        href: '/__design-system',
        iconId: 'studio.sidebar.designSystem',
      },
      {
        id: 'tokens',
        label: navigationT('studio.sidebar.item.tokens'),
        href: '/tokens',
        iconId: 'studio.sidebar.tokens',
      },
    ],
  },
  {
    id: 'publish',
    label: navigationT('studio.sidebar.group.publish'),
    items: [
      {
        id: 'preview',
        label: navigationT('studio.sidebar.item.preview'),
        href: '/preview',
        iconId: 'studio.sidebar.preview',
      },
      {
        id: 'compatibility',
        label: navigationT('studio.sidebar.item.compatibility'),
        href: '/compatibility',
        iconId: 'studio.sidebar.compatibility',
      },
      {
        id: 'export',
        label: navigationT('studio.sidebar.item.export'),
        href: '/export',
        iconId: 'studio.sidebar.export',
      },
      {
        id: 'deploy',
        label: navigationT('studio.sidebar.item.deploy'),
        href: '/deploy',
        iconId: 'studio.sidebar.deploy',
      },
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
      if (normalized === item.href || normalized.startsWith(`${item.href}/`)) return item.id;
    }
  }
  return null;
}
