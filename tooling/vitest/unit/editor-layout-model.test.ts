import { describe, expect, it } from 'vitest';
import { clampPaneSize } from '../../../packages/design-system/src/components/ui/resizable-pane-layout';
import { editorPaneContract, resolveEditorLayoutMode } from '../../../apps/studio/src/shell/editor-layout-model';

describe('M03.5 editor layout model', () => {
  it('keeps the exact pane contract', () => {
    expect(editorPaneContract.context).toEqual({ defaultSize: 288, minSize: 240, maxSize: 380 });
    expect(editorPaneContract.inspector).toEqual({ defaultSize: 320, minSize: 280, maxSize: 440 });
    expect(editorPaneContract.statusHeight).toBe(26);
  });

  it('resolves the required responsive bands', () => {
    expect(resolveEditorLayoutMode(1440)).toBe('desktop');
    expect(resolveEditorLayoutMode(1280)).toBe('desktop');
    expect(resolveEditorLayoutMode(1279)).toBe('laptop');
    expect(resolveEditorLayoutMode(1024)).toBe('laptop');
    expect(resolveEditorLayoutMode(1023)).toBe('tablet');
    expect(resolveEditorLayoutMode(768)).toBe('tablet');
    expect(resolveEditorLayoutMode(767)).toBe('mobile');
    expect(resolveEditorLayoutMode(360)).toBe('mobile');
  });

  it('clamps pane sizes without allowing invalid geometry', () => {
    expect(clampPaneSize(100, editorPaneContract.context)).toBe(240);
    expect(clampPaneSize(288.4, editorPaneContract.context)).toBe(288);
    expect(clampPaneSize(999, editorPaneContract.context)).toBe(380);
    expect(clampPaneSize(100, editorPaneContract.inspector)).toBe(280);
    expect(clampPaneSize(320.6, editorPaneContract.inspector)).toBe(321);
    expect(clampPaneSize(999, editorPaneContract.inspector)).toBe(440);
    expect(clampPaneSize(Number.NaN, editorPaneContract.context)).toBe(288);
  });
});
