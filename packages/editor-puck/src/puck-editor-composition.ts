import { Puck, createUsePuck, type Config, type Data } from '@puckeditor/core';
import { Fragment, createElement, useEffect, useSyncExternalStore, type ComponentProps } from 'react';
import { puckEditorHistoryControls } from './puck-history-controls';
import { resolvePuckHistoryWindow } from './puck-history-policy';

export type PuckEditorConfig = Config;
export type PuckEditorOnChange = (data: Data) => void;

export const structuralPuckConfig: Config = {
  components: {},
  root: { fields: {} },
};

export const structuralPuckData: Data = {
  content: [],
  root: { props: {} },
};

/**
 * Puck 0.22 iframe policy for ElectroCraft Studio.
 * Project preview styles stay isolated from the Studio shell while Puck keeps
 * its own iframe interaction styles and waits for them before rendering.
 */
export const electroCraftPuckIframeConfig = Object.freeze({
  enabled: true,
  waitForStyles: true,
  syncHostStyles: false,
});

const useElectroCraftPuck = createUsePuck();

function PuckHistoryBridge() {
  const history = usePuckEditorHistoryControls();
  const controls = useSyncExternalStore(
    puckEditorHistoryControls.subscribe,
    puckEditorHistoryControls.getSnapshot,
    puckEditorHistoryControls.getSnapshot,
  );
  usePuckEditorHistoryPolicy(controls.visualHistoryLimit);

  useEffect(
    () =>
      puckEditorHistoryControls.connect({
        undo: history.undo,
        redo: history.redo,
      }),
    [history.undo, history.redo],
  );

  useEffect(() => {
    puckEditorHistoryControls.updateAvailability(history.canUndo, history.canRedo);
  }, [history.canUndo, history.canRedo]);

  return null;
}

/**
 * Public Puck composition surface owned by the editor-puck adapter.
 * Studio never imports @puckeditor/core directly. The session-only history
 * bridge is mounted inside the owning Puck context so shell controls can
 * delegate without copying AppState or the visual history stack.
 */
export function PuckEditorRoot({ iframe, children, ...props }: ComponentProps<typeof Puck>) {
  return createElement(
    Puck,
    {
      ...props,
      iframe: {
        ...iframe,
        ...electroCraftPuckIframeConfig,
      },
    },
    createElement(Fragment, null, createElement(PuckHistoryBridge), children),
  );
}

export const PuckEditorComponents = Puck.Components;
export const PuckEditorOutline = Puck.Outline;
export const PuckEditorPreview = Puck.Preview;
export const PuckEditorFields = Puck.Fields;

/**
 * Returns the stable active Config reference supplied to the owning <Puck>.
 * Callers derive UI-only availability from this reference instead of keeping
 * a second component registry.
 */
export function usePuckEditorConfig() {
  return useElectroCraftPuck((api) => api.config);
}

/**
 * Minimal public-data subscription for empty-state rendering. This observes
 * only Data.content; selection/history remain owned by Puck and outside the
 * canonical persistence bridge.
 */
export function usePuckEditorHasContent() {
  return useElectroCraftPuck((api) => api.appState.data.content.length > 0);
}

/**
 * Session-only visual history controls. The stack itself remains in Puck;
 * callers receive only availability plus delegation to the public back/forward
 * methods and never a copy of AppState/history.
 */
export function usePuckEditorHistoryControls() {
  const canUndo = useElectroCraftPuck((api) => api.history.hasPast);
  const canRedo = useElectroCraftPuck((api) => api.history.hasFuture);
  const undo = useElectroCraftPuck((api) => api.history.back);
  const redo = useElectroCraftPuck((api) => api.history.forward);

  return Object.freeze({ canUndo, canRedo, undo, redo });
}

/**
 * Enforces a bounded recent history window using only Puck's public history
 * API. Trimming is applied only at the current tip, so an undo position and
 * its redo branch are never changed by the policy itself.
 */
export function usePuckEditorHistoryPolicy(visualHistoryLimit: number) {
  const histories = useElectroCraftPuck((api) => api.history.histories);
  const index = useElectroCraftPuck((api) => api.history.index);
  const setHistories = useElectroCraftPuck((api) => api.history.setHistories);
  const setHistoryIndex = useElectroCraftPuck((api) => api.history.setHistoryIndex);

  useEffect(() => {
    const plan = resolvePuckHistoryWindow(histories, index, visualHistoryLimit);
    if (!plan) return;

    const nextHistories = [...plan.histories];
    setHistories(nextHistories);
    setHistoryIndex(plan.index);
  }, [histories, index, setHistories, setHistoryIndex, visualHistoryLimit]);
}

/**
 * Accessible click-to-insert bridge for Palette UI.
 * Availability is resolved by the Studio catalog before dispatching so an
 * unsupported catalog item never becomes a silent Puck success.
 */
export function usePuckPaletteInsert() {
  const dispatch = useElectroCraftPuck((api) => api.dispatch);

  return (componentType: string) => {
    dispatch({
      type: 'insert',
      componentType,
      destinationIndex: 0,
      destinationZone: 'root:default-zone',
    });
  };
}
