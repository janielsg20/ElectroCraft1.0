import type { PuckEditorAction } from './puck-action-sync';

type PuckEditorDispatch = (action: PuckEditorAction) => void;

let activeDispatch: PuckEditorDispatch | null = null;

/**
 * Session-only command bridge for documented Puck actions. It deliberately
 * stores only the current dispatch function: Data, selection, DnD state and
 * history remain inside the owning Puck instance.
 */
export const puckEditorCommandControls = Object.freeze({
  connect(dispatch: PuckEditorDispatch) {
    activeDispatch = dispatch;
    return () => {
      if (activeDispatch === dispatch) activeDispatch = null;
    };
  },
  isConnected() {
    return activeDispatch !== null;
  },
  dispatch(action: PuckEditorAction) {
    if (!activeDispatch) throw new Error('Puck editor command bridge is not connected.');
    activeDispatch(action);
  },
});
