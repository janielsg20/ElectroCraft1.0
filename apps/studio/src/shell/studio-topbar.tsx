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
import { useSyncExternalStore } from 'react';
import type { HelpDescriptor } from '../help/help-registry';
import type { AppShellStatus } from './app-shell';
import { AppearancePanelTrigger } from './appearance-panel';
import { ProgressiveDisclosure } from './information-architecture-ui';
import { normalizeZoomPercent, resolveStudioViewportBreakpoint, type StudioViewportBreakpoint } from './topbar-model';
import type { WorkspacePreferencesPort } from './workspace-preferences';

export interface StudioTopbarCopy {
  readonly breadcrumbRoot: string;
  readonly projectLabel: string;
  readonly saveLabels: Readonly<Record<AppShellStatus, string>>;
  readonly documentLabel: string;
  readonly platformLabel: string;
  readonly platformValue: string;
  readonly breakpointLabel: string;
  readonly breakpointLabels: Readonly<Record<StudioViewportBreakpoint, string>>;
  readonly undoLabel: string;
  readonly redoLabel: string;
  readonly historyUnavailable: string;
  readonly zoomLabel: string;
  readonly toolsLabel: string;
  readonly toolsTitle: string;
  readonly toolsDescription: string;
  readonly previewLabel: string;
  readonly exportLabel: string;
  readonly localLabel: string;
  readonly helpLabel: string;
  readonly helpDescription: string;
  readonly closeHelpLabel: string;
  readonly settingsLabel: string;
  readonly settingsTitle: string;
  readonly settingsDescription: string;
  readonly closeSettingsLabel: string;
  readonly workspaceSettingsTitle: string;
  readonly sidebarPreferenceLabel: string;
  readonly sidebarExpandedLabel: string;
  readonly sidebarCollapsedLabel: string;
  readonly collapseSidebarAction: string;
  readonly expandSidebarAction: string;
  readonly settingsAdvancedTitle: string;
  readonly settingsAdvancedSummary: string;
  readonly settingsPersistenceLabel: string;
  readonly settingsPersistenceValue: string;
  readonly settingsPersistenceHelp: string;
  readonly settingsStatusErrorTitle: string;
  readonly settingsStatusErrorSummary: string;
}

export interface StudioTopbarProps {
  readonly copy: StudioTopbarCopy;
  readonly activeLabel: string;
  readonly status: AppShellStatus;
  readonly preferencesPort: WorkspacePreferencesPort;
  readonly help: HelpDescriptor;
}

const ToolsIcon = getStudioIcon('studio.topbar.tools');
const DocumentIcon = getStudioIcon('studio.topbar.document');
const PlatformIcon = getStudioIcon('studio.topbar.platform');
const BreakpointIcon = getStudioIcon('studio.topbar.breakpoint');
const UndoIcon = getStudioIcon('studio.topbar.undo');
const RedoIcon = getStudioIcon('studio.topbar.redo');
const ZoomIcon = getStudioIcon('studio.topbar.zoom');
const PreviewIcon = getStudioIcon('studio.sidebar.preview');
const ExportIcon = getStudioIcon('studio.sidebar.export');
const HelpIcon = getStudioIcon('studio.help');
const SettingsIcon = getStudioIcon('studio.settings');
const CloseIcon = getStudioIcon('window.close');

function subscribeViewport(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('resize', listener, { passive: true });
  return () => window.removeEventListener('resize', listener);
}

function getViewportWidth() {
  return typeof window === 'undefined' ? 1440 : window.innerWidth;
}

function TopbarToolCluster({
  copy,
  activeLabel,
  breakpoint,
}: {
  readonly copy: StudioTopbarCopy;
  readonly activeLabel: string;
  readonly breakpoint: StudioViewportBreakpoint;
}) {
  const zoom = normalizeZoomPercent(100);

  return (
    <div className="ec-topbar-tool-cluster" aria-label={copy.toolsTitle}>
      <span className="ec-topbar-tool" data-topbar-tool="document" aria-label={`${copy.documentLabel}: ${activeLabel}`}>
        <DocumentIcon aria-hidden="true" />
        <span>{activeLabel}</span>
      </span>
      <span
        className="ec-topbar-tool"
        data-topbar-tool="platform"
        aria-label={`${copy.platformLabel}: ${copy.platformValue}`}
      >
        <PlatformIcon aria-hidden="true" />
        <span>{copy.platformValue}</span>
      </span>
      <span
        className="ec-topbar-tool"
        data-topbar-tool="breakpoint"
        aria-label={`${copy.breakpointLabel}: ${copy.breakpointLabels[breakpoint]}`}
      >
        <BreakpointIcon aria-hidden="true" />
        <span>{copy.breakpointLabels[breakpoint]}</span>
      </span>
      <Button variant="ghost" size="icon" disabled aria-label={copy.undoLabel} title={copy.historyUnavailable}>
        <UndoIcon aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" disabled aria-label={copy.redoLabel} title={copy.historyUnavailable}>
        <RedoIcon aria-hidden="true" />
      </Button>
      <span className="ec-topbar-tool" data-topbar-tool="zoom" aria-label={`${copy.zoomLabel}: ${zoom}%`}>
        <ZoomIcon aria-hidden="true" />
        <span>{zoom}%</span>
      </span>
    </div>
  );
}

