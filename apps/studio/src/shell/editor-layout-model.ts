export const editorPaneContract = Object.freeze({
  context: Object.freeze({ defaultSize: 288, minSize: 240, maxSize: 380 }),
  inspector: Object.freeze({ defaultSize: 320, minSize: 280, maxSize: 440 }),
  statusHeight: 26,
});

export type EditorLayoutMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export function resolveEditorLayoutMode(width: number): EditorLayoutMode {
  if (width >= 1280) return 'desktop';
  if (width >= 1024) return 'laptop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}
