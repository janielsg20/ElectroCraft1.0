import type { InformationArchitectureMessageKey } from '../i18n/information-architecture.es';
import { studioSidebarNavigation } from './sidebar-navigation';

export const informationLevels = Object.freeze(['primary', 'contextual', 'advanced', 'diagnostic'] as const);
export type InformationLevel = (typeof informationLevels)[number];

export type InformationVisibility = 'always' | 'when-relevant' | 'disclosure';
export type InformationSurface = 'navigation' | 'topbar' | 'settings' | 'editor' | 'mobile-dock' | 'list-detail';

export interface InformationOptionDescriptor {
  readonly id: `ia.${string}`;
  readonly surface: InformationSurface;
  readonly level: InformationLevel;
  readonly visibility: InformationVisibility;
  readonly route?: string;
  readonly protectsSystemState?: boolean;
}

export interface EmptyStateDescriptor {
  readonly id:
    | 'project-home'
    | 'canvas'
    | 'outline'
    | 'inspector'
    | 'content'
    | 'content-detail'
    | 'queries'
    | 'forms'
    | 'administration'
    | 'media'
    | 'export';
  readonly titleKey: InformationArchitectureMessageKey;
  readonly descriptionKey: InformationArchitectureMessageKey;
  readonly route?: string;
  readonly pattern: 'single' | 'list' | 'detail';
}

const navigationOptions: readonly InformationOptionDescriptor[] = studioSidebarNavigation.flatMap((group) =>
  group.items.map((item) => ({
    id: `ia.navigation.${item.id}` as const,
    surface: 'navigation' as const,
    level: 'primary' as const,
    visibility: 'always' as const,
    route: item.href,
  })),
);

