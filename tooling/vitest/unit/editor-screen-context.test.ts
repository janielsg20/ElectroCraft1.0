import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { puckEditorHistoryControls } from '@electrocraft/editor-puck';
import { editorScreenSelectionRuntime } from '../../../apps/studio/src/features/navigation/editor-screen-selection-runtime';

function source(path: string) {
  return readFileSync(resolve(path), 'utf8');
}

describe('M07.3 screen-aware editor context', () => {
  it('keeps one Puck root and remounts it by the canonical screen session key', () => {
    const workspace = source('apps/studio/src/shell/editor-workspace.tsx');
    const hook = source('apps/studio/src/features/editor/use-puck-editor-runtime.ts');

    expect(workspace.match(/<PuckEditorRoot/g)).toHaveLength(1);
    expect(workspace).toContain('key={runtime.sessionKey}');
    expect(workspace).toContain('data-editor-screen-id={runtime.screenId ?? undefined}');
    expect(hook).toContain('sessionKey: runtime?.document.id');
    expect(hook).toContain('documentId: screenId ?? undefined');
  });

  it('uses the same screen selector in context, mobile and topbar without target-specific editor instances', () => {
    const workspace = source('apps/studio/src/shell/editor-workspace.tsx');
    const topbar = source('apps/studio/src/shell/studio-topbar.tsx');
    const selector = source('apps/studio/src/features/navigation/editor-screen-selector.tsx');

    expect(workspace).toContain('<EditorScreensContextPanel />');
    expect(workspace).toContain('data-editor-mobile-sheet="screens"');
    expect(topbar).toContain('<EditorScreenTopbarSelect fallbackLabel={activeLabel} />');
    expect(topbar).toContain('puckPlatformControls.select');
    expect(topbar).toContain('puckResponsiveControls.select');
    expect(selector).toContain('editorScreenSelectionRuntime.select(screen.id)');
    expect(workspace).not.toContain('PuckEditorRootWeb');
    expect(workspace).not.toContain('PuckEditorRootNative');
  });

  it('publishes screen selection independently of Puck state', () => {
    editorScreenSelectionRuntime.select('ec_document_0000000000002');
    expect(editorScreenSelectionRuntime.getSnapshot().screenId).toBe('ec_document_0000000000002');
    editorScreenSelectionRuntime.select('ec_document_000000000000e');
    expect(editorScreenSelectionRuntime.getSnapshot().screenId).toBe('ec_document_000000000000e');
    editorScreenSelectionRuntime.clear();
    expect(editorScreenSelectionRuntime.getSnapshot().screenId).toBeNull();
  });

  it('resets visual history availability when a new Puck session connects', () => {
    const disconnectFirst = puckEditorHistoryControls.connect({ undo: () => undefined, redo: () => undefined });
    puckEditorHistoryControls.updateAvailability(true, true);
    expect(puckEditorHistoryControls.getSnapshot()).toMatchObject({ canUndo: true, canRedo: true });

    const disconnectSecond = puckEditorHistoryControls.connect({ undo: () => undefined, redo: () => undefined });
    expect(puckEditorHistoryControls.getSnapshot()).toMatchObject({ canUndo: false, canRedo: false });

    disconnectFirst();
    puckEditorHistoryControls.updateAvailability(true, false);
    expect(puckEditorHistoryControls.getSnapshot()).toMatchObject({ canUndo: true, canRedo: false });
    disconnectSecond();
  });
});
