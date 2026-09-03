import type { DesignSystemPackageDescriptor } from '@electrocraft/design-system';
import { translateStrict, type ElectroCraftResourceKey } from '@electrocraft/i18n';
import { lazy, Suspense, type ReactNode } from 'react';
import { workspacePreferencesPort } from '../features/projects/workspace-preferences-runtime';
import { getHelpIdForNavigationItem, getStudioHelpDescriptor } from '../help/help-registry';
import { iaT } from '../i18n/information-architecture.es';
import { StudioAppearanceProvider } from '../theme-provider';
import { AppShell, type AppShellCopy, type AppShellStatus } from './app-shell';
import { StudioRouteSkeleton } from './loading-ui';
import { resolveSidebarActiveItem, studioSidebarNavigation } from './sidebar-navigation';
import { StudioTopbar, type StudioTopbarCopy } from './studio-topbar';

const DataSourcesFeatureWorkspace = lazy(() =>
  import('../features/data/data-sources-feature-workspace').then((module) => ({
    default: module.DataSourcesFeatureWorkspace,
  })),
);
const DataModelsWorkspace = lazy(() =>
  import('../features/data/data-models-workspace').then((module) => ({
    default: module.DataModelsWorkspace,
  })),
);

export const studioDesignSystemOwner: DesignSystemPackageDescriptor['name'] = '@electrocraft/design-system';

type CommonKey = ElectroCraftResourceKey<'common'>;
const commonT = (key: CommonKey) => translateStrict('common', key);

const appShellCopy: AppShellCopy = Object.freeze({
  title: commonT('studio.appShell.title'),
  sidebarLabel: commonT('studio.appShell.sidebarLabel'),
  navigationLabel: commonT('studio.appShell.navigationLabel'),
  menuLabel: commonT('studio.appShell.menuLabel'),
  menuTitle: commonT('studio.appShell.menuTitle'),
  menuDescription: commonT('studio.appShell.menuDescription'),
  closeMenuLabel: commonT('studio.appShell.closeMenuLabel'),
  collapseSidebarLabel: commonT('studio.appShell.collapseSidebarLabel'),
  expandSidebarLabel: commonT('studio.appShell.expandSidebarLabel'),
  workspaceLabel: commonT('studio.appShell.workspaceLabel'),
  emptyWorkspace: commonT('studio.appShell.emptyWorkspace'),
  statusLabel: commonT('studio.appShell.statusLabel'),
  statusLabels: Object.freeze({
    ready: commonT('studio.appShell.status.ready'),
    saving: commonT('studio.appShell.status.saving'),
    error: commonT('studio.appShell.status.error'),
    blocked: commonT('studio.appShell.status.blocked'),
  }),
});