export function StudioTopbar({ copy, activeLabel, status, preferencesPort, help }: StudioTopbarProps) {
  const width = useSyncExternalStore(subscribeViewport, getViewportWidth, () => 1440);
  const preferences = useSyncExternalStore(
    preferencesPort.subscribe,
    preferencesPort.getSnapshot,
    preferencesPort.getSnapshot,
  );
  const breakpoint = resolveStudioViewportBreakpoint(width);
  const sidebarCollapsed = preferences.sidebarCollapsed;
  const sidebarAction = sidebarCollapsed ? copy.expandSidebarAction : copy.collapseSidebarAction;
  const hasVisibleDiagnostic = status === 'error' || status === 'blocked';

  return (
    <div className="ec-topbar" data-breakpoint={breakpoint}>
      <div className="ec-topbar-left">
        <div className="ec-topbar-breadcrumb" aria-label={`${copy.breadcrumbRoot} / ${activeLabel}`}>
          <span className="ec-topbar-breadcrumb-root">{copy.breadcrumbRoot}</span>
          <span aria-hidden="true">/</span>
          <strong>{activeLabel}</strong>
        </div>
        <span className="ec-topbar-project">{copy.projectLabel}</span>
        <span className="ec-topbar-save" data-save-state={status} role="status" aria-live="polite">
          {copy.saveLabels[status]}
        </span>
      </div>

      <div className="ec-topbar-center">
        <TopbarToolCluster copy={copy} activeLabel={activeLabel} breakpoint={breakpoint} />
      </div>

      <div className="ec-topbar-right">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="ec-topbar-tools-trigger" variant="ghost" size="icon" aria-label={copy.toolsLabel}>
              <ToolsIcon aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="ec-topbar-sheet">
            <SheetHeader>
              <SheetTitle>{copy.toolsTitle}</SheetTitle>
              <SheetDescription>{copy.toolsDescription}</SheetDescription>
            </SheetHeader>
            <div className="ec-topbar-sheet-body">
              <TopbarToolCluster copy={copy} activeLabel={activeLabel} breakpoint={breakpoint} />
              <SheetClose asChild>
                <Button variant="outline" size="sm" aria-label={copy.closeSettingsLabel}>
                  <CloseIcon aria-hidden="true" />
                  {copy.closeSettingsLabel}
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        <Button className="ec-topbar-preview" variant="ghost" size="sm" asChild>
          <a href="/preview">
            <PreviewIcon aria-hidden="true" />
            <span className="ec-topbar-action-label">{copy.previewLabel}</span>
          </a>
        </Button>
        <Button className="ec-topbar-export" variant="ghost" size="sm" asChild>
          <a href="/export">
            <ExportIcon aria-hidden="true" />
            <span className="ec-topbar-action-label">{copy.exportLabel}</span>
          </a>
        </Button>
        <span className="ec-topbar-local" role="status">
          <span className="ec-topbar-local-dot" aria-hidden="true" />
          <span>{copy.localLabel}</span>
        </span>

        <AppearancePanelTrigger />

        <Sheet>
          <SheetTrigger asChild>
            <Button className="ec-topbar-help-trigger" variant="ghost" size="sm" aria-label={copy.helpLabel}>
              <HelpIcon aria-hidden="true" />
              <span className="ec-topbar-action-label">{copy.helpLabel}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="ec-topbar-sheet" data-topbar-help-sheet>
            <SheetHeader>
              <SheetTitle>{help.title}</SheetTitle>
              <SheetDescription>{help.summary}</SheetDescription>
            </SheetHeader>
            <div className="ec-topbar-sheet-body" id="studio-shell-help">
              <p>{copy.helpDescription}</p>
              <ul className="ec-topbar-help-list">
                {help.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <SheetClose asChild>
                <Button variant="outline" size="sm" aria-label={copy.closeHelpLabel}>
                  <CloseIcon aria-hidden="true" />
                  {copy.closeHelpLabel}
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="ec-topbar-settings-trigger"
              variant="ghost"
              size="icon"
              aria-label={copy.settingsLabel}
              data-topbar-settings-trigger
            >
              <SettingsIcon aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="ec-topbar-sheet" data-topbar-settings-sheet>
            <SheetHeader>
              <SheetTitle>{copy.settingsTitle}</SheetTitle>
              <SheetDescription>{copy.settingsDescription}</SheetDescription>
            </SheetHeader>
            <div className="ec-topbar-sheet-body">
              {hasVisibleDiagnostic ? (
                <div className="ec-ia-diagnostic-alert" role="alert" data-information-level="diagnostic">
                  <strong>{copy.settingsStatusErrorTitle}</strong>
                  <p>{copy.settingsStatusErrorSummary}</p>
                </div>
              ) : null}

              <section
                className="ec-topbar-settings-section"
                aria-labelledby="workspace-settings-title"
                data-information-level="primary"
              >
                <h2 id="workspace-settings-title">{copy.workspaceSettingsTitle}</h2>
                <div className="ec-topbar-setting-row">
                  <div>
                    <strong>{copy.sidebarPreferenceLabel}</strong>
                    <p>{sidebarCollapsed ? copy.sidebarCollapsedLabel : copy.sidebarExpandedLabel}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={preferencesPort.toggleSidebar}>
                    {sidebarAction}
                  </Button>
                </div>
              </section>

              <ProgressiveDisclosure
                id="settings-advanced"
                title={copy.settingsAdvancedTitle}
                summary={copy.settingsAdvancedSummary}
              >
                <div className="ec-ia-setting-detail">
                  <div className="ec-ia-setting-detail-row">
                    <strong>{copy.settingsPersistenceLabel}</strong>
                    <span className="ec-ia-setting-detail-value">{copy.settingsPersistenceValue}</span>
                  </div>
                  <p>{copy.settingsPersistenceHelp}</p>
                </div>
              </ProgressiveDisclosure>

              <SheetClose asChild>
                <Button variant="outline" size="sm" aria-label={copy.closeSettingsLabel}>
                  <CloseIcon aria-hidden="true" />
                  {copy.closeSettingsLabel}
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
