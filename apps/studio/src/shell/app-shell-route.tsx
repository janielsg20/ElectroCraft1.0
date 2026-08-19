import { ThemeProvider } from '@electrocraft/design-system';
import type { ReactNode } from 'react';
import { getStudioHelpDescriptor } from '../help/help-registry';
import { studioNavigationMessageKeys, studioT } from '../i18n/studio-shell.es';
import { AppShell, type AppShellCopy, type AppShellStatus } from './app-shell';

const appShellCopy: AppShellCopy = Object.freeze({
  title: studioT('studio.appShell.title'),
  sidebarLabel: studioT('studio.appShell.sidebarLabel'),
  navigationLabel: studioT('studio.appShell.navigationLabel'),
  menuLabel: studioT('studio.appShell.menuLabel'),
  menuTitle: studioT('studio.appShell.menuTitle'),
  menuDescription: studioT('studio.appShell.menuDescription'),
  closeMenuLabel: studioT('studio.appShell.closeMenuLabel'),
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

const navigationLabels = Object.freeze(studioNavigationMessageKeys.map((key) => studioT(key)));

export function StudioAppShellRoute({
  status,
  children,
}: {
  readonly status: AppShellStatus;
  readonly children?: ReactNode;
}) {
  const help = getStudioHelpDescriptor('help.studio.shell');

  return (
    <ThemeProvider defaultTheme="system">
      <AppShell copy={appShellCopy} navigationLabels={navigationLabels} helpId={help.id} status={status}>
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