const shellOptions = [
  { id: 'ia.topbar.document', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.platform', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.breakpoint', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.undo', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.redo', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.zoom', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.preview', surface: 'topbar', level: 'primary', visibility: 'always', route: '/preview' },
  { id: 'ia.topbar.export', surface: 'topbar', level: 'primary', visibility: 'always', route: '/export' },
  {
    id: 'ia.topbar.save-status',
    surface: 'topbar',
    level: 'diagnostic',
    visibility: 'when-relevant',
    protectsSystemState: true,
  },
  {
    id: 'ia.topbar.local-status',
    surface: 'topbar',
    level: 'diagnostic',
    visibility: 'always',
    protectsSystemState: true,
  },
  { id: 'ia.topbar.help', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.topbar.settings', surface: 'topbar', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.settings.sidebar', surface: 'settings', level: 'primary', visibility: 'always' },
  { id: 'ia.settings.persistence', surface: 'settings', level: 'advanced', visibility: 'disclosure' },
  {
    id: 'ia.settings.status',
    surface: 'settings',
    level: 'diagnostic',
    visibility: 'when-relevant',
    protectsSystemState: true,
  },
  { id: 'ia.editor.canvas', surface: 'editor', level: 'primary', visibility: 'always' },
  { id: 'ia.editor.components', surface: 'editor', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.editor.outline', surface: 'editor', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.editor.fields', surface: 'editor', level: 'primary', visibility: 'always' },
  { id: 'ia.editor.advanced-fields', surface: 'editor', level: 'advanced', visibility: 'disclosure' },
  {
    id: 'ia.editor.diagnostics',
    surface: 'editor',
    level: 'diagnostic',
    visibility: 'when-relevant',
    protectsSystemState: true,
  },
  { id: 'ia.mobile.components', surface: 'mobile-dock', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.mobile.screens', surface: 'mobile-dock', level: 'primary', visibility: 'always', route: '/screens' },
  { id: 'ia.mobile.canvas', surface: 'mobile-dock', level: 'primary', visibility: 'always', route: '/' },
  { id: 'ia.mobile.properties', surface: 'mobile-dock', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.mobile.more', surface: 'mobile-dock', level: 'contextual', visibility: 'when-relevant' },
  { id: 'ia.list-detail.list', surface: 'list-detail', level: 'primary', visibility: 'always', route: '/content' },
  { id: 'ia.list-detail.detail', surface: 'list-detail', level: 'contextual', visibility: 'when-relevant' },
] as const satisfies readonly InformationOptionDescriptor[];

export const studioInformationOptions = Object.freeze([...navigationOptions, ...shellOptions]);

export const studioEmptyStates = Object.freeze([
  {
    id: 'project-home',
    titleKey: 'studio.ia.projectHome.emptyTitle',
    descriptionKey: 'studio.ia.projectHome.emptyDescription',
    pattern: 'single',
  },
  {
    id: 'canvas',
    titleKey: 'studio.ia.canvas.emptyTitle',
    descriptionKey: 'studio.ia.canvas.emptyDescription',
    pattern: 'single',
  },
  {
    id: 'outline',
    titleKey: 'studio.ia.outline.emptyTitle',
    descriptionKey: 'studio.ia.outline.emptyDescription',
    pattern: 'single',
  },
  {
    id: 'inspector',
    titleKey: 'studio.ia.inspector.emptyTitle',
    descriptionKey: 'studio.ia.inspector.emptyDescription',
    pattern: 'single',
  },
  {
    id: 'content',
    titleKey: 'studio.ia.content.emptyTitle',
    descriptionKey: 'studio.ia.content.emptyDescription',
    route: '/content',
    pattern: 'list',
  },
  {
    id: 'content-detail',
    titleKey: 'studio.ia.content.detailEmptyTitle',
    descriptionKey: 'studio.ia.content.detailEmptyDescription',
    route: '/content',
    pattern: 'detail',
  },
  {
    id: 'queries',
    titleKey: 'studio.ia.queries.emptyTitle',
    descriptionKey: 'studio.ia.queries.emptyDescription',
    route: '/queries',
    pattern: 'single',
  },
  {
    id: 'forms',
    titleKey: 'studio.ia.forms.emptyTitle',
    descriptionKey: 'studio.ia.forms.emptyDescription',
    route: '/forms',
    pattern: 'single',
  },
  {
    id: 'administration',
    titleKey: 'studio.ia.admin.emptyTitle',
    descriptionKey: 'studio.ia.admin.emptyDescription',
    route: '/admin',
    pattern: 'single',
  },
  {
    id: 'media',
    titleKey: 'studio.ia.media.emptyTitle',
    descriptionKey: 'studio.ia.media.emptyDescription',
    route: '/media',
    pattern: 'single',
  },
  {
    id: 'export',
    titleKey: 'studio.ia.export.emptyTitle',
    descriptionKey: 'studio.ia.export.emptyDescription',
    route: '/export',
    pattern: 'single',
  },
] as const satisfies readonly EmptyStateDescriptor[]);

export function validateInformationArchitecture(options: readonly InformationOptionDescriptor[]): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const navigationRoutes = new Set<string>();

  for (const option of options) {
    if (ids.has(option.id)) errors.push(`duplicate option id: ${option.id}`);
    ids.add(option.id);

    if (option.level === 'primary' && option.visibility !== 'always') {
      errors.push(`primary option must stay visible: ${option.id}`);
    }
    if (option.level === 'advanced' && option.visibility !== 'disclosure') {
      errors.push(`advanced option must use disclosure: ${option.id}`);
    }
    if (option.protectsSystemState && option.level !== 'diagnostic') {
      errors.push(`system-state protection requires diagnostic level: ${option.id}`);
    }
    if (option.surface === 'navigation') {
      if (option.level !== 'primary') errors.push(`top-level navigation must be primary: ${option.id}`);
      if (!option.route) errors.push(`navigation option requires canonical route: ${option.id}`);
      if (option.route && navigationRoutes.has(option.route))
        errors.push(`duplicate navigation route: ${option.route}`);
      if (option.route) navigationRoutes.add(option.route);
    }
  }

  return Object.freeze(errors);
}

export function getEmptyState(id: EmptyStateDescriptor['id']): EmptyStateDescriptor {
  const descriptor = studioEmptyStates.find((entry) => entry.id === id);
  if (!descriptor) throw new Error(`Unknown Studio empty state: ${id}`);
  return descriptor;
}

export function resolveModuleEmptyState(pathname: string): EmptyStateDescriptor | null {
  return studioEmptyStates.find((entry) => entry.route === pathname && entry.pattern === 'single') ?? null;
}
