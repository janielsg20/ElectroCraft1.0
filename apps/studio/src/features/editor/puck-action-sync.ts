import {
  resolvePuckDocumentActionChange,
  type PuckDocumentReconstruction,
  type PuckEditorAction,
  type PuckEditorAppState,
  type PuckEditorOnAction,
} from '@electrocraft/editor-puck';
import type { createStudioPuckDocumentPersistenceBridge } from './puck-document-persistence';

type StudioPuckPersistenceBridge = ReturnType<typeof createStudioPuckDocumentPersistenceBridge>;

export type StudioPuckActionSyncResult =
  | Readonly<{ status: 'ignored'; actionType: PuckEditorAction['type'] }>
  | Readonly<{
      status: 'synchronized';
      actionType: PuckEditorAction['type'];
      reconstruction: PuckDocumentReconstruction;
    }>
  | Readonly<{ status: 'blocked'; actionType: PuckEditorAction['type']; error: Error }>;

export interface StudioPuckActionSyncOptions {
  readonly persistence: StudioPuckPersistenceBridge;
  readonly onSynchronized?: (result: PuckDocumentReconstruction, actionType: PuckEditorAction['type']) => void;
  readonly onError?: (error: Error, actionType: PuckEditorAction['type']) => void;
}

function asError(error: unknown) {
  return error instanceof Error ? error : new Error('No se pudo sincronizar el documento del editor.');
}

/**
 * Observes Puck's public action snapshots and forwards only authoring Data
 * changes to the canonical persistence bridge. Puck remains the owner of
 * selection, DnD and visual history; none of AppState is persisted.
 */
export function createStudioPuckActionSync(options: StudioPuckActionSyncOptions) {
  function applyAction(
    action: PuckEditorAction,
    appState: PuckEditorAppState,
    prevAppState: PuckEditorAppState,
  ): StudioPuckActionSyncResult {
    const change = resolvePuckDocumentActionChange(action, appState, prevAppState);
    if (!change) {
      return Object.freeze({ status: 'ignored', actionType: action.type });
    }

    try {
      const reconstruction = options.persistence.apply(change.data);
      options.onSynchronized?.(reconstruction, change.actionType);
      return Object.freeze({ status: 'synchronized', actionType: change.actionType, reconstruction });
    } catch (error) {
      const normalized = asError(error);
      options.onError?.(normalized, change.actionType);
      return Object.freeze({ status: 'blocked', actionType: change.actionType, error: normalized });
    }
  }

  const onAction: PuckEditorOnAction = (action, appState, prevAppState) => {
    applyAction(action, appState, prevAppState);
  };

  return Object.freeze({ applyAction, onAction });
}

export type StudioPuckActionSync = ReturnType<typeof createStudioPuckActionSync>;
