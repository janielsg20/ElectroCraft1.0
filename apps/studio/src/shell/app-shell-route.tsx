import { ThemeProvider } from '@electrocraft/design-system';
import type { ReactNode } from 'react';
import { getStudioHelpDescriptor } from '../help/help-registry';
import { studioT } from '../i18n/studio-shell.es';
import { AppShell, type AppShellCopy, type AppShellStatus } from './app-shell';
import { resolveSidebarActiveItem, studioSidebarNavigation } from './sidebar-navigation';
import { StudioTopbar, type StudioTopbarCopy } from './studio-topbar';
import { createMemoryWorkspacePreferencesPort } from './workspace-preferences';

const appShellCopy: AppShellCopy = Object.freeze({
  title: studioT('studio.appShell.title'),
  sidebarLabel: studioT('studio.appShell.sidebarLabel'),
  navigationLabel: studioT('studio.appShell.navigationLabel'),
  menuLabel: studioT('studio.appShell.menuLabel'),
  menuTitle: studioT('studio.appShell.menuTitle'),
  menuDescription: studioT('studio.appShell.menuDescription'),
  closeMenuLabel: studioT('studio.appShell.closeMenuLabel'),
  collapseSidebarLabel: studioT('studio.appShell.collapseSidebarLabel'),
  expandSidebarLabel: studioT('studio.appShell.expandSidebarLabel'),
  workspaceLabel: studioT('studio.appShell.workspaceLabel'),
  emptyWorkspace: studioT('studio.appShell.emptyWorkspace'),
  statusLabel: studioT('studio.appShell.statusLabel'),
  statusLabels: Object.freeze({
    ready: studioT('studio.appShell.status.ready'),
    saving: studioT('studio.appShell.status.saving'),
    error: studioT('studio.appShell.status.error'),
    blocked: studioT('studio.appShell.status.blocked'),
  }),
});

const topbarCopy: StudioTopbarCopy = Object.freeze({
  breadcrumbRoot: studioT('studio.topbar.breadcrumbRoot'),
  projectLabel: studioT('studio.topbar.projectLabel'),
  saveLabels: Object.freeze({
    ready: studioT('studio.topbar.save.ready'),
    saving: studioT('studio.topbar.save.saving'),
    error: studioT('studio.topbar.save.error'),
    blocked: studioT('studio.topbar.save.blocked'),
  }),
  documentLabel: studioT('studio.topbar.documentLabel'),
  platformLabel: studioT('studio.topbar.platformLabel'),
  platformValue: studioT('studio.topbar.platformValue'),
  breakpointLabel: studioT('studio.topbar.breakpointLabel'),
  breakpointLabels: Object.freeze({
    mobile: studioT('studio.topbar.breakpoint.mobile'),
    tablet: studioT('studio.topbar.breakpoint.tablet'),
    laptop: studioT('studio.topbar.breakpoint.laptop'),
    desktop: studioT('studio.topbar.breakpoint.desktop'),
  }),
  undoLabel: studioT('studio.topbar.undoLabel'),
  redoLabel: studioT('studio.topbar.redoLabel'),
  historyUnavailable: studioT('studio.topbar.historyUnavailable'),
  zoomLabel: studioT('studio.topbar.zoomLabel'),
  toolsLabel: studioT('studio.topbar.toolsLabel'),
  toolsTitle: studioT('studio.topbar.toolsTitle'),
  toolsDescription: studioT('studio.topbar.toolsDescription'),
  previewLabel: studioT('studio.topbar.previewLabel'),
  exportLabel: studioT('studio.topbar.exportLabel'),
  localLabel: studioT('studio.topbar.localLabel'),
  helpLabel: studioT('studio.topbar.helpLabel'),
  helpDescription: studioT('studio.topbar.helpDescription'),
  closeHelpLabel: studioT('studio.topbar.closeHelpLabel'),
  settingsLabel: studioT('studio.topbar.settingsLabel'),
  settingsTitle: studioT('studio.topbar.settingsTitle'),
  settingsDescription: studioT('studio.topbar.settingsDescription'),
  closeSettingsLabel: studioT('studio.topbar.closeSettingsLabel'),
  workspaceSettingsTitle: studioT('studio.topbar.workspaceSettingsTitle'),
  sidebarPreferenceLabel: studioT('studio.topbar.sidebarPreferenceLabel'),
  sidebarExpandedLabel: studioT('studio.topbar.sidebarExpandedLabel'),
  sidebarCollapsedLabel: studioT('studio.topbar.sidebarCollapsedLabel'),
  collapseSidebarAction: studioT('studio.topbar.collapseSidebarAction'),
  expandSidebarAction: studioT('studio.topbar.expandSidebarAction'),
});

const workspacePreferencesPort = createMemoryWorkspacePreferencesPort();

function resolveActiveLabel(activeItemId: ReturnType<typeof resolveSidebarActiveItem>) {
  for (const group of studioSidebarNavigation) {
    for (const item of group.items) {
      if (item.id === activeItemId) return item.label;
    }
  }
  return studioT('studio.topbar.documentFallback');
}

export function StudioAppShellRoute({
  status,
  children,
}: {
  readonly status: AppShellStatus;
  readonly children?: ReactNode;
}) {
  const help = getStudioHelpDescriptor('help.studio.shell');
  const activeItemId = resolveSidebarActiveItem(window.location.pathname);
  const activeLabel = resolveActiveLabel(activeItemId);

  return (
    <ThemeProvider defaultTheme="system">
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
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
