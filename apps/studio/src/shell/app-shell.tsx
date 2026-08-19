import {
  Button,
  ScrollArea,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  getStudioIcon,
  type StudioIconId,
} from '@electrocraft/design-system';
import { useSyncExternalStore, type ReactNode } from 'react';
import type { StudioSidebarItemId } from './sidebar-navigation';
import type { WorkspacePreferencesPort } from './workspace-preferences-port';

export type AppShellStatus = 'ready' | 'saving' | 'error' | 'blocked';

export interface AppShellCopy {
  readonly title: string;
  readonly sidebarLabel: string;
  readonly navigationLabel: string;
  readonly menuLabel: string;
  readonly menuTitle: string;
  readonly menuDescription: string;
  readonly closeMenuLabel: string;
  readonly collapseSidebarLabel: string;
  readonly expandSidebarLabel: string;
  readonly workspaceLabel: string;
  readonly emptyWorkspace: string;
  readonly statusLabel: string;
  readonly statusLabels: Readonly<Record<AppShellStatus, string>>;
}

export interface AppShellNavigationItem {
  readonly id: StudioSidebarItemId;
  readonly label: string;
  readonly href: string;
  readonly iconId: StudioIconId;
}

export interface AppShellNavigationGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly AppShellNavigationItem[];
}

export interface AppShellProps {
  readonly copy: AppShellCopy;
  readonly navigationGroups: readonly AppShellNavigationGroup[];
  readonly activeItemId: StudioSidebarItemId | null;
  readonly preferencesPort: WorkspacePreferencesPort;
  readonly helpId: `help.${string}`;
  readonly status?: AppShellStatus;
  readonly children?: ReactNode;
}

const MenuIcon = getStudioIcon('studio.menu');
const CloseIcon = getStudioIcon('window.close');

function NavigationItem({ item, active }: { readonly item: AppShellNavigationItem; readonly active: boolean }) {
  const Icon = getStudioIcon(item.iconId);
  return (
    <li className="ec-app-shell-navigation-item">
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            className="ec-app-shell-navigation-link"
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <Icon aria-hidden="true" />
            <span className="ec-app-shell-navigation-label">{item.label}</span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    </li>
  );
}

function NavigationGroups({
  groups,
  activeItemId,
  ariaLabel,
}: {
  readonly groups: readonly AppShellNavigationGroup[];
  readonly activeItemId: StudioSidebarItemId | null;
  readonly ariaLabel: string;
}) {
  return (
    <nav className="ec-app-shell-navigation" aria-label={ariaLabel}>
      <div className="ec-app-shell-navigation-groups">
        {groups.map((group) => (
          <section
            className="ec-app-shell-navigation-group"
            key={group.id}
            aria-labelledby={`sidebar-group-${group.id}`}
          >
            <h2 id={`sidebar-group-${group.id}`} className="ec-app-shell-navigation-group-label">
              {group.label}
            </h2>
            <ul className="ec-app-shell-navigation-list">
              {group.items.map((item) => (
                <NavigationItem key={item.id} item={item} active={item.id === activeItemId} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}

export function AppShell({
  copy,
  navigationGroups,
  activeItemId,
  preferencesPort,
  helpId,
  status = 'ready',
  children,
}: AppShellProps) {
  const preferences = useSyncExternalStore(
    preferencesPort.subscribe,
    preferencesPort.getSnapshot,
    preferencesPort.getSnapshot,
  );
  const CollapseIcon = getStudioIcon(
    preferences.sidebarCollapsed ? 'studio.sidebar.expand' : 'studio.sidebar.collapse',
  );
  const collapseLabel = preferences.sidebarCollapsed ? copy.expandSidebarLabel : copy.collapseSidebarLabel;

  return (
    <TooltipProvider>
      <div
        className="ec-design-system ec-app-shell"
        data-help-id={helpId}
        data-status={status}
        data-sidebar-collapsed={preferences.sidebarCollapsed ? 'true' : 'false'}
      >
        <aside className="ec-app-shell-sidebar" aria-label={copy.sidebarLabel}>
          <div className="ec-app-shell-brand" aria-label={copy.title}>
            <span className="ec-app-shell-brand-mark" aria-hidden="true">
              EC
            </span>
            <strong className="ec-app-shell-brand-label">{copy.title}</strong>
          </div>
          <ScrollArea label={copy.navigationLabel} className="ec-app-shell-nav-scroll">
            <NavigationGroups groups={navigationGroups} activeItemId={activeItemId} ariaLabel={copy.navigationLabel} />
          </ScrollArea>
          <div className="ec-app-shell-sidebar-footer">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="ec-app-shell-collapse-control"
                  variant="ghost"
                  size="md"
                  aria-label={collapseLabel}
                  aria-pressed={preferences.sidebarCollapsed}
                  onClick={() => preferencesPort.setSidebarCollapsed(!preferences.sidebarCollapsed)}
                >
                  <CollapseIcon aria-hidden="true" />
                  <span className="ec-app-shell-collapse-label">{collapseLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapseLabel}</TooltipContent>
            </Tooltip>
          </div>
        </aside>

        <header className="ec-app-shell-topbar">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="ec-app-shell-menu-trigger" variant="ghost" size="icon" aria-label={copy.menuLabel}>
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="ec-app-shell-mobile-sheet">
              <SheetHeader className="ec-app-shell-mobile-sheet-header">
                <div>
                  <SheetTitle>{copy.menuTitle}</SheetTitle>
                  <SheetDescription>{copy.menuDescription}</SheetDescription>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label={copy.closeMenuLabel}>
                    <CloseIcon aria-hidden="true" />
                  </Button>
                </SheetClose>
              </SheetHeader>
              <ScrollArea label={copy.navigationLabel} className="ec-app-shell-mobile-nav-scroll">
                <NavigationGroups
                  groups={navigationGroups}
                  activeItemId={activeItemId}
                  ariaLabel={copy.navigationLabel}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <strong className="ec-app-shell-topbar-title">{copy.title}</strong>
          <span className="ec-app-shell-topbar-spacer" aria-hidden="true" />
        </header>

        <main className="ec-app-shell-workspace" aria-label={copy.workspaceLabel}>
          {children ?? (
            <div className="ec-app-shell-empty" role="status">
              {copy.emptyWorkspace}
            </div>
          )}
        </main>

        <footer className="ec-app-shell-statusbar" aria-label={copy.statusLabel}>
          <span className="ec-app-shell-status-dot" aria-hidden="true" />
          <span role="status" aria-live="polite">
            {copy.statusLabels[status]}
          </span>
        </footer>
      </div>
    </TooltipProvider>
  );
}
