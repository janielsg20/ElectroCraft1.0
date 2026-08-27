import { expect, test } from '@playwright/test';

test.describe('M05.6 Text/RichText inline editing', () => {
  test('persists inline Text/RichText through the canonical action bridge', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { loadStudioPuckEditor } = await import('/src/features/editor/puck-editor-runtime.ts');
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');

      const projectId = crypto.randomUUID();
      const project = { id: projectId, name: 'Proyecto inline M05.6', metadata: { source: 'm05.6-browser' } };
      const document = {
        schemaVersion: 3 as const,
        id: 'ec_document_0000000000560',
        version: 1,
        name: 'Inline',
        kind: 'screen' as const,
        root: {
          id: 'ec_node_0000000000561',
          componentRef: 'core.root',
          props: {},
          children: [
            {
              id: 'ec_node_0000000000562',
              componentRef: 'Text',
              props: { text: 'Título inicial' },
              children: [],
            },
            {
              id: 'ec_node_0000000000563',
              componentRef: 'RichText',
              props: { content: '<p>Contenido inicial</p>' },
              children: [],
            },
          ],
        },
        references: { documentRefs: [] },
        metadata: {},
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
      const definition = (key: 'Text' | 'RichText', fieldKey: 'text' | 'content', id: string) => ({
        schemaVersion: 1 as const,
        id,
        version: 1,
        key,
        label: key === 'Text' ? 'Texto' : 'Texto enriquecido',
        category: 'Basic',
        fields: [{ key: fieldKey, label: 'Contenido', kind: 'text' as const, required: false, options: [] }],
        defaultProps: { [fieldKey]: '' },
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
      });
      const definitions = [
        definition('Text', 'text', 'ec_component_0000000000564'),
        definition('RichText', 'content', 'ec_component_0000000000565'),
      ];

      await projectStorageRuntime.initialize();
      await projectStorageRuntime.saveProject({
        project,
        objects: [{ objectId: document.id, kind: 'document', schemaVersion: 3, payload: document }],
        reason: 'm05.6-inline-e2e',
      });
      const runtime = await loadStudioPuckEditor({
        projectId,
        definitions: definitions as unknown as Parameters<typeof loadStudioPuckEditor>[0]['definitions'],
        renderers: { Text: () => null, RichText: () => null },
      });
      const textField = runtime.session.config.components.Text.fields?.text as {
        type?: string;
        contentEditable?: boolean;
      };
      const richTextField = runtime.session.config.components.RichText.fields?.content as {
        type?: string;
        contentEditable?: boolean;
      };
      const initial = runtime.session.data;
      const edited = structuredClone(initial);
      edited.content[0]!.props.text = 'Título editado inline';
      edited.content[1]!.props.content = '<p>Rich <strong>editado</strong></p>';

      type SyncAction = Parameters<typeof runtime.actionSync.applyAction>[0];
      type SyncState = Parameters<typeof runtime.actionSync.applyAction>[1];
      const action = { type: 'setData' } as SyncAction;
      const editedState = { data: edited } as SyncState;
      const initialState = { data: initial } as SyncState;
      runtime.actionSync.applyAction(action, editedState, initialState);
      await projectStorageRuntime.flushAutosave();
      const saved = (await projectStorageRuntime.openProject(projectId))?.objects.find(
        (object) => object.objectId === document.id,
      );
      const serialized = JSON.stringify(saved?.payload ?? {});

      return {
        textField,
        richTextField,
        saved,
        leakedHistory: serialized.includes('"history"'),
        leakedUi: serialized.includes('"ui"'),
        leakedTiptap: serialized.toLowerCase().includes('tiptap'),
      };
    });

    expect(result.textField).toEqual(expect.objectContaining({ type: 'text', contentEditable: true }));
    expect(result.richTextField).toEqual(expect.objectContaining({ type: 'richtext', contentEditable: true }));
    expect(result.saved?.payload).toMatchObject({
      root: {
        children: [
          expect.objectContaining({ props: { text: 'Título editado inline' } }),
          expect.objectContaining({ props: { content: '<p>Rich <strong>editado</strong></p>' } }),
        ],
      },
    });
    expect(result.leakedHistory).toBe(false);
    expect(result.leakedUi).toBe(false);
    expect(result.leakedTiptap).toBe(false);
  });

  test('keeps the editor shell responsive while inline editing styles are enabled', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
