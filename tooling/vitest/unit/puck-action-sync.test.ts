import { describe, expect, it, vi } from 'vitest';
import {
  resolvePuckDocumentActionChange,
  type PuckDocumentReconstruction,
  type PuckEditorAction,
  type PuckEditorAppState,
  type PuckEditorData,
} from '@electrocraft/editor-puck';
import { createStudioPuckActionSync } from '../../../apps/studio/src/features/editor/puck-action-sync';

function action(type: PuckEditorAction['type']): PuckEditorAction {
  return { type } as PuckEditorAction;
}

function appState(data: PuckEditorData): PuckEditorAppState {
  return { data } as unknown as PuckEditorAppState;
}

describe('M05.4 Puck action synchronization', () => {
  it('ignores UI-only actions even when Puck recreates the Data envelope', () => {
    const content: PuckEditorData['content'] = [];
    const root: PuckEditorData['root'] = { props: { title: 'Inicio' } };
    const previous = { content, root } as PuckEditorData;
    const current = { content, root } as PuckEditorData;

    expect(resolvePuckDocumentActionChange(action('setUi'), appState(current), appState(previous))).toBeNull();
  });

  it.each(['reorder', 'duplicate', 'remove', 'setData'] as const)('detects authoring data changes for %s', (type) => {
    const previous = {
      content: [{ type: 'Text', props: { id: 'ec_node_0000000000001', text: 'Antes' } }],
      root: { props: {} },
    } as PuckEditorData;
    const current = {
      ...previous,
      content: [{ type: 'Text', props: { id: 'ec_node_0000000000001', text: 'Después' } }],
    } as PuckEditorData;

    const change = resolvePuckDocumentActionChange(action(type), appState(current), appState(previous));

    expect(change).toMatchObject({ actionType: type, data: current, previousData: previous });
  });

  it('forwards changed Data to canonical persistence and keeps AppState out of the bridge', () => {
    const data = { content: [], root: { props: {} } } as PuckEditorData;
    const previous = { content: [], root: { props: {} } } as PuckEditorData;
    const reconstruction = {
      document: { id: 'document' },
      diagnostics: [],
    } as unknown as PuckDocumentReconstruction;
    const apply = vi.fn(() => reconstruction);
    const synchronized = vi.fn();
    const sync = createStudioPuckActionSync({
      persistence: { apply },
      onSynchronized: synchronized,
    });

    const result = sync.applyAction(action('setData'), appState(data), appState(previous));

    expect(result.status).toBe('synchronized');
    expect(apply).toHaveBeenCalledWith(data);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(synchronized).toHaveBeenCalledWith(reconstruction, 'setData');
  });

  it('fails closed when canonical reconstruction rejects changed Puck data', () => {
    const data = { content: [], root: { props: {} } } as PuckEditorData;
    const previous = { content: [], root: { props: {} } } as PuckEditorData;
    const onError = vi.fn();
    const sync = createStudioPuckActionSync({
      persistence: {
        apply() {
          throw new TypeError('documento inválido');
        },
      },
      onError,
    });

    const result = sync.applyAction(action('setData'), appState(data), appState(previous));

    expect(result.status).toBe('blocked');
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'documento inválido' }), 'setData');
  });
});
