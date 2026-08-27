export const EDITOR_VISUAL_HISTORY_STORAGE_KEY = 'electrocraft.editor.visualHistoryLimit.v1' as const;

export const VISUAL_HISTORY_LIMITS = Object.freeze({
  min: 1,
  defaultValue: 50,
  max: 100,
});

export function normalizeVisualHistoryLimit(value: unknown): number {
  const candidate = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : VISUAL_HISTORY_LIMITS.defaultValue;
  return Math.min(VISUAL_HISTORY_LIMITS.max, Math.max(VISUAL_HISTORY_LIMITS.min, candidate));
}
