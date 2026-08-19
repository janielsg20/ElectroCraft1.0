import {
  Button,
  ResizableTriPane,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  getStudioIcon,
} from '@electrocraft/design-system';
import {
  PuckEditorComponents,
  PuckEditorFields,
  PuckEditorOutline,
  PuckEditorPreview,
  PuckEditorRoot,
  structuralPuckConfig,
  structuralPuckData,
} from '@electrocraft/editor-puck';
import { useState, type ReactNode } from 'react';
import { editorT } from '../i18n/editor.es';
import { editorPaneContract, type EditorLayoutMode } from './editor-layout-model';
import { useEditorLayoutMode } from './use-editor-layout-mode';

const ContextIcon = getStudioIcon('studio.sidebar.components');
const CanvasIcon = getStudioIcon('studio.sidebar.editor');
const InspectorIcon = getStudioIcon('studio.inspector');
const CloseIcon = getStudioIcon('window.close');

interface EditorRegionProps {
  readonly region: 'context' | 'canvas' | 'inspector';
  readonly title: string;
  readonly icon: typeof ContextIcon;
  readonly children: ReactNode;
}

function EditorRegion({ region, title, icon: Icon, children }: EditorRegionProps) {
  return (
    <section className="ec-editor-region" data-editor-region={region} aria-label={title}>
      <header className="ec-editor-region-header">
        <Icon aria-hidden="true" />
        <span>{title}</span>
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

function ContextRegion() {
  return (
    <EditorRegion region="context" title={editorT('studio.editor.contextTitle')} icon={ContextIcon}>
      <StructuralNotice>{editorT('studio.editor.contextStructural')}</StructuralNotice>
      <div className="ec-editor-puck-slot" data-puck-composition="components">
        <PuckEditorComponents />
      </div>
      <div className="ec-editor-puck-slot" data-puck-composition="outline">
        <PuckEditorOutline />
      </div>
    </EditorRegion>
  );
}

function CanvasRegion() {
  return (
    <EditorRegion region="canvas" title={editorT('studio.editor.canvasTitle')} icon={CanvasIcon}>
      <div className="ec-editor-canvas-stage" data-editor-canvas-stage>
        <StructuralNotice>{editorT('studio.editor.canvasStructural')}</StructuralNotice>
        <div className="ec-editor-puck-preview" data-puck-composition="preview">
          <PuckEditorPreview id="electrocraft-editor-preview" />
        </div>
      </div>
    </EditorRegion>
  );
}

function InspectorRegion() {
  return (
    <EditorRegion region="inspector" title={editorT('studio.editor.inspectorTitle')} icon={InspectorIcon}>
      <StructuralNotice>{editorT('studio.editor.inspectorStructural')}</StructuralNotice>
      <div className="ec-editor-puck-slot" data-puck-composition="fields">
        <PuckEditorFields wrapFields={false} />
      </div>
    </EditorRegion>
  );
}

interface ToolSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly side: 'left' | 'right';
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
  readonly testId: string;
}

function ToolSheet({ open, onOpenChange, side, title, description, children, testId }: ToolSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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

function ResponsiveEditorLayout({ mode }: { readonly mode: Exclude<EditorLayoutMode, 'desktop'> }) {
  const [contextOpen, setContextOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const isLaptop = mode === 'laptop';

  return (
    <div className="ec-editor-responsive-layout" data-editor-responsive-mode={mode}>
      <div className="ec-editor-responsive-toolbar" aria-label={editorT('studio.editor.toolsLabel')}>
        {!isLaptop ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContextOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={contextOpen}
            data-editor-open-context
          >
            <ContextIcon aria-hidden="true" />
            {editorT('studio.editor.openContextLabel')}
          </Button>
        ) : null}
        <span className="ec-editor-responsive-mode-label">{editorT(`studio.editor.mode.${mode}`)}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInspectorOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={inspectorOpen}
          data-editor-open-inspector
        >
          <InspectorIcon aria-hidden="true" />
          {editorT('studio.editor.openInspectorLabel')}
        </Button>
      </div>

      <div className={isLaptop ? 'ec-editor-laptop-content' : 'ec-editor-responsive-canvas'}>
        {isLaptop ? <ContextRegion /> : null}
        <CanvasRegion />
      </div>

      {!isLaptop ? (
        <ToolSheet
          open={contextOpen}
          onOpenChange={setContextOpen}
          side="left"
          title={editorT('studio.editor.contextTitle')}
          description={editorT('studio.editor.contextSheetDescription')}
          testId="context"
        >
          <ContextRegion />
        </ToolSheet>
      ) : null}

      <ToolSheet
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        side="right"
        title={editorT('studio.editor.inspectorTitle')}
        description={editorT('studio.editor.inspectorSheetDescription')}
        testId="inspector"
      >
        <InspectorRegion />
      </ToolSheet>
    </div>
  );
}

export function StudioEditorWorkspace() {
  const mode = useEditorLayoutMode();

  return (
    <PuckEditorRoot config={structuralPuckConfig} data={structuralPuckData}>
      <section
        className="ec-editor-workspace"
        data-editor-layout={mode}
        data-help-id="help.studio.shell"
        aria-label={editorT('studio.editor.workspaceLabel')}
      >
        {mode === 'desktop' ? (
          <ResizableTriPane
            className="ec-editor-desktop-layout"
            left={<ContextRegion />}
            center={<CanvasRegion />}
            right={<InspectorRegion />}
            leftLabel={editorT('studio.editor.resizeContextLabel')}
            rightLabel={editorT('studio.editor.resizeInspectorLabel')}
            leftConstraint={editorPaneContract.context}
            rightConstraint={editorPaneContract.inspector}
          />
        ) : (
          <ResponsiveEditorLayout mode={mode} />
        )}
      </section>
    </PuckEditorRoot>
  );
}
