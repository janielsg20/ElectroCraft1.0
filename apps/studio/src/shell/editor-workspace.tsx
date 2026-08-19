import {
  Button,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@electrocraft/design-system';
import { editorWorkspaceT } from '../i18n/editor-workspace.es';
import { EDITOR_WORKSPACE_LAYOUT } from './editor-workspace-layout';
import { getEditorWorkspacePuckDiagnostics } from './editor-workspace-puck';

const diagnostics = getEditorWorkspacePuckDiagnostics();

function ContextSurface() {
  return (
    <section className="ec-editor-panel-surface" aria-labelledby="editor-context-title">
      <header className="ec-editor-panel-header">
        <div>
          <p className="ec-editor-panel-eyebrow">{editorWorkspaceT('studio.workspace.contextEyebrow')}</p>
          <h2 id="editor-context-title">{editorWorkspaceT('studio.workspace.contextTitle')}</h2>
        </div>
      </header>
      <ScrollArea label={editorWorkspaceT('studio.workspace.contextScrollLabel')} className="ec-editor-panel-scroll">
        <div className="ec-editor-panel-placeholder" role="status">
          <strong>{editorWorkspaceT('studio.workspace.contextPlaceholderTitle')}</strong>
          <p>{editorWorkspaceT('studio.workspace.contextPlaceholderSummary')}</p>
        </div>
      </ScrollArea>
    </section>
  );
}

function CanvasSurface() {
  return (
    <section
      className="ec-editor-canvas-surface"
      aria-labelledby="editor-canvas-title"
      data-puck-engine={diagnostics.engine}
      data-puck-components={diagnostics.componentCount}
    >
      <header className="ec-editor-canvas-header">
        <div>
          <p className="ec-editor-panel-eyebrow">{editorWorkspaceT('studio.workspace.canvasEyebrow')}</p>
          <h2 id="editor-canvas-title">{editorWorkspaceT('studio.workspace.canvasTitle')}</h2>
        </div>
        <span className="ec-editor-engine-badge" role="status">
          {editorWorkspaceT('studio.workspace.puckReady')}
        </span>
      </header>
      <div className="ec-editor-canvas-stage">
        <div className="ec-editor-canvas-empty" role="status">
          <strong>{editorWorkspaceT('studio.workspace.canvasEmptyTitle')}</strong>
          <p>{editorWorkspaceT('studio.workspace.canvasEmptySummary')}</p>
        </div>
      </div>
    </section>
  );
}

function InspectorSurface() {
  return (
    <section className="ec-editor-panel-surface" aria-labelledby="editor-inspector-title">
      <header className="ec-editor-panel-header">
        <div>
          <p className="ec-editor-panel-eyebrow">{editorWorkspaceT('studio.workspace.inspectorEyebrow')}</p>
          <h2 id="editor-inspector-title">{editorWorkspaceT('studio.workspace.inspectorTitle')}</h2>
        </div>
      </header>
      <ScrollArea label={editorWorkspaceT('studio.workspace.inspectorScrollLabel')} className="ec-editor-panel-scroll">
        <div className="ec-editor-panel-placeholder" role="status">
          <strong>{editorWorkspaceT('studio.workspace.inspectorPlaceholderTitle')}</strong>
          <p>{editorWorkspaceT('studio.workspace.inspectorPlaceholderSummary')}</p>
        </div>
      </ScrollArea>
    </section>
  );
}

function ResponsiveWorkspaceTools() {
  return (
    <div className="ec-editor-responsive-tools" aria-label={editorWorkspaceT('studio.workspace.responsiveToolsLabel')}>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            {editorWorkspaceT('studio.workspace.openContext')}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="ec-editor-responsive-sheet">
          <SheetHeader>
            <SheetTitle>{editorWorkspaceT('studio.workspace.contextTitle')}</SheetTitle>
            <SheetDescription>{editorWorkspaceT('studio.workspace.contextPlaceholderSummary')}</SheetDescription>
          </SheetHeader>
          <ContextSurface />
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            {editorWorkspaceT('studio.workspace.openInspector')}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="ec-editor-responsive-sheet">
          <SheetHeader>
            <SheetTitle>{editorWorkspaceT('studio.workspace.inspectorTitle')}</SheetTitle>
            <SheetDescription>{editorWorkspaceT('studio.workspace.inspectorPlaceholderSummary')}</SheetDescription>
          </SheetHeader>
          <InspectorSurface />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function EditorWorkspace() {
  return (
    <section className="ec-editor-workspace" aria-label={editorWorkspaceT('studio.workspace.label')}>
      <div className="ec-editor-desktop-layout">
        <ResizablePanelGroup orientation="horizontal" className="ec-editor-panel-group">
          <ResizablePanel
            id="editor-context-panel"
            defaultSize={`${EDITOR_WORKSPACE_LAYOUT.context.defaultPx}px`}
            minSize={`${EDITOR_WORKSPACE_LAYOUT.context.minPx}px`}
            maxSize={`${EDITOR_WORKSPACE_LAYOUT.context.maxPx}px`}
            className="ec-editor-context-panel"
          >
            <ContextSurface />
          </ResizablePanel>
          <ResizableHandle withHandle aria-label={editorWorkspaceT('studio.workspace.resizeContext')} />
          <ResizablePanel id="editor-canvas-panel" minSize={`${EDITOR_WORKSPACE_LAYOUT.canvas.minPx}px`}>
            <CanvasSurface />
          </ResizablePanel>
          <ResizableHandle withHandle aria-label={editorWorkspaceT('studio.workspace.resizeInspector')} />
          <ResizablePanel
            id="editor-inspector-panel"
            defaultSize={`${EDITOR_WORKSPACE_LAYOUT.inspector.defaultPx}px`}
            minSize={`${EDITOR_WORKSPACE_LAYOUT.inspector.minPx}px`}
            maxSize={`${EDITOR_WORKSPACE_LAYOUT.inspector.maxPx}px`}
            className="ec-editor-inspector-panel"
          >
            <InspectorSurface />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <div className="ec-editor-responsive-layout">
        <ResponsiveWorkspaceTools />
        <CanvasSurface />
      </div>
    </section>
  );
}
