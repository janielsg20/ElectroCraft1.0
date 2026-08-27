export interface PuckHistoryControlsSnapshot {
  readonly sessionKey: string | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

interface PuckHistoryDelegates {
  readonly undo: () => void;
  readonly redo: () => void;
}

const listeners = new Set<() => void>();
const emptySnapshot: PuckHistoryControlsSnapshot = Object.freeze({
  sessionKey: null,
  canUndo: false,
  canRedo: false,
});

let snapshot = emptySnapshot;
let delegates: PuckHistoryDelegates | null = null;

function publish(next: PuckHistoryControlsSnapshot) {
  if (
    snapshot.sessionKey === next.sessionKey &&
    snapshot.canUndo === next.canUndo &&
    snapshot.canRedo === next.canRedo
  ) {
    return snapshot;
  }
  snapshot = Object.freeze(next);
  for (const listener of listeners) listener();
  return snapshot;
}

export const puckHistoryControlsRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  connect(sessionKey: string, nextDelegates: PuckHistoryDelegates) {
    delegates = nextDelegates;
    publish({ sessionKey, canUndo: false, canRedo: false });
    return () => {
      if (snapshot.sessionKey !== sessionKey) return;
      delegates = null;
      publish(emptySnapshot);
    };
  },
  updateAvailability(sessionKey: string, canUndo: boolean, canRedo: boolean) {
    if (snapshot.sessionKey !== sessionKey) return snapshot;
    return publish({ sessionKey, canUndo, canRedo });
  },
  undo() {
    if (!snapshot.canUndo) return false;
    delegates?.undo();
    return Boolean(delegates);
  },
  redo() {
    if (!snapshot.canRedo) return false;
    delegates?.redo();
    return Boolean(delegates);
  },
});
