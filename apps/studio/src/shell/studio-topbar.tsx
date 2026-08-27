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
import { puckEditorHistoryControls } from '@electrocraft/editor-puck';
import { useEffect, useSyncExternalStore } from 'react';
import { editorHistoryPreferencesRuntime } from '../features/editor/editor-history-preferences-runtime';
import { EditorSettings } from '../features/editor/editor-settings';
import { projectStorageRuntime } from '../features/projects/project-storage-runtime';
import { StorageSettings } from '../features/projects/storage-settings';
import { WorkspaceSettings } from '../features/projects/workspace-settings';
import { HelpDrawerTrigger } from '../help/help-ui';
import type { HelpDescriptor } from '../help/help-registry';
import { appearanceT } from '../i18n/appearance.es';
import type { AppShellStatus } from './app-shell';
import { AppearancePanelTrigger } from './appearance-panel';
import { ProgressiveDisclosure } from './information-architecture-ui';
import { LanguageSettings } from './language-settings';
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
  readonly historyLabel: string;
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
const SettingsIcon = getStudioIcon('studio.settings');
const AppearanceIcon = getStudioIcon('studio.theme');
const CloseIcon = getStudioIcon('window.close');
const HistoryIcon = getStudioIcon('studio.history');

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
  const visualHistory = useSyncExternalStore(
    puckEditorHistoryControls.subscribe,
    puckEditorHistoryControls.getSnapshot,
    puckEditorHistoryControls.getSnapshot,
  );

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
      <Button variant="ghost" size="sm" asChild>
        <a href="/history">
          <HistoryIcon aria-hidden="true" />
          {copy.historyLabel}
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!visualHistory.canUndo}
        aria-label={copy.undoLabel}
        title={visualHistory.canUndo ? copy.undoLabel : copy.historyUnavailable}
        data-puck-history-action="undo"
        onClick={() => puckEditorHistoryControls.undo()}
      >
        <UndoIcon aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!visualHistory.canRedo}
        aria-label={copy.redoLabel}
        title={visualHistory.canRedo ? copy.redoLabel : copy.historyUnavailable}
        data-puck-history-action="redo"
        onClick={() => puckEditorHistoryControls.redo()}
      >
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
  useSyncExternalStore(preferencesPort.subscribe, preferencesPort.getSnapshot, preferencesPort.getSnapshot);
  const editorHistoryPreferences = useSyncExternalStore(
    editorHistoryPreferencesRuntime.subscribe,
    editorHistoryPreferencesRuntime.getSnapshot,
    editorHistoryPreferencesRuntime.getSnapshot,
  );
  const storage = useSyncExternalStore(
    projectStorageRuntime.subscribe,
    projectStorageRuntime.getSnapshot,
    projectStorageRuntime.getSnapshot,
  );

  useEffect(() => {
    void projectStorageRuntime.initialize();
  }, []);

  useEffect(() => {
    puckEditorHistoryControls.setVisualHistoryLimit(editorHistoryPreferences.visualHistoryLimit);
  }, [editorHistoryPreferences.visualHistoryLimit]);

  const breakpoint = resolveStudioViewportBreakpoint(width);
  const storageStatus: AppShellStatus =
    storage.state === 'saving'
      ? 'saving'
      : storage.state === 'error'
        ? 'error'
        : storage.state === 'blocked'
          ? 'blocked'
          : status;
  const hasVisibleDiagnostic = storageStatus === 'error' || storageStatus === 'blocked';

  return (
    <div className="ec-topbar" data-breakpoint={breakpoint}>
      <div className="ec-topbar-left">
        <div className="ec-topbar-breadcrumb" aria-label={`${copy.breadcrumbRoot} / ${activeLabel}`}>
          <span className="ec-topbar-breadcrumb-root">{copy.breadcrumbRoot}</span>
          <span aria-hidden="true">/</span>
          <strong>{activeLabel}</strong>
        </div>
        <span className="ec-topbar-project">{copy.projectLabel}</span>
        <span className="ec-topbar-save" data-save-state={storageStatus} role="status" aria-live="polite">
          {copy.saveLabels[storageStatus]}
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
        <HelpDrawerTrigger initialHelpId={help.id} label={copy.helpLabel} className="ec-topbar-help-trigger" />

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
                  <p>
                    {storage.state === 'error' || storage.state === 'blocked'
                      ? storage.message
                      : copy.settingsStatusErrorSummary}
                  </p>
                </div>
              ) : null}

              <LanguageSettings />
              <WorkspaceSettings />
              <EditorSettings />
              <StorageSettings />

              <section
                className="ec-topbar-settings-section"
                aria-labelledby="appearance-settings-title"
                data-information-level="primary"
                data-settings-destination="appearance"
              >
                <h2 id="appearance-settings-title">
                  <AppearanceIcon aria-hidden="true" />
                  {appearanceT('title')}
                </h2>
                <div className="ec-topbar-setting-row">
                  <div>
                    <strong>{appearanceT('title')}</strong>
                    <p>{appearanceT('description')}</p>
                  </div>
                  <AppearancePanelTrigger />
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
