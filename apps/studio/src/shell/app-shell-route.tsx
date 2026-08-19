import { ThemeProvider } from '@electrocraft/design-system';
import type { ReactNode } from 'react';
import { getStudioHelpDescriptor } from '../help/help-registry';
import { studioT } from '../i18n/studio-shell.es';
import { AppShell, type AppShellCopy, type AppShellNavigationGroup, type AppShellStatus } from './app-shell';
import { resolveStudioSidebarItemId, studioSidebarNavigationGroups } from './sidebar-navigation';
import { createInMemoryWorkspacePreferencesPort, type WorkspacePreferencesPort } from './workspace-preferences-port';

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

const navigationGroups: readonly AppShellNavigationGroup[] = Object.freeze(
  studioSidebarNavigationGroups.map((group) =>
    Object.freeze({
      id: group.id,
      label: studioT(group.labelKey),
      items: Object.freeze(
        group.items.map((item) =>
          Object.freeze({
            id: item.id,
            label: studioT(item.labelKey),
            href: item.href,
            iconId: item.iconId,
          }),
        ),
      ),
    }),
  ),
);

export const studioWorkspacePreferencesPort = createInMemoryWorkspacePreferencesPort();

export function StudioAppShellRoute({
  status,
  pathname,
  preferencesPort = studioWorkspacePreferencesPort,
  children,
}: {
  readonly status: AppShellStatus;
  readonly pathname: string;
  readonly preferencesPort?: WorkspacePreferencesPort;
  readonly children?: ReactNode;
}) {
  const help = getStudioHelpDescriptor('help.studio.shell');
  const activeItemId = resolveStudioSidebarItemId(pathname);

  return (
    <ThemeProvider defaultTheme="system">
      <AppShell
        copy={appShellCopy}
        navigationGroups={navigationGroups}
        activeItemId={activeItemId}
        preferencesPort={preferencesPort}
        helpId={help.id}
        status={status}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
