import { expect, test } from '@playwright/test';

test.describe('M05.4 Puck actions canonical synchronization', () => {
  test('persists edit/reorder/duplicate/remove through F04 autosave and ignores UI-only actions', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { loadStudioPuckEditor } = await import('/src/features/editor/puck-editor-runtime.ts');
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');

      const projectId = crypto.randomUUID();
      const project = {
        id: projectId,
        name: 'Proyecto Puck M05.4',
        metadata: { source: 'm05.4-browser' },
      };
      const document = {
        schemaVersion: 3 as const,
        id: 'ec_document_0000000000001',
        version: 1,
        name: 'Acciones',
        kind: 'screen' as const,
        root: {
          id: 'ec_node_0000000000002',
          componentRef: 'core.root',
          props: {},
          children: [
            {
              id: 'ec_node_0000000000003',
              componentRef: 'Text',
              props: { text: 'A' },
              children: [],
            },
            {
              id: 'ec_node_0000000000004',
              componentRef: 'Text',
              props: { text: 'B' },
              children: [],
            },
          ],
        },
        references: { documentRefs: [] },
        metadata: { fixture: 'm05.4-browser' },
        formMeta: null,
        templateMeta: null,
      };
      const emptyStyle = {
        schemaVersion: 1 as const,
        base: {
          width: null,
          height: null,
          minWidth: null,
          maxWidth: null,
          gap: null,
          padding: null,
          margin: null,
          fontSize: null,
          fontWeight: null,
          textAlign: null,
          foreground: null,
          background: null,
          opacity: null,
        },
        responsive: {},
        platform: {},
      };
      const definitions = [
        {
          schemaVersion: 1 as const,
          id: 'ec_component_0000000000005',
          version: 1,
          key: 'Text',
          label: 'Texto',
          category: 'Basic',
          fields: [{ key: 'text', label: 'Texto', kind: 'text' as const, required: false, options: [] }],
          defaultProps: { text: '' },
          layout: {
            mode: 'flow' as const,
            gap: null,
            align: 'stretch' as const,
            justify: 'start' as const,
            wrap: false,
            columns: null,
          },
          style: emptyStyle,
          references: { componentRefs: [], assetRefs: [], actionRefs: [] },
          metadata: {},
        },
      ];

      await projectStorageRuntime.initialize();
      await projectStorageRuntime.saveProject({
        project,
        objects: [
          {
            objectId: document.id,
            kind: 'document',
            schemaVersion: document.schemaVersion,
            payload: document,
          },
        ],
        reason: 'm05.4-e2e',
      });

      const runtime = await loadStudioPuckEditor({
        projectId,
        definitions: definitions as unknown as Parameters<typeof loadStudioPuckEditor>[0]['definitions'],
        renderers: { Text: () => null },
      });
      const action = (type: string) => ({ type }) as Parameters<typeof runtime.actionSync.applyAction>[0];
      const appState = (data: unknown) => ({ data }) as Parameters<typeof runtime.actionSync.applyAction>[1];
      const initial = runtime.session.data;

      const selectionEnvelope = { ...initial };
      const selectionResult = runtime.actionSync.applyAction(
        action('setUi'),
        appState(selectionEnvelope),
        appState(initial),
      );
      const pendingAfterSelection = projectStorageRuntime.pendingAutosaveObjectIds();

      const edited = structuredClone(initial);
      edited.content[0]!.props.text = 'A editado';
      runtime.actionSync.applyAction(action('setData'), appState(edited), appState(initial));

      const reordered = structuredClone(edited);
      reordered.content = [reordered.content[1]!, reordered.content[0]!];
      runtime.actionSync.applyAction(action('reorder'), appState(reordered), appState(edited));

      const duplicated = structuredClone(reordered);
      duplicated.content.push({
        ...structuredClone(duplicated.content[0]!),
        props: { ...structuredClone(duplicated.content[0]!.props), id: 'ec_node_0000000000006' },
      });
      runtime.actionSync.applyAction(action('duplicate'), appState(duplicated), appState(reordered));

      const removed = structuredClone(duplicated);
      removed.content.splice(1, 1);
      runtime.actionSync.applyAction(action('remove'), appState(removed), appState(duplicated));

      const pendingBeforeFlush = projectStorageRuntime.pendingAutosaveObjectIds();
      await projectStorageRuntime.flushAutosave();
      const pendingAfterFlush = projectStorageRuntime.pendingAutosaveObjectIds();

      const postFlushSelection = { ...removed };
      const postFlushSelectionResult = runtime.actionSync.applyAction(
        action('setUi'),
        appState(postFlushSelection),
        appState(removed),
      );
      const pendingAfterPostFlushSelection = projectStorageRuntime.pendingAutosaveObjectIds();
      const reopened = await projectStorageRuntime.openProject(projectId);
      const persisted = reopened?.objects.find((object) => object.objectId === document.id) ?? null;

      return {
        selectionStatus: selectionResult.status,
        postFlushSelectionStatus: postFlushSelectionResult.status,
        pendingAfterSelection,
        pendingBeforeFlush,
        pendingAfterFlush,
        pendingAfterPostFlushSelection,
        persisted,
        leakedInternals: persisted
          ? ['selectedItem', 'draggedItem', 'history', 'ui'].some((key) =>
              JSON.stringify(persisted.payload).includes(`"${key}"`),
            )
          : true,
      };
    });

    expect(result.selectionStatus).toBe('ignored');
    expect(result.postFlushSelectionStatus).toBe('ignored');
    expect(result.pendingAfterSelection.dirtyObjectIds).toEqual([]);
    expect(result.pendingBeforeFlush.dirtyObjectIds).toEqual(['ec_document_0000000000001']);
    expect(result.pendingAfterFlush.dirtyObjectIds).toEqual([]);
    expect(result.pendingAfterPostFlushSelection.dirtyObjectIds).toEqual([]);
    expect(result.persisted).toMatchObject({
      objectId: 'ec_document_0000000000001',
      kind: 'document',
      schemaVersion: 4,
      payload: expect.objectContaining({
        schemaVersion: 4,
        root: expect.objectContaining({
          children: [
            expect.objectContaining({ id: 'ec_node_0000000000004', props: { text: 'B' } }),
            expect.objectContaining({ id: 'ec_node_0000000000006', props: { text: 'B' } }),
          ],
        }),
      }),
    });
    expect(result.leakedInternals).toBe(false);
  });
});