const topbarCopy: StudioTopbarCopy = Object.freeze({
  breadcrumbRoot: commonT('studio.topbar.breadcrumbRoot'),
  projectLabel: commonT('studio.topbar.projectLabel'),
  saveLabels: Object.freeze({
    ready: commonT('studio.topbar.save.ready'),
    saving: commonT('studio.topbar.save.saving'),
    error: commonT('studio.topbar.save.error'),
    blocked: commonT('studio.topbar.save.blocked'),
  }),
  documentLabel: commonT('studio.topbar.documentLabel'),
  platformLabel: commonT('studio.topbar.platformLabel'),
  platformValue: commonT('studio.topbar.platformValue'),
  breakpointLabel: commonT('studio.topbar.breakpointLabel'),
  breakpointLabels: Object.freeze({
    mobile: commonT('studio.topbar.breakpoint.mobile'),
    tablet: commonT('studio.topbar.breakpoint.tablet'),
    laptop: commonT('studio.topbar.breakpoint.laptop'),
    desktop: commonT('studio.topbar.breakpoint.desktop'),
  }),
  undoLabel: commonT('studio.topbar.undoLabel'),
  redoLabel: commonT('studio.topbar.redoLabel'),
  historyLabel: commonT('studio.topbar.historyLabel'),
  historyUnavailable: commonT('studio.topbar.historyUnavailable'),
  zoomLabel: commonT('studio.topbar.zoomLabel'),
  toolsLabel: commonT('studio.topbar.toolsLabel'),
  toolsTitle: commonT('studio.topbar.toolsTitle'),
  toolsDescription: commonT('studio.topbar.toolsDescription'),
  previewLabel: commonT('studio.topbar.previewLabel'),
  exportLabel: commonT('studio.topbar.exportLabel'),
  localLabel: commonT('studio.topbar.localLabel'),
  helpLabel: commonT('studio.topbar.helpLabel'),
  helpDescription: commonT('studio.topbar.helpDescription'),
  closeHelpLabel: commonT('studio.topbar.closeHelpLabel'),
  settingsLabel: commonT('studio.topbar.settingsLabel'),
  settingsTitle: commonT('studio.topbar.settingsTitle'),
  settingsDescription: commonT('studio.topbar.settingsDescription'),
  closeSettingsLabel: commonT('studio.topbar.closeSettingsLabel'),
  workspaceSettingsTitle: commonT('studio.topbar.workspaceSettingsTitle'),
  sidebarPreferenceLabel: commonT('studio.topbar.sidebarPreferenceLabel'),
  sidebarExpandedLabel: commonT('studio.topbar.sidebarExpandedLabel'),
  sidebarCollapsedLabel: commonT('studio.topbar.sidebarCollapsedLabel'),
  collapseSidebarAction: commonT('studio.topbar.collapseSidebarAction'),
  expandSidebarAction: commonT('studio.topbar.expandSidebarAction'),
  settingsAdvancedTitle: iaT('studio.ia.settings.advancedTitle'),
  settingsAdvancedSummary: iaT('studio.ia.settings.advancedSummary'),
  settingsPersistenceLabel: iaT('studio.ia.settings.persistenceLabel'),
  settingsPersistenceValue: iaT('studio.ia.settings.persistenceValue'),
  settingsPersistenceHelp: iaT('studio.ia.settings.persistenceHelp'),
  settingsStatusErrorTitle: iaT('studio.ia.settings.statusErrorTitle'),
  settingsStatusErrorSummary: iaT('studio.ia.settings.statusErrorSummary'),
});

function resolveActiveLabel(activeItemId: ReturnType<typeof resolveSidebarActiveItem>, pathname: string) {
  if (pathname === '/') return commonT('studio.topbar.projectsLabel');
  if (pathname === '/history') return commonT('studio.topbar.historyLabel');
  for (const group of studioSidebarNavigation) {
    for (const item of group.items) {
      if (item.id === activeItemId) return item.label;
    }
  }
  return commonT('studio.topbar.documentFallback');
}

function resolveFeatureWorkspace(pathname: string, children: ReactNode) {
  if (pathname === '/data-sources') {
    return (
      <Suspense fallback={<StudioRouteSkeleton kind="generic" label="Cargando fuentes de datos" />}>
        <DataSourcesFeatureWorkspace />
      </Suspense>
    );
  }
  if (pathname === '/models') {
    return (
      <Suspense fallback={<StudioRouteSkeleton kind="generic" label="Cargando modelos" />}>
        <DataModelsWorkspace />
      </Suspense>
    );
  }
  return children;
}

export function StudioAppShellRoute({
  status,
  children,
}: {
  readonly status: AppShellStatus;
  readonly children?: ReactNode;
}) {
  const pathname = window.location.pathname;
  const activeItemId = resolveSidebarActiveItem(pathname);
  const help = getStudioHelpDescriptor(activeItemId ? getHelpIdForNavigationItem(activeItemId) : 'help.studio.shell');
  const activeLabel = resolveActiveLabel(activeItemId, pathname);
  const workspace = resolveFeatureWorkspace(pathname, children);

  return (
    <StudioAppearanceProvider>
      <AppShell
        copy={appShellCopy}
        navigationGroups={studioSidebarNavigation}
        activeItemId={activeItemId}
        preferencesPort={workspacePreferencesPort}
        helpId={help.id}
        status={status}
        topbar={
          <StudioTopbar
            copy={topbarCopy}
            activeLabel={activeLabel}
            status={status}
            preferencesPort={workspacePreferencesPort}
            help={help}
          />
        }
      >
        {workspace}
      </AppShell>
    </StudioAppearanceProvider>
  );
}
