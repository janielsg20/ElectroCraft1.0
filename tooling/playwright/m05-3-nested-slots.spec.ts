import { expect, test } from '@playwright/test';

test.describe('M05.3 nested Slots and migration browser contract', () => {
  test('migrates legacy zones with the active Puck config and persists only canonical nesting', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { createStudioPuckDocumentSession } = await import('/src/features/editor/puck-document-session.ts');
      const { createStudioPuckDocumentPersistenceBridge } = await import(
        '/src/features/editor/puck-document-persistence.ts',
      );
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');

      const projectId = crypto.randomUUID();
      const project = {
        id: projectId,
        name: 'Proyecto Slots M05.3',
        metadata: { source: 'm05.3-browser' },
      };
      const containerId = 'ec_node_0000000000001';
      const textId = 'ec_node_0000000000002';
      const document = {
        schemaVersion: 3 as const,
        id: 'ec_document_0000000000003',
        version: 1,
        name: 'Slots legacy',
        kind: 'screen' as const,
        root: {
          id: 'ec_node_0000000000004',
          componentRef: 'core.root',
          props: { label: 'Inicio' },
          children: [
            {
              id: containerId,
              componentRef: 'Container',
              props: {},
              children: [
                {
                  id: textId,
                  componentRef: 'Text',
                  props: { text: 'Contenido migrado' },
                  children: [],
                },
              ],
            },
          ],
        },
        references: { documentRefs: [] },
        metadata: { fixture: 'm05.3-browser' },
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
      const baseDefinition = {
        schemaVersion: 1 as const,
        version: 1,
        category: 'Basic',
        fields: [],
        defaultProps: {},
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
      };
      const definitions = [
        {
          ...baseDefinition,
          id: 'ec_component_0000000000005',
          key: 'Container',
          label: 'Contenedor',
          category: 'Layout',
        },
        {
          ...baseDefinition,
          id: 'ec_component_0000000000006',
          key: 'Text',
          label: 'Texto',
          fields: [{ key: 'text', label: 'Texto', kind: 'text' as const, required: false, options: [] }],
          defaultProps: { text: '' },
        },
      ];

      await projectStorageRuntime.initialize();
      await projectStorageRuntime.saveProject({ project, objects: [], reason: 'm05.3-e2e' });

      const session = createStudioPuckDocumentSession(
        document as unknown as Parameters<typeof createStudioPuckDocumentSession>[0],
        definitions as unknown as Parameters<typeof createStudioPuckDocumentSession>[1],
        { Container: () => null, Text: () => null },
      );
      const persistence = createStudioPuckDocumentPersistenceBridge({ project, session });
      const legacyData = {
        content: [{ type: 'Container', props: { id: containerId } }],
        root: { props: { label: 'Inicio' } },
        zones: {
          [`${containerId}:children`]: [{ type: 'Text', props: { id: textId, text: 'Contenido migrado' } }],
        },
      } as Parameters<typeof persistence.apply>[0];

      const reconstructed = persistence.apply(legacyData);
      await projectStorageRuntime.flushAutosave();
      const reopened = await projectStorageRuntime.openProject(projectId);
      const persisted = reopened?.objects.find((object) => object.objectId === document.id) ?? null;

      return {
        document: reconstructed.document,
        persisted,
        hasLegacyZones: JSON.stringify(reconstructed.document).includes('zones'),
      };
    });

    expect(result.document.root.children).toEqual([
      expect.objectContaining({
        componentRef: 'Container',
        children: [
          expect.objectContaining({
            componentRef: 'Text',
            props: { text: 'Contenido migrado' },
          }),
        ],
      }),
    ]);
    expect(result.persisted).toMatchObject({
      kind: 'document',
      schemaVersion: 3,
      payload: expect.objectContaining({
        root: expect.objectContaining({
          children: [expect.objectContaining({ componentRef: 'Container' })],
        }),
      }),
    });
    expect(result.hasLegacyZones).toBe(false);
  });
});
