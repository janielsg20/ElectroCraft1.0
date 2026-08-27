import { usePuckEditorHistoryControls, usePuckEditorHistoryPolicy } from '@electrocraft/editor-puck';
import { useEffect } from 'react';
import { puckHistoryControlsRuntime } from './puck-history-controls-runtime';

export function PuckHistorySessionBridge({
  sessionKey,
  visualHistoryLimit,
}: {
  readonly sessionKey: string;
  readonly visualHistoryLimit: number;
}) {
  const history = usePuckEditorHistoryControls();
  usePuckEditorHistoryPolicy(visualHistoryLimit);

  useEffect(
    () =>
      puckHistoryControlsRuntime.connect(sessionKey, {
        undo: history.undo,
        redo: history.redo,
      }),
    [sessionKey, history.undo, history.redo],
  );

  useEffect(() => {
    puckHistoryControlsRuntime.updateAvailability(sessionKey, history.canUndo, history.canRedo);
  }, [sessionKey, history.canUndo, history.canRedo]);

  return null;
}
