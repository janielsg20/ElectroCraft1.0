import { VISUAL_HISTORY_LIMITS, normalizeVisualHistoryLimit } from '@electrocraft/application';

export interface PuckEditorHistoryControlSnapshot {
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly visualHistoryLimit: number;
}

interface PuckEditorHistoryDelegates {
  readonly undo: () => void;
  readonly redo: () => void;
}

const listeners = new Set<() => void>();
let connectionId = 0;
let delegates: PuckEditorHistoryDelegates | null = null;
let snapshot: PuckEditorHistoryControlSnapshot = Object.freeze({
  canUndo: false,
  canRedo: false,
  visualHistoryLimit: VISUAL_HISTORY_LIMITS.defaultValue,
});

function publish(next: PuckEditorHistoryControlSnapshot) {
  if (
    snapshot.canUndo === next.canUndo &&
    snapshot.canRedo === next.canRedo &&
    snapshot.visualHistoryLimit === next.visualHistoryLimit
  ) {
    return snapshot;
  }
  snapshot = Object.freeze(next);
  for (const listener of listeners) listener();
  return snapshot;
}

/**
 * Shell bridge for Puck visual history. It never stores the history snapshots
 * or private engine state; it only exposes availability, the bounded policy
 * value, and delegates to the currently mounted Puck instance.
 */
export const puckEditorHistoryControls = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  setVisualHistoryLimit(value: unknown) {
    return publish({
      ...snapshot,
      visualHistoryLimit: normalizeVisualHistoryLimit(value),
    });
  },
  connect(nextDelegates: PuckEditorHistoryDelegates) {
    const id = ++connectionId;
    delegates = nextDelegates;
    publish({ ...snapshot, canUndo: false, canRedo: false });
    return () => {
      if (id !== connectionId) return;
      delegates = null;
      publish({ ...snapshot, canUndo: false, canRedo: false });
    };
  },
  updateAvailability(canUndo: boolean, canRedo: boolean) {
    if (!delegates) return snapshot;
    return publish({ ...snapshot, canUndo, canRedo });
  },
  undo() {
    if (!snapshot.canUndo || !delegates) return false;
    delegates.undo();
    return true;
  },
  redo() {
    if (!snapshot.canRedo || !delegates) return false;
    delegates.redo();
    return true;
  },
});
