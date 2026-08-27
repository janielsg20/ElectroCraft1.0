import {
  Button,
  ResizableTriPane,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  getStudioIcon,
  type SheetSide,
} from '@electrocraft/design-system';
import {
  PuckEditorFields,
  PuckEditorOutline,
  PuckEditorPreview,
  PuckEditorRoot,
  usePuckEditorHasContent,
} from '@electrocraft/editor-puck';
import { useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from 'react';
import '../features/editor/puck-action-sync.css';
import { LayoutStyleInspector } from '../features/editor/advanced/layout-style-inspector';
import { useStudioPuckEditorRuntime } from '../features/editor/use-puck-editor-runtime';
import { workspacePreferencesRuntime } from '../features/projects/workspace-preferences-runtime';
import { editorT } from '../i18n/editor.es';
import { iaT } from '../i18n/information-architecture.es';
import {
  editorPaneContract,
  resolveEditorLayoutMode,
  resolveLaptopPanelStrategy,
  type EditorLayoutMode,
  type LaptopPanelStrategy,
} from './editor-layout-model';
import { ProgressiveDisclosure, StudioEmptyState } from './information-architecture-ui';
import { StudioPalette } from './palette-panel';
import { getStudioSidebarNavigationItem } from './sidebar-navigation';
import { useEditorViewportWidth } from './use-editor-layout-mode';

const ContextIcon = getStudioIcon('studio.sidebar.components');
const CanvasIcon = getStudioIcon('studio.sidebar.editor');
const InspectorIcon = getStudioIcon('studio.inspector');
const CloseIcon = getStudioIcon('window.close');
const MinimizeIcon = getStudioIcon('window.minimize');
const MaximizeIcon = getStudioIcon('window.maximize');
const RestoreIcon = getStudioIcon('window.restore');
const CollapseLeftIcon = getStudioIcon('studio.panel.collapseLeft');
const ExpandLeftIcon = getStudioIcon('studio.panel.expandLeft');
const CollapseRightIcon = getStudioIcon('studio.panel.collapseRight');
const ExpandRightIcon = getStudioIcon('studio.panel.expandRight');
const MobileComponentsIcon = getStudioIcon('studio.mobile.components');
const MobileScreensIcon = getStudioIcon('studio.mobile.screens');
const MobileCanvasIcon = getStudioIcon('studio.mobile.canvas');
const MobilePropertiesIcon = getStudioIcon('studio.mobile.properties');
const MobileMoreIcon = getStudioIcon('studio.mobile.more');
const ComponentsTabIcon = getStudioIcon('studio.sidebar.components');
const ScreensTabIcon = getStudioIcon('studio.sidebar.screens');
const LayersTabIcon = getStudioIcon('studio.mobile.outline');
const ContentTabIcon = getStudioIcon('studio.topbar.document');
const DesignTabIcon = getStudioIcon('studio.theme');
const ActionsTabIcon = getStudioIcon('studio.sidebar.workflows');
const screensDestination = getStudioSidebarNavigationItem('screens');

type SecondaryTool = 'context' | 'inspector';
type MobileTool = 'components' | 'properties' | 'outline';
type ContextTab = 'components' | 'screens' | 'layers';
type InspectorTab = 'content' | 'design' | 'actions';
type DesktopRegion = 'context' | 'canvas' | 'inspector';
type CollapsibleDesktopRegion = Exclude<DesktopRegion, 'canvas'>;

const contextTabs = ['components', 'screens', 'layers'] as const;
const inspectorTabs = ['content', 'design', 'actions'] as const;

function resolveWorkspaceTab<T extends string>(
  lastTabs: readonly string[],
  slot: 'context' | 'inspector',
  allowed: readonly T[],
  fallback: T,
): T {
  const prefix = `${slot}:`;
  const value = lastTabs.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

function persistWorkspaceTab(slot: 'context' | 'inspector', value: string) {
  const current = workspacePreferencesRuntime.getSnapshot().layout.lastTabs;
  const prefix = `${slot}:`;
  const next = [...current.filter((entry) => !entry.startsWith(prefix)), `${prefix}${value}`];
  if (current.length === next.length && current.every((entry, index) => entry === next[index])) return;
  void workspacePreferencesRuntime.patchLayout({ lastTabs: next });
}

interface EditorRegionProps {
  readonly region: DesktopRegion;
  readonly title: string;
  readonly icon: typeof ContextIcon;
  readonly children: ReactNode;
  readonly headerActions?: ReactNode;
  readonly controls?: EditorRegionControls;
}

interface EditorRegionControls {
  readonly collapsed?: boolean;
  readonly expanded: boolean;
  readonly onCollapse?: () => void;
  readonly onMinimize?: () => void;
  readonly onExpand: () => void;
}

function EditorPanelControls({
  region,
  controls,
}: {
  readonly region: DesktopRegion;
  readonly controls: EditorRegionControls;
}) {
  if (controls.collapsed) {
    const ExpandPanelIcon = region === 'inspector' ? ExpandRightIcon : ExpandLeftIcon;
    return (
      <Button
        className="ec-editor-window-action"
        variant="ghost"
        size="icon"
        aria-label={editorT('studio.editor.panel.expand')}
        title={editorT('studio.editor.panel.expand')}
        onClick={controls.onCollapse}
      >
        <ExpandPanelIcon aria-hidden="true" />
      </Button>
    );
  }

  const CollapsePanelIcon = region === 'inspector' ? CollapseRightIcon : CollapseLeftIcon;
  const ExpandWindowIcon = controls.expanded ? RestoreIcon : MaximizeIcon;
  const regionLabel =
    region === 'context'
      ? editorT('studio.editor.contextTitle')
      : region === 'canvas'
        ? editorT('studio.editor.canvasTitle')
        : editorT('studio.editor.inspectorTitle');

  return (
    <div className="ec-editor-window-controls" aria-label={`Controles del panel ${regionLabel}`}>
      {controls.onCollapse ? (
        <Button
          className="ec-editor-window-action"
          variant="ghost"
          size="icon"
          aria-label={editorT('studio.editor.panel.collapse')}
          title={editorT('studio.editor.panel.collapse')}
          onClick={controls.onCollapse}
        >
          <CollapsePanelIcon aria-hidden="true" />
        </Button>
      ) : null}
      {controls.onMinimize ? (
        <Button
          className="ec-editor-window-action"
          variant="ghost"
          size="icon"
          aria-label={editorT('studio.editor.panel.minimize')}
          title={editorT('studio.editor.panel.minimize')}
          onClick={controls.onMinimize}
        >
          <MinimizeIcon aria-hidden="true" />
        </Button>
      ) : null}
      <Button
        className="ec-editor-window-action"
        variant="ghost"
        size="icon"
        aria-label={
          controls.expanded ? editorT('studio.editor.panel.restore') : editorT('studio.editor.panel.maximize')
        }
        title={controls.expanded ? editorT('studio.editor.panel.restore') : editorT('studio.editor.panel.maximize')}
        onClick={controls.onExpand}
      >
        <ExpandWindowIcon aria-hidden="true" />
      </Button>
    </div>
  );
}

function EditorRegion({ region, title, icon: Icon, children, headerActions, controls }: EditorRegionProps) {
  return (
    <section
      className="ec-editor-region"
      data-editor-region={region}
      data-collapsed={controls?.collapsed ? 'true' : 'false'}
      data-expanded={controls?.expanded ? 'true' : 'false'}
      aria-label={title}
    >
      <header className="ec-editor-region-header">
        <span className="ec-editor-region-icon" aria-hidden="true">
          <Icon />
        </span>
        <span className="ec-editor-region-title">{title}</span>
        {headerActions ? <div className="ec-editor-region-actions">{headerActions}</div> : null}
        {controls ? <EditorPanelControls region={region} controls={controls} /> : null}
      </header>
      <div className="ec-editor-region-body">{children}</div>
    </section>
  );
}

function StructuralNotice({ children }: { readonly children: ReactNode }) {
  return (
    <p className="ec-editor-structural-notice" data-editor-structural-placeholder>
      {children}
    </p>
  );
}

function ComponentsContent() {
  return (
    <div className="ec-editor-puck-slot" data-puck-composition="components">
      <StudioPalette />
    </div>
  );
}

function OutlineContent() {
  const hasContent = usePuckEditorHasContent();
  return (
    <div className="ec-editor-puck-slot" data-puck-composition="outline">
      {!hasContent ? <StudioEmptyState id="outline" /> : null}
      <PuckEditorOutline />
    </div>
  );
}

function FieldsContent() {
  return (
    <div className="ec-editor-puck-slot" data-puck-composition="fields">
      <PuckEditorFields wrapFields={false} />
    </div>
  );
}

function InspectorContent() {
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const hasContent = usePuckEditorHasContent();
  const tab = resolveWorkspaceTab<InspectorTab>(preferences.layout.lastTabs, 'inspector', inspectorTabs, 'content');

  return (
    <Tabs
      className="ec-editor-inspector"
      value={tab}
      onValueChange={(value) => persistWorkspaceTab('inspector', value)}
      orientation="horizontal"
    >
      <TabsList className="ec-editor-panel-tabs" aria-label={editorT('studio.editor.inspectorTitle')}>
        <TabsTrigger className="ec-editor-panel-tab" value="content">
          <ContentTabIcon aria-hidden="true" />
          {editorT('studio.editor.inspector.contentTab')}
        </TabsTrigger>
        <TabsTrigger className="ec-editor-panel-tab" value="design">
          <DesignTabIcon aria-hidden="true" />
          {editorT('studio.editor.inspector.designTab')}
        </TabsTrigger>
        <TabsTrigger className="ec-editor-panel-tab" value="actions">
          <ActionsTabIcon aria-hidden="true" />
          {editorT('studio.editor.inspector.actionsTab')}
        </TabsTrigger>
      </TabsList>
      <TabsContent className="ec-editor-tab-panel" value="content">
        <section
          className="ec-ia-inspector-section"
          data-information-level="primary"
          aria-label={iaT('studio.ia.inspector.primaryTitle')}
        >
          <h3>{iaT('studio.ia.inspector.primaryTitle')}</h3>
          <p>{iaT('studio.ia.inspector.primarySummary')}</p>
          {!hasContent ? <StudioEmptyState id="inspector" /> : null}
          <FieldsContent />
        </section>
      </TabsContent>
      <TabsContent className="ec-editor-tab-panel" value="design">
        <section className="ec-ia-inspector-section">
          <h3>{editorT('studio.editor.inspector.designTitle')}</h3>
          <p>{editorT('studio.editor.inspector.designSummary')}</p>
          <ProgressiveDisclosure
            id="inspector-advanced"
            title={iaT('studio.ia.inspector.advancedTitle')}
            summary={iaT('studio.ia.inspector.advancedSummary')}
            defaultOpen
          >
            <LayoutStyleInspector />
          </ProgressiveDisclosure>
        </section>
      </TabsContent>
      <TabsContent className="ec-editor-tab-panel" value="actions">
        <section className="ec-ia-inspector-section">
          <h3>{editorT('studio.editor.inspector.actionsTitle')}</h3>
          <p>{editorT('studio.editor.inspector.actionsSummary')}</p>
        </section>
      </TabsContent>
    </Tabs>
  );
}

function ContextRegion({ controls }: { readonly controls?: EditorRegionControls }) {
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const tab = resolveWorkspaceTab<ContextTab>(preferences.layout.lastTabs, 'context', contextTabs, 'components');

  return (
    <EditorRegion region="context" title={editorT('studio.editor.contextTitle')} icon={ContextIcon} controls={controls}>
      <Tabs
        className="ec-editor-context-tabs"
        value={tab}
        onValueChange={(value) => persistWorkspaceTab('context', value)}
      >
        <TabsList className="ec-editor-panel-tabs" aria-label={editorT('studio.editor.contextTitle')}>
          <TabsTrigger className="ec-editor-panel-tab" value="components">
            <ComponentsTabIcon aria-hidden="true" />
            {editorT('studio.editor.context.componentsTab')}
          </TabsTrigger>
          <TabsTrigger className="ec-editor-panel-tab" value="screens">
            <ScreensTabIcon aria-hidden="true" />
            {editorT('studio.editor.context.screensTab')}
          </TabsTrigger>
          <TabsTrigger className="ec-editor-panel-tab" value="layers">
            <LayersTabIcon aria-hidden="true" />
            {editorT('studio.editor.context.layersTab')}
          </TabsTrigger>
        </TabsList>
        <TabsContent className="ec-editor-tab-panel ec-editor-components-panel" value="components">
          <>
            <StructuralNotice>{editorT('studio.editor.contextStructural')}</StructuralNotice>
            <ComponentsContent />
          </>
        </TabsContent>
        <TabsContent className="ec-editor-tab-panel" value="screens">
          <div className="ec-editor-panel-empty">
            <strong>{editorT('studio.editor.context.screensTitle')}</strong>
            <p>{editorT('studio.editor.context.screensSummary')}</p>
            <Button variant="outline" size="sm" asChild>
              <a href={screensDestination.href}>{editorT('studio.editor.context.openScreens')}</a>
            </Button>
          </div>
        </TabsContent>
        <TabsContent className="ec-editor-tab-panel" value="layers">
          <OutlineContent />
        </TabsContent>
      </Tabs>
    </EditorRegion>
  );
}

function CanvasRegion({
  stageRef,
  controls,
}: {
  readonly stageRef?: RefObject<HTMLDivElement | null>;
  readonly controls?: EditorRegionControls;
}) {
  const hasContent = usePuckEditorHasContent();
  return (
    <EditorRegion
      region="canvas"
      title={editorT('studio.editor.canvasTitle')}
      icon={CanvasIcon}
      controls={controls}
      headerActions={
        <>
          <span>{editorT('studio.editor.canvas.viewportLabel')}</span>
          <span aria-label={editorT('studio.editor.canvas.zoomLabel')}>100%</span>
        </>
      }
    >
      <div className="ec-editor-canvas-stage" data-editor-canvas-stage ref={stageRef} tabIndex={-1}>
        <StructuralNotice>{editorT('studio.editor.canvasStructural')}</StructuralNotice>
        {!hasContent ? <StudioEmptyState id="canvas" className="ec-editor-canvas-empty" /> : null}
        <div className="ec-editor-puck-preview" data-puck-composition="preview">
          <PuckEditorPreview id="electrocraft-editor-preview" />
        </div>
      </div>
    </EditorRegion>
  );
}

function InspectorRegion({ controls }: { readonly controls?: EditorRegionControls }) {
  return (
    <EditorRegion
      region="inspector"
      title={editorT('studio.editor.inspectorTitle')}
      icon={InspectorIcon}
      controls={controls}
    >
      <StructuralNotice>{editorT('studio.editor.inspectorStructural')}</StructuralNotice>
      <InspectorContent />
    </EditorRegion>
  );
}

interface ToolSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly side: SheetSide;
  readonly title: string;
  readonly description: string;
  readonly trigger: ReactNode;
  readonly children: ReactNode;
  readonly testId: string;
}

function ToolSheet({ open, onOpenChange, side, title, description, trigger, children, testId }: ToolSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className="ec-editor-tool-sheet" data-editor-tool-sheet={testId}>
        <SheetHeader className="ec-editor-tool-sheet-header">
          <div>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </div>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label={editorT('studio.editor.closeToolLabel')}>
              <CloseIcon aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="ec-editor-tool-sheet-body">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

function setControlledTool(
  setter: (value: SecondaryTool | null | ((current: SecondaryTool | null) => SecondaryTool | null)) => void,
  tool: SecondaryTool,
  open: boolean,
) {
  setter((current) => (open ? tool : current === tool ? null : current));
}

function ResponsiveEditorLayout({
  mode,
  viewportWidth,
}: {
  readonly mode: Exclude<EditorLayoutMode, 'desktop' | 'mobile'>;
  readonly viewportWidth: number;
}) {
  const [activeTool, setActiveTool] = useState<SecondaryTool | null>(null);
  const isLaptop = mode === 'laptop';
  const laptopStrategy: LaptopPanelStrategy = isLaptop ? resolveLaptopPanelStrategy(viewportWidth) : 'overlay';
  const showContextInline = isLaptop && laptopStrategy === 'split';

  return (
    <div
      className="ec-editor-responsive-layout"
      data-editor-responsive-mode={mode}
      data-laptop-panel-strategy={isLaptop ? laptopStrategy : undefined}
    >
      <div className="ec-editor-responsive-toolbar" aria-label={editorT('studio.editor.toolsLabel')}>
        {!showContextInline ? (
          <ToolSheet
            open={activeTool === 'context'}
            onOpenChange={(open) => setControlledTool(setActiveTool, 'context', open)}
            side="left"
            title={editorT('studio.editor.contextTitle')}
            description={editorT('studio.editor.contextSheetDescription')}
            testId="context"
            trigger={
              <Button variant="outline" size="sm" data-editor-open-context>
                <ContextIcon aria-hidden="true" />
                {editorT('studio.editor.openContextLabel')}
              </Button>
            }
          >
            <ContextRegion />
          </ToolSheet>
        ) : null}
        <span className="ec-editor-responsive-mode-label">{editorT(`studio.editor.mode.${mode}`)}</span>
        <ToolSheet
          open={activeTool === 'inspector'}
          onOpenChange={(open) => setControlledTool(setActiveTool, 'inspector', open)}
          side="right"
          title={editorT('studio.editor.inspectorTitle')}
          description={editorT('studio.editor.inspectorSheetDescription')}
          testId="inspector"
          trigger={
            <Button variant="outline" size="sm" data-editor-open-inspector>
              <InspectorIcon aria-hidden="true" />
              {editorT('studio.editor.openInspectorLabel')}
            </Button>
          }
        >
          <InspectorRegion />
        </ToolSheet>
      </div>

      <div className={showContextInline ? 'ec-editor-laptop-content' : 'ec-editor-responsive-canvas'}>
        {showContextInline ? <ContextRegion /> : null}
        <CanvasRegion />
      </div>
    </div>
  );
}

function MobileEditorLayout() {
  const [activeTool, setActiveTool] = useState<MobileTool | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const setMobileTool = (tool: MobileTool, open: boolean) => {
    setActiveTool((current) => (open ? tool : current === tool ? null : current));
  };

  return (
    <div className="ec-editor-mobile-layout" data-editor-responsive-mode="mobile">
      <div className="ec-editor-mobile-canvas">
        <CanvasRegion stageRef={canvasRef} />
      </div>

      <nav className="ec-editor-mobile-dock" aria-label={editorT('studio.editor.mobileNavigationLabel')}>
        <Sheet open={activeTool === 'components'} onOpenChange={(open) => setMobileTool('components', open)}>
          <SheetTrigger asChild>
            <button
              className="ec-editor-mobile-action"
              type="button"
              aria-pressed={activeTool === 'components'}
              data-mobile-destination="components"
            >
              <MobileComponentsIcon aria-hidden="true" />
              <span>{editorT('studio.editor.mobile.components')}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="ec-editor-mobile-bottom-sheet" data-editor-mobile-sheet="components">
            <SheetHeader className="ec-editor-mobile-sheet-header">
              <div>
                <SheetTitle>{editorT('studio.editor.mobile.components')}</SheetTitle>
                <SheetDescription>{editorT('studio.editor.mobile.componentsDescription')}</SheetDescription>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label={editorT('studio.editor.mobile.closeComponents')}>
                  <CloseIcon aria-hidden="true" />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="ec-editor-mobile-sheet-body">
              <StructuralNotice>{editorT('studio.editor.contextStructural')}</StructuralNotice>
              <div className="ec-editor-mobile-puck-panel">
                <ComponentsContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <a
          className="ec-editor-mobile-action"
          href={screensDestination.href}
          aria-label={screensDestination.label}
          data-mobile-destination="screens"
        >
          <MobileScreensIcon aria-hidden="true" />
          <span>{editorT('studio.editor.mobile.screens')}</span>
        </a>

        <button
          className="ec-editor-mobile-action"
          type="button"
          aria-current="page"
          aria-label={editorT('studio.editor.mobile.canvasFocusLabel')}
          data-mobile-destination="canvas"
          onClick={() => canvasRef.current?.focus()}
        >
          <MobileCanvasIcon aria-hidden="true" />
          <span>{editorT('studio.editor.mobile.canvas')}</span>
        </button>

        <Sheet open={activeTool === 'properties'} onOpenChange={(open) => setMobileTool('properties', open)}>
          <SheetTrigger asChild>
            <button
              className="ec-editor-mobile-action"
              type="button"
              aria-pressed={activeTool === 'properties'}
              data-mobile-destination="properties"
            >
              <MobilePropertiesIcon aria-hidden="true" />
              <span>{editorT('studio.editor.mobile.properties')}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="ec-editor-mobile-bottom-sheet" data-editor-mobile-sheet="properties">
            <SheetHeader className="ec-editor-mobile-sheet-header">
              <div>
                <SheetTitle>{editorT('studio.editor.mobile.properties')}</SheetTitle>
                <SheetDescription>{editorT('studio.editor.mobile.propertiesDescription')}</SheetDescription>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label={editorT('studio.editor.mobile.closeProperties')}>
                  <CloseIcon aria-hidden="true" />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="ec-editor-mobile-sheet-body">
              <StructuralNotice>{editorT('studio.editor.inspectorStructural')}</StructuralNotice>
              <InspectorContent />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={activeTool === 'outline'} onOpenChange={(open) => setMobileTool('outline', open)}>
          <SheetTrigger asChild>
            <button
              className="ec-editor-mobile-action"
              type="button"
              aria-pressed={activeTool === 'outline'}
              data-mobile-destination="more"
            >
              <MobileMoreIcon aria-hidden="true" />
              <span>{editorT('studio.editor.mobile.more')}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="ec-editor-mobile-full-sheet" data-editor-mobile-sheet="outline">
            <SheetHeader className="ec-editor-mobile-sheet-header">
              <div>
                <SheetTitle>{editorT('studio.editor.mobile.more')}</SheetTitle>
                <SheetDescription>{editorT('studio.editor.mobile.moreDescription')}</SheetDescription>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label={editorT('studio.editor.mobile.closeMore')}>
                  <CloseIcon aria-hidden="true" />
                </Button>
              </SheetClose>
            </SheetHeader>
            <div className="ec-editor-mobile-sheet-body" aria-label={editorT('studio.editor.outlineTitle')}>
              <div className="ec-editor-mobile-puck-panel" data-mobile-tool="outline">
                <OutlineContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

export function StudioEditorWorkspace() {
  const viewportWidth = useEditorViewportWidth();
  const mode = resolveEditorLayoutMode(viewportWidth);
  const runtime = useStudioPuckEditorRuntime();
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const [collapsedRegions, setCollapsedRegions] = useState<Record<CollapsibleDesktopRegion, boolean>>({
    context: false,
    inspector: false,
  });
  const [expandedRegion, setExpandedRegion] = useState<DesktopRegion | null>(null);
  const visiblePanels = preferences.layout.visiblePanels;
  const contextVisible = visiblePanels.includes('context');
  const inspectorVisible = visiblePanels.includes('inspector');
  const editorStyle = {
    ...(collapsedRegions.context ? { '--ec-workspace-context-width': '44px' } : {}),
    ...(collapsedRegions.inspector ? { '--ec-workspace-inspector-width': '44px' } : {}),
  } as CSSProperties;

  function toggleCollapsed(region: CollapsibleDesktopRegion) {
    setExpandedRegion(null);
    setCollapsedRegions((current) => ({ ...current, [region]: !current[region] }));
  }

  function toggleExpanded(region: DesktopRegion) {
    setExpandedRegion((current) => (current === region ? null : region));
  }

  function setPanelVisible(region: CollapsibleDesktopRegion, visible: boolean) {
    setExpandedRegion(null);
    setCollapsedRegions((current) => ({ ...current, [region]: false }));
    const next = visible ? [...new Set([...visiblePanels, region])] : visiblePanels.filter((panel) => panel !== region);
    void workspacePreferencesRuntime.patchLayout({ visiblePanels: next });
  }

  const contextControls: EditorRegionControls | undefined =
    mode === 'desktop'
      ? {
          collapsed: collapsedRegions.context,
          expanded: expandedRegion === 'context',
          onCollapse: () => toggleCollapsed('context'),
          onMinimize: () => setPanelVisible('context', false),
          onExpand: () => toggleExpanded('context'),
        }
      : undefined;
  const canvasControls: EditorRegionControls | undefined =
    mode === 'desktop'
      ? {
          expanded: expandedRegion === 'canvas',
          onExpand: () => toggleExpanded('canvas'),
        }
      : undefined;
  const inspectorControls: EditorRegionControls | undefined =
    mode === 'desktop'
      ? {
          collapsed: collapsedRegions.inspector,
          expanded: expandedRegion === 'inspector',
          onCollapse: () => toggleCollapsed('inspector'),
          onMinimize: () => setPanelVisible('inspector', false),
          onExpand: () => toggleExpanded('inspector'),
        }
      : undefined;

  return (
    <div className="ec-editor-puck-root">
      <PuckEditorRoot key={runtime.sessionKey} config={runtime.config} data={runtime.data} onAction={runtime.onAction}>
        <section
          className="ec-editor-workspace"
          style={editorStyle}
          data-editor-layout={mode}
          data-editor-sync-state={runtime.state}
          data-expanded-region={expandedRegion ?? 'none'}
          data-context-collapsed={collapsedRegions.context ? 'true' : 'false'}
          data-inspector-collapsed={collapsedRegions.inspector ? 'true' : 'false'}
          aria-label={editorT('studio.editor.workspaceLabel')}
        >
          <span className="sr-only" role="status" aria-live="polite">
            {runtime.message}
          </span>
          {runtime.state === 'blocked' ? (
            <p className="ec-editor-sync-diagnostic" role="alert">
              {runtime.message}
            </p>
          ) : null}
          {mode === 'desktop' ? (
            <>
              <ResizableTriPane
                className="ec-editor-desktop-layout"
                left={<ContextRegion controls={contextControls} />}
                center={<CanvasRegion controls={canvasControls} />}
                right={<InspectorRegion controls={inspectorControls} />}
                leftLabel={editorT('studio.editor.resizeContextLabel')}
                rightLabel={editorT('studio.editor.resizeInspectorLabel')}
                leftConstraint={editorPaneContract.context}
                rightConstraint={editorPaneContract.inspector}
              />
              {!contextVisible ? (
                <Button
                  className="ec-editor-minimized-restore ec-editor-minimized-restore--context"
                  variant="secondary"
                  size="icon"
                  aria-label={editorT('studio.editor.panel.restoreContext')}
                  title={editorT('studio.editor.panel.restoreContext')}
                  onClick={() => setPanelVisible('context', true)}
                >
                  <ExpandLeftIcon aria-hidden="true" />
                </Button>
              ) : null}
              {!inspectorVisible ? (
                <Button
                  className="ec-editor-minimized-restore ec-editor-minimized-restore--inspector"
                  variant="secondary"
                  size="icon"
                  aria-label={editorT('studio.editor.panel.restoreInspector')}
                  title={editorT('studio.editor.panel.restoreInspector')}
                  onClick={() => setPanelVisible('inspector', true)}
                >
                  <ExpandRightIcon aria-hidden="true" />
                </Button>
              ) : null}
            </>
          ) : mode === 'mobile' ? (
            <MobileEditorLayout />
          ) : (
            <ResponsiveEditorLayout mode={mode} viewportWidth={viewportWidth} />
          )}
        </section>
      </PuckEditorRoot>
    </div>
  );
}
