import {
  Button,
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
import type { HelpDescriptor } from '../help/help-registry';
import { studioT } from '../i18n/studio-shell.es';
import type { AppShellStatus } from './app-shell';
import type { SidebarNavigationGroup, SidebarNavigationItemId } from './sidebar-navigation';
import type { WorkspacePreferences, WorkspacePreferencesPort } from './workspace-preferences';
import './topbar.css';

const DocumentIcon = getStudioIcon('studio.topbar.document');
const PlatformIcon = getStudioIcon('studio.topbar.platform');
const BreakpointIcon = getStudioIcon('studio.topbar.breakpoint');
const UndoIcon = getStudioIcon('studio.topbar.undo');
const RedoIcon = getStudioIcon('studio.topbar.redo');
const ZoomIcon = getStudioIcon('studio.topbar.zoom');
const ToolsIcon = getStudioIcon('studio.topbar.tools');
const LocalIcon = getStudioIcon('studio.topbar.local');
const PreviewIcon = getStudioIcon('studio.topbar.preview');
const ExportIcon = getStudioIcon('studio.topbar.export');
const HelpIcon = getStudioIcon('studio.help');
const SettingsIcon = getStudioIcon('studio.settings');

export function resolveTopbarBreadcrumb(
  groups: readonly SidebarNavigationGroup[],
  activeItemId: SidebarNavigationItemId | null,
): string {
  if (!activeItemId) return studioT('studio.topbar.breadcrumbFallback');
  for (const group of groups) {
    const active = group.items.find((item) => item.id === activeItemId);
    if (active) return active.label;
  }
  return studioT('studio.topbar.breadcrumbFallback');
}

export function resolveTopbarSaveLabel(status: AppShellStatus): string {
  const labels: Readonly<Record<AppShellStatus, string>> = {
    ready: studioT('studio.topbar.save.ready'),
    saving: studioT('studio.topbar.save.saving'),
    error: studioT('studio.topbar.save.error'),
    blocked: studioT('studio.topbar.save.blocked'),
  };
  return labels[status];
}

function ContextTools() {
  return (
    <div className="ec-topbar-context-tools" aria-label={studioT('studio.topbar.contextLabel')}>
      <span className="ec-topbar-context-chip ec-topbar-context-secondary">
        <DocumentIcon aria-hidden="true" />
        {studioT('studio.topbar.document')}
      </span>
      <span className="ec-topbar-context-chip ec-topbar-context-secondary">
        <PlatformIcon aria-hidden="true" />
        {studioT('studio.topbar.platform')}
      </span>
      <span className="ec-topbar-context-chip">
        <BreakpointIcon aria-hidden="true" />
        {studioT('studio.topbar.breakpoint')}
      </span>
      <Button variant="ghost" size="icon" disabled aria-label={studioT('studio.topbar.undo')}>
        <UndoIcon aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" disabled aria-label={studioT('studio.topbar.redo')}>
        <RedoIcon aria-hidden="true" />
      </Button>
      <span className="ec-topbar-context-chip">
        <ZoomIcon aria-hidden="true" />
        {studioT('studio.topbar.zoom')}
      </span>
    </div>
  );
}

function PreviewExportLocal() {
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="ec-topbar-preview-action">
        <a href="/preview">
          <PreviewIcon aria-hidden="true" />
          <span>{studioT('studio.navigation.preview')}</span>
        </a>
      </Button>
      <Button asChild variant="ghost" size="sm" className="ec-topbar-export-action">
        <a href="/export">
          <ExportIcon aria-hidden="true" />
          <span>{studioT('studio.navigation.export')}</span>
        </a>
      </Button>
      <span className="ec-topbar-local-indicator" role="status">
        <LocalIcon aria-hidden="true" />
        {studioT('studio.topbar.local')}
      </span>
    </>
  );
}

function ToolsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="ec-topbar-tools-trigger" variant="ghost" size="icon" aria-label={studioT('studio.topbar.tools')}>
          <ToolsIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="ec-topbar-sheet">
        <SheetHeader>
          <SheetTitle>{studioT('studio.topbar.toolsTitle')}</SheetTitle>
          <SheetDescription>{studioT('studio.topbar.toolsDescription')}</SheetDescription>
        </SheetHeader>
        <div className="ec-topbar-sheet-body">
          <ContextTools />
          <div className="ec-topbar-sheet-actions">
            <PreviewExportLocal />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HelpSheet({ help }: { readonly help: HelpDescriptor }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="ec-topbar-help-trigger" variant="ghost" size="sm" aria-label={studioT('studio.navigation.help')}>
          <HelpIcon aria-hidden="true" />
          <span className="ec-topbar-action-label">{studioT('studio.navigation.help')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="ec-topbar-sheet">
        <SheetHeader>
          <SheetTitle>{help.title}</SheetTitle>
          <SheetDescription>{help.summary}</SheetDescription>
        </SheetHeader>
        <div className="ec-topbar-sheet-body">
          <ul className="ec-topbar-help-list">
            {help.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
          <SheetClose asChild>
            <Button variant="outline">{studioT('studio.topbar.closeHelp')}</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SettingsSheet({
  preferences,
  preferencesPort,
}: {
  readonly preferences: WorkspacePreferences;
  readonly preferencesPort: WorkspacePreferencesPort;
}) {
  const sidebarMode = preferences.sidebarCollapsed
    ? studioT('studio.settings.sidebarCollapsed')
    : studioT('studio.settings.sidebarExpanded');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="ec-topbar-settings-trigger"
          variant="ghost"
          size="sm"
          aria-label={studioT('studio.navigation.settings')}
        >
          <SettingsIcon aria-hidden="true" />
          <span className="ec-topbar-action-label">{studioT('studio.navigation.settings')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="ec-topbar-sheet">
        <SheetHeader>
          <SheetTitle>{studioT('studio.settings.title')}</SheetTitle>
          <SheetDescription>{studioT('studio.settings.description')}</SheetDescription>
        </SheetHeader>
        <div className="ec-topbar-sheet-body">
          <section className="ec-settings-section" aria-labelledby="workspace-settings-title">
            <h2 id="workspace-settings-title">{studioT('studio.settings.workspaceTitle')}</h2>
            <div className="ec-settings-row">
              <div>
                <strong>{studioT('studio.settings.sidebarTitle')}</strong>
                <p>{sidebarMode}</p>
              </div>
              <Button
                variant="outline"
                aria-pressed={preferences.sidebarCollapsed}
                onClick={preferencesPort.toggleSidebar}
              >
                {preferences.sidebarCollapsed
                  ? studioT('studio.settings.expandSidebar')
                  : studioT('studio.settings.collapseSidebar')}
              </Button>
            </div>
          </section>
          <SheetClose asChild>
            <Button variant="outline">{studioT('studio.settings.close')}</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StudioTopbar({
  mobileNavigation,
  navigationGroups,
  activeItemId,
  status,
  help,
  preferences,
  preferencesPort,
}: {
  readonly mobileNavigation: ReactNode;
  readonly navigationGroups: readonly SidebarNavigationGroup[];
  readonly activeItemId: SidebarNavigationItemId | null;
  readonly status: AppShellStatus;
  readonly help: HelpDescriptor;
  readonly preferences: WorkspacePreferences;
  readonly preferencesPort: WorkspacePreferencesPort;
}) {
  const breadcrumb = resolveTopbarBreadcrumb(navigationGroups, activeItemId);
  const saveLabel = resolveTopbarSaveLabel(status);

  return (
    <header className="ec-app-shell-topbar">
      <div className="ec-topbar-left">
        {mobileNavigation}
        <span className="ec-topbar-project">{studioT('studio.topbar.project')}</span>
        <span className="ec-topbar-separator" aria-hidden="true">/</span>
        <strong className="ec-topbar-breadcrumb">{breadcrumb}</strong>
        <span className="ec-topbar-save-state" data-status={status} role="status">
          {saveLabel}
        </span>
      </div>
      <div className="ec-topbar-center"><ContextTools /></div>
      <div className="ec-topbar-right">
        <PreviewExportLocal />
        <ToolsSheet />
        <HelpSheet help={help} />
        <SettingsSheet preferences={preferences} preferencesPort={preferencesPort} />
      </div>
    </header>
  );
}
