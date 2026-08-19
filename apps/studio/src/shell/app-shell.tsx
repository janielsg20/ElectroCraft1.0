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
import { useSyncExternalStore, type ReactNode } from 'react';
import { studioShellHelpDescriptor, type HelpDescriptor } from '../help/help-registry';
import type { SidebarNavigationGroup, SidebarNavigationItem, SidebarNavigationItemId } from './sidebar-navigation';
import { StudioTopbar } from './topbar';
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
  readonly helpId?: `help.${string}`;
  readonly help?: HelpDescriptor;
  readonly status?: AppShellStatus;
  readonly children?: ReactNode;
}

const MenuIcon = getStudioIcon('studio.menu');
const CloseIcon = getStudioIcon('window.close');
const CollapseIcon = getStudioIcon('studio.sidebar.collapse');
const ExpandIcon = getStudioIcon('studio.sidebar.expand');

function NavigationLink({ item, active }: { readonly item: SidebarNavigationItem; readonly active: boolean }) {
  const Icon = getStudioIcon(item.iconId);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a className="ec-app-shell-navigation-link" href={item.href} aria-label={item.label} aria-current={active ? 'page' : undefined} data-nav-item={item.id}>
          <Icon className="ec-app-shell-navigation-icon" aria-hidden="true" />
          <span className="ec-app-shell-navigation-label">{item.label}</span>
        </a>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SidebarNavigation({ groups, activeItemId, ariaLabel }: { readonly groups: readonly SidebarNavigationGroup[]; readonly activeItemId: SidebarNavigationItemId | null; readonly ariaLabel: string }) {
  return (
    <nav className="ec-app-shell-navigation" aria-label={ariaLabel}>
      {groups.map((group) => (
        <section className="ec-app-shell-navigation-group" aria-label={group.label} data-nav-group={group.id} key={group.id}>
          <h2 className="ec-app-shell-navigation-group-label">{group.label}</h2>
          <ul className="ec-app-shell-navigation-list">
            {group.items.map((item) => (
              <li key={item.id} className="ec-app-shell-navigation-item"><NavigationLink item={item} active={item.id === activeItemId} /></li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}

export function AppShell({ copy, navigationGroups, activeItemId, preferencesPort, helpId, help, status = 'ready', children }: AppShellProps) {
  const preferences = useSyncExternalStore(preferencesPort.subscribe, preferencesPort.getSnapshot, preferencesPort.getSnapshot);
  const sidebarCollapsed = preferences.sidebarCollapsed;
  const SidebarToggleIcon = sidebarCollapsed ? ExpandIcon : CollapseIcon;
  const sidebarToggleLabel = sidebarCollapsed ? copy.expandSidebarLabel : copy.collapseSidebarLabel;
  const resolvedHelp = help ?? studioShellHelpDescriptor;
  const resolvedHelpId = helpId ?? resolvedHelp.id;

  const mobileNavigation = (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="ec-app-shell-menu-trigger" variant="ghost" size="icon" aria-label={copy.menuLabel}><MenuIcon aria-hidden="true" /></Button>
      </SheetTrigger>
      <SheetContent side="left" className="ec-app-shell-mobile-sheet">
        <SheetHeader className="ec-app-shell-mobile-sheet-header">
          <div><SheetTitle>{copy.menuTitle}</SheetTitle><SheetDescription>{copy.menuDescription}</SheetDescription></div>
          <SheetClose asChild><Button variant="ghost" size="icon" aria-label={copy.closeMenuLabel}><CloseIcon aria-hidden="true" /></Button></SheetClose>
        </SheetHeader>
        <ScrollArea label={copy.navigationLabel} className="ec-app-shell-mobile-nav-scroll">
          <SidebarNavigation groups={navigationGroups} activeItemId={activeItemId} ariaLabel={copy.navigationLabel} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  return (
    <TooltipProvider>
      <div className="ec-design-system ec-app-shell" data-help-id={resolvedHelpId} data-status={status} data-sidebar-collapsed={sidebarCollapsed ? 'true' : 'false'}>
        <aside className="ec-app-shell-sidebar" aria-label={copy.sidebarLabel}>
          <div className="ec-app-shell-brand" aria-label={copy.title}><span className="ec-app-shell-brand-mark" aria-hidden="true">EC</span><strong className="ec-app-shell-brand-label">{copy.title}</strong></div>
          <ScrollArea label={copy.navigationLabel} className="ec-app-shell-nav-scroll"><SidebarNavigation groups={navigationGroups} activeItemId={activeItemId} ariaLabel={copy.navigationLabel} /></ScrollArea>
          <div className="ec-app-shell-sidebar-footer">
            <Tooltip><TooltipTrigger asChild><Button className="ec-app-shell-collapse-trigger" variant="ghost" size="sm" aria-label={sidebarToggleLabel} aria-pressed={sidebarCollapsed} onClick={preferencesPort.toggleSidebar}><SidebarToggleIcon aria-hidden="true" /><span className="ec-app-shell-collapse-label">{sidebarToggleLabel}</span></Button></TooltipTrigger><TooltipContent side="right">{sidebarToggleLabel}</TooltipContent></Tooltip>
          </div>
        </aside>
        <StudioTopbar mobileNavigation={mobileNavigation} navigationGroups={navigationGroups} activeItemId={activeItemId} status={status} help={resolvedHelp} preferences={preferences} preferencesPort={preferencesPort} />
        <main className="ec-app-shell-workspace" aria-label={copy.workspaceLabel}>{children ?? <div className="ec-app-shell-empty" role="status">{copy.emptyWorkspace}</div>}</main>
        <footer className="ec-app-shell-statusbar" aria-label={copy.statusLabel}><span className="ec-app-shell-status-dot" aria-hidden="true" /><span role="status" aria-live="polite">{copy.statusLabels[status]}</span></footer>
      </div>
    </TooltipProvider>
  );
}
