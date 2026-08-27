import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  electroCraftDocumentSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import type {
  PuckEditorAction,
  PuckEditorAppState,
  PuckEditorData,
  PuckRendererRegistry,
} from '@electrocraft/editor-puck';
import {
  loadStudioPuckEditor,
  type StudioPuckProjectRuntimePort,
} from '../../../apps/studio/src/features/editor/puck-editor-runtime';

function componentTemplate(): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse(
    JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/component-definition-v1.json'), 'utf8')),
  );
}

function textDefinition(): ElectroCraftComponentDefinition {
  const template = componentTemplate();
  return electroCraftComponentDefinitionSchema.parse({
    ...template,
    id: createDeterministicObjectId('component', 'm05.4-text'),
    key: 'Text',
    label: 'Texto',
    fields: [{ key: 'text', label: 'Texto', kind: 'text', required: false, options: [] }],
    defaultProps: { text: '' },
  });
}

function action(type: PuckEditorAction['type']): PuckEditorAction {
  return { type } as PuckEditorAction;
}

function appState(data: PuckEditorData): PuckEditorAppState {
  return { data } as unknown as PuckEditorAppState;
}

describe('M05.4 Puck action -> canonical persistence integration', () => {
  it('synchronizes edit/reorder/duplicate/remove and ignores selection-only state', async () => {
    const document = electroCraftDocumentSchema.parse({
      schemaVersion: 4,
      id: createDeterministicObjectId('document', 'm05.4-screen'),
      version: 1,
      name: 'Inicio',
      kind: 'screen',
      root: {
        id: createDeterministicObjectId('node', 'm05.4-root'),
        componentRef: 'core.root',
        props: {},
        children: [
          {
            id: createDeterministicObjectId('node', 'm05.4-a'),
            componentRef: 'Text',
            props: { text: 'A' },
            children: [],
          },
          {
            id: createDeterministicObjectId('node', 'm05.4-b'),
            componentRef: 'Text',
            props: { text: 'B' },
            children: [],
          },
        ],
      },
      references: { documentRefs: [] },
      metadata: {},
      formMeta: null,
      templateMeta: null,
    });
    const project = { id: 'project-m05-4', name: 'Proyecto M05.4', metadata: {} };
    const queueAutosave = vi.fn();
    const port: StudioPuckProjectRuntimePort = {
      initialize: vi.fn(async () => undefined),
      openProject: vi.fn(async () => ({
        project,
        objects: [
          {
            projectId: project.id,
            objectId: document.id,
            kind: 'document',
            schemaVersion: document.schemaVersion,
            payload: document,
            checksum: 'checksum',
            updatedAt: new Date(0).toISOString(),
          },
        ],
        revision: null,
      })),
      queueAutosave,
    } as unknown as StudioPuckProjectRuntimePort;
    const renderers: PuckRendererRegistry = { Text: () => null };
    const runtime = await loadStudioPuckEditor({
      projectId: project.id,
      definitions: [textDefinition()],
      renderers,
      projectRuntime: port,
    });

    const initial = runtime.session.data;
    const edited = structuredClone(initial);
    edited.content[0]!.props.text = 'A editado';
    expect(runtime.actionSync.applyAction(action('setData'), appState(edited), appState(initial)).status).toBe(
      'synchronized',
    );

    const reordered = structuredClone(edited);
    reordered.content = [reordered.content[1]!, reordered.content[0]!];
    expect(runtime.actionSync.applyAction(action('reorder'), appState(reordered), appState(edited)).status).toBe(
      'synchronized',
    );

    const duplicated = structuredClone(reordered);
    duplicated.content.push({
      ...structuredClone(duplicated.content[0]!),
      props: {
        ...structuredClone(duplicated.content[0]!.props),
        id: createDeterministicObjectId('node', 'm05.4-b-copy'),
      },
    });
    expect(runtime.actionSync.applyAction(action('duplicate'), appState(duplicated), appState(reordered)).status).toBe(
      'synchronized',
    );

    const removed = structuredClone(duplicated);
    removed.content.splice(1, 1);
    expect(runtime.actionSync.applyAction(action('remove'), appState(removed), appState(duplicated)).status).toBe(
      'synchronized',
    );

    const selectionEnvelope = { ...removed } as PuckEditorData;
    expect(runtime.actionSync.applyAction(action('setUi'), appState(selectionEnvelope), appState(removed)).status).toBe(
      'ignored',
    );

    expect(queueAutosave).toHaveBeenCalledTimes(4);
    const finalRequest = queueAutosave.mock.calls.at(-1)?.[0];
    expect(finalRequest).toMatchObject({
      project,
      dirtyObjects: [
        expect.objectContaining({
          objectId: document.id,
          kind: 'document',
          schemaVersion: 4,
          payload: expect.objectContaining({
            root: expect.objectContaining({
              children: [
                expect.objectContaining({ props: { text: 'B' } }),
                expect.objectContaining({ id: createDeterministicObjectId('node', 'm05.4-b-copy') }),
              ],
            }),
          }),
        }),
      ],
    });
    const serialized = JSON.stringify(finalRequest);
    expect(serialized).not.toContain('selectedItem');
    expect(serialized).not.toContain('draggedItem');
    expect(serialized).not.toContain('history');
    expect(serialized).not.toContain('"ui"');
  });
});
