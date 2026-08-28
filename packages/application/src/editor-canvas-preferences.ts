export const EDITOR_CANVAS_PREFERENCES_STORAGE_KEY = 'electrocraft.editor.canvasPreferences.v1' as const;

export interface EditorCanvasPreferences {
  readonly rulersVisible: boolean;
  readonly guidesVisible: boolean;
  readonly snappingEnabled: boolean;
  readonly snapGridSize: number;
}

export const DEFAULT_EDITOR_CANVAS_PREFERENCES: EditorCanvasPreferences = Object.freeze({
  rulersVisible: true,
  guidesVisible: true,
  snappingEnabled: true,
  snapGridSize: 8,
});

export function normalizeEditorCanvasPreferences(value: unknown): EditorCanvasPreferences {
  const input = value && typeof value === 'object' ? (value as Partial<EditorCanvasPreferences>) : {};
  const grid = typeof input.snapGridSize === 'number' && Number.isFinite(input.snapGridSize)
    ? Math.round(input.snapGridSize)
    : DEFAULT_EDITOR_CANVAS_PREFERENCES.snapGridSize;
  return Object.freeze({
    rulersVisible: typeof input.rulersVisible === 'boolean' ? input.rulersVisible : DEFAULT_EDITOR_CANVAS_PREFERENCES.rulersVisible,
    guidesVisible: typeof input.guidesVisible === 'boolean' ? input.guidesVisible : DEFAULT_EDITOR_CANVAS_PREFERENCES.guidesVisible,
    snappingEnabled: typeof input.snappingEnabled === 'boolean' ? input.snappingEnabled : DEFAULT_EDITOR_CANVAS_PREFERENCES.snappingEnabled,
    snapGridSize: Math.min(64, Math.max(1, grid)),
  });
}
