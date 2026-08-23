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
} from '@electrocraft/design-system';
import { useMemo, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import type { SidebarNavigationGroup, SidebarNavigationItem, SidebarNavigationItemId } from './sidebar-navigation';
import type { WorkspacePreferencesPort } from './workspace-preferences';

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

export interface AppShellProps {
  readonly copy: AppShellCopy;
  readonly navigationGroups: readonly SidebarNavigationGroup[];
  readonly activeItemId: SidebarNavigationItemId | null;
  readonly preferencesPort: WorkspacePreferencesPort;
  readonly helpId: `help.${string}`;
  readonly status?: AppShellStatus;
  readonly topbar?: ReactNode;
  readonly children?: ReactNode;
}

const MenuIcon = getStudioIcon('studio.menu');
const CloseIcon = getStudioIcon('window.close');
const CollapseIcon = getStudioIcon('studio.sidebar.collapse');
const ExpandIcon = getStudioIcon('studio.sidebar.expand');

function NavigationLink({
  item,
  active,
  groupId,
}: {
  readonly item: SidebarNavigationItem;
  readonly active: boolean;
  readonly groupId: SidebarNavigationGroup['id'];
}) {
  const Icon = getStudioIcon(item.iconId);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          className="ec-app-shell-navigation-link"
          href={item.href}
          aria-label={item.label}
          aria-current={active ? 'page' : undefined}
          data-nav-item={item.id}
          data-nav-group={groupId}
        >
          <Icon className="ec-app-shell-navigation-icon" aria-hidden="true" />
          <span className="ec-app-shell-navigation-label">{item.label}</span>
        </a>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarNavigation({
  groups,
  activeItemId,
  ariaLabel,
}: {
  readonly groups: readonly SidebarNavigationGroup[];
  readonly activeItemId: SidebarNavigationItemId | null;
  readonly ariaLabel: string;
}) {
  return (
    <nav className="ec-app-shell-navigation" aria-label={ariaLabel}>
      {groups.map((group) => (
        <section
          className="ec-app-shell-navigation-group"
          aria-label={group.label}
          data-nav-group={group.id}
          key={group.id}
        >
          <h2 className="ec-app-shell-navigation-group-label">{group.label}</h2>
          <ul className="ec-app-shell-navigation-list">
            {group.items.map((item) => (
              <li key={item.id} className="ec-app-shell-navigation-item">
                <NavigationLink item={item} active={item.id === activeItemId} groupId={group.id} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

function orderNavigationGroups(
  groups: readonly SidebarNavigationGroup[],
  preferredOrder: readonly string[] | undefined,
): readonly SidebarNavigationGroup[] {
  if (!preferredOrder?.length) return groups;
  const rank = new Map(preferredOrder.map((id, index) => [id, index]));
  return [...groups].sort((left, right) => {
    const leftRank = rank.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rank.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return groups.indexOf(left) - groups.indexOf(right);
  });
}

export function AppShell({
  copy,
  navigationGroups,
  activeItemId,
  preferencesPort,
  helpId,
  status = 'ready',
  topbar,
  children,
}: AppShellProps) {
  const preferences = useSyncExternalStore(
    preferencesPort.subscribe,
    preferencesPort.getSnapshot,
    preferencesPort.getSnapshot,
  );
  const sidebarCollapsed = preferences.sidebarCollapsed;
  const sidebarSide = preferences.sidebarSide ?? 'left';
  const sidebarDisplay = preferences.sidebarDisplay ?? 'icons+text';
  const sidebarWidth = sidebarCollapsed ? 64 : (preferences.sidebarWidth ?? 240);
  const statusVisible = preferences.visiblePanels?.includes('status') ?? true;
  const orderedNavigationGroups = useMemo(
    () => orderNavigationGroups(navigationGroups, preferences.sidebarGroupOrder),
    [navigationGroups, preferences.sidebarGroupOrder],
  );
  const SidebarToggleIcon = sidebarCollapsed ? ExpandIcon : CollapseIcon;
  const sidebarToggleLabel = sidebarCollapsed ? copy.expandSidebarLabel : copy.collapseSidebarLabel;
  const shellStyle = { '--ec-shell-sidebar-width': `${sidebarWidth}px` } as CSSProperties;

  return (
    <TooltipProvider>
      <div
        className="ec-design-system ec-app-shell"
        style={shellStyle}
        data-help-id={helpId}
        data-status={status}
        data-status-visible={statusVisible ? 'true' : 'false'}
        data-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}
        data-sidebar-side={sidebarSide}
        data-sidebar-display={sidebarDisplay}
      >
        <a className="ec-skip-link" href="#ec-studio-workspace">
          Ir al área de trabajo
        </a>
        <aside className="ec-app-shell-sidebar" aria-label={copy.sidebarLabel}>
          <div className="ec-app-shell-brand" aria-label={copy.title}>
            <span className="ec-app-shell-brand-mark" aria-hidden="true">
              EC
            </span>
            <strong className="ec-app-shell-brand-label">{copy.title}</strong>
          </div>
          <ScrollArea label={copy.navigationLabel} className="ec-app-shell-nav-scroll">
            <SidebarNavigation
              groups={orderedNavigationGroups}
              activeItemId={activeItemId}
              ariaLabel={copy.navigationLabel}
            />
          </ScrollArea>
          <div className="ec-app-shell-sidebar-footer">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="ec-app-shell-collapse-trigger"
                  variant="ghost"
                  size="sm"
                  aria-label={sidebarToggleLabel}
                  aria-pressed={sidebarCollapsed}
                  onClick={preferencesPort.toggleSidebar}
                >
                  <SidebarToggleIcon aria-hidden="true" />
                  <span className="ec-app-shell-collapse-label">{sidebarToggleLabel}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{sidebarToggleLabel}</TooltipContent>
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
                <SidebarNavigation
                  groups={orderedNavigationGroups}
                  activeItemId={activeItemId}
                  ariaLabel={copy.navigationLabel}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {topbar ?? (
            <>
              <strong className="ec-app-shell-topbar-title">{copy.title}</strong>
              <span className="ec-app-shell-topbar-spacer" aria-hidden="true" />
            </>
          )}
        </header>

        <main id="ec-studio-workspace" className="ec-app-shell-workspace" aria-label={copy.workspaceLabel}>
          {children ?? (
            <div className="ec-app-shell-empty" role="status">
              {copy.emptyWorkspace}
            </div>
          )}
        </main>

        {statusVisible ? (
          <footer className="ec-app-shell-statusbar" aria-label={copy.statusLabel}>
            <span className="ec-app-shell-status-dot" aria-hidden="true" />
            <span role="status" aria-live="polite">
              {copy.statusLabels[status]}
            </span>
          </footer>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
