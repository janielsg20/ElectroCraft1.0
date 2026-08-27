import { Puck, type Data } from '@puckeditor/core';
import type { ComponentProps } from 'react';

export type PuckEditorOnAction = NonNullable<ComponentProps<typeof Puck>['onAction']>;
export type PuckEditorAction = Parameters<PuckEditorOnAction>[0];
export type PuckEditorAppState = Parameters<PuckEditorOnAction>[1];

export interface PuckDocumentActionChange {
  readonly actionType: PuckEditorAction['type'];
  readonly data: Data;
  readonly previousData: Data;
}

function hasSameAuthoringData(current: Data, previous: Data) {
  return (
    current === previous ||
    (current.content === previous.content && current.root === previous.root && current.zones === previous.zones)
  );
}

/**
 * Puck owns action execution and editor history. ElectroCraft only observes
 * the public onAction snapshots and reacts when authoring Data has actually
 * changed. UI-only selection/viewport actions never enter project persistence.
 */
export function resolvePuckDocumentActionChange(
  action: PuckEditorAction,
  appState: PuckEditorAppState,
  prevAppState: PuckEditorAppState,
): PuckDocumentActionChange | null {
  if (hasSameAuthoringData(appState.data, prevAppState.data)) return null;

  return Object.freeze({
    actionType: action.type,
    data: appState.data,
    previousData: prevAppState.data,
  });
}
