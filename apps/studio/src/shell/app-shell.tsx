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
  getStudioIcon,
} from '@electrocraft/design-system';
import type { ReactNode } from 'react';

export type AppShellStatus = 'ready' | 'saving' | 'error' | 'blocked';

export interface AppShellCopy {
  readonly title: string;
  readonly sidebarLabel: string;
  readonly navigationLabel: string;
  readonly menuLabel: string;
  readonly menuTitle: string;
  readonly menuDescription: string;
  readonly closeMenuLabel: string;
  readonly workspaceLabel: string;
  readonly emptyWorkspace: string;
  readonly statusLabel: string;
  readonly statusLabels: Readonly<Record<AppShellStatus, string>>;
}

export interface AppShellProps {
  readonly copy: AppShellCopy;
  readonly navigationLabels: readonly string[];
  readonly helpId: `help.${string}`;
  readonly status?: AppShellStatus;
  readonly children?: ReactNode;
}

const MenuIcon = getStudioIcon('studio.menu');
const CloseIcon = getStudioIcon('window.close');

function NavigationVocabulary({
  labels,
  ariaLabel,
}: {
  readonly labels: readonly string[];
  readonly ariaLabel: string;
}) {
  return (
    <nav className="ec-app-shell-navigation" aria-label={ariaLabel}>
      <ul className="ec-app-shell-navigation-list">
        {labels.map((label) => (
          <li key={label} className="ec-app-shell-navigation-item">
            <span className="ec-app-shell-navigation-marker" aria-hidden="true" />
            <span className="ec-app-shell-navigation-label">{label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell({
  copy,
  navigationLabels,
  helpId,
  status = 'ready',
  children,
}: AppShellProps) {
  return (
    <div className="ec-design-system ec-app-shell" data-help-id={helpId} data-status={status}>
      <aside className="ec-app-shell-sidebar" aria-label={copy.sidebarLabel}>
        <div className="ec-app-shell-brand" aria-label={copy.title}>
          <span className="ec-app-shell-brand-mark" aria-hidden="true">
            EC
          </span>
          <strong className="ec-app-shell-brand-label">{copy.title}</strong>
        </div>
        <ScrollArea label={copy.navigationLabel} className="ec-app-shell-nav-scroll">
          <NavigationVocabulary labels={navigationLabels} ariaLabel={copy.navigationLabel} />
        </ScrollArea>
      </aside>

      <header className="ec-app-shell-topbar">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="ec-app-shell-menu-trigger"
              variant="ghost"
              size="icon"
              aria-label={copy.menuLabel}
            >
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
              <NavigationVocabulary labels={navigationLabels} ariaLabel={copy.navigationLabel} />
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
  );
}
