import { normalizeVisualHistoryLimit } from '@electrocraft/application';

export interface PuckHistoryWindowPlan<T> {
  readonly histories: readonly T[];
  readonly index: number;
}

/**
 * Keeps the current Puck state plus at most `visualHistoryLimit` undo steps.
 * Trimming is deliberately deferred while the user is positioned before the
 * tip so future/redo entries are never destroyed merely by policy enforcement.
 */
export function resolvePuckHistoryWindow<T>(
  histories: readonly T[],
  index: number,
  visualHistoryLimit: number,
): PuckHistoryWindowPlan<T> | null {
  const limit = normalizeVisualHistoryLimit(visualHistoryLimit);
  const maxSnapshots = limit + 1;

  if (histories.length <= maxSnapshots) return null;
  if (index !== histories.length - 1) return null;

  const next = histories.slice(histories.length - maxSnapshots);
  return Object.freeze({
    histories: Object.freeze(next),
    index: next.length - 1,
  });
}
