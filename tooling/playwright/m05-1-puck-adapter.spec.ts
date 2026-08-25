import { expect, test } from '@playwright/test';

test.describe('M05.1 Puck adapter browser contract', () => {
  test(
    'round-trips an unknown child and persists only the canonical document through real browser storage',
    async ({ page }) => {
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
          name: 'Proyecto Puck M05.1',
          metadata: { source: 'm05.1-browser' },
        };
        const document = {
          schemaVersion: 3 as const,
          id: 'ec_document_0000000000002',
          version: 1,
          name: 'Compatibilidad',
          kind: 'screen' as const,
          root: {
            id: 'ec_node_0000000000003',
            componentRef: 'core.root',
            props: { label: 'Inicio' },
            children: [
              {
                id: 'ec_node_0000000000004',
                componentRef: 'LegacyWidget',
                props: { label: 'Conservarme' },
                children: [],
              },
            ],
          },
          references: { documentRefs: [] },
          metadata: { fixture: 'm05.1-browser' },
          formMeta: null,
          templateMeta: null,
        };

        await projectStorageRuntime.initialize();
        await projectStorageRuntime.saveProject({ project, objects: [], reason: 'm05.1-e2e' });
        const session = createStudioPuckDocumentSession(
          document as unknown as Parameters<typeof createStudioPuckDocumentSession>[0],
          [],
          {},
        );
        const persistence = createStudioPuckDocumentPersistenceBridge({ project, session });
        const reconstructed = persistence.apply(session.data);
        await projectStorageRuntime.flushAutosave();
        const reopened = await projectStorageRuntime.openProject(projectId);
        const persisted = reopened?.objects.find((object) => object.objectId === document.id) ?? null;

        return {
          rootProps: session.data.root,
          projectedType: String(session.data.content[0]?.type),
          diagnostics: session.diagnostics,
          document: reconstructed.document,
          persisted,
          leakedInternalKey: ['zones', 'ui', 'history', 'selectedItem', 'draggedItem'].some(
            (key) => key in (session.data as unknown as Record<string, unknown>),
          ),
        };
      });

      expect(result.rootProps).toEqual({ props: { label: 'Inicio' } });
      expect(result.projectedType).toBe('__ElectroCraftDiagnostic');
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ code: 'unknown-component', componentRef: 'LegacyWidget' }),
      );
      expect(result.document.root).toMatchObject({
        id: 'ec_node_0000000000003',
        componentRef: 'core.root',
        props: { label: 'Inicio' },
        children: [
          expect.objectContaining({
            id: 'ec_node_0000000000004',
            componentRef: 'LegacyWidget',
            props: { label: 'Conservarme' },
          }),
        ],
      });
      expect(result.persisted).toMatchObject({
        objectId: 'ec_document_0000000000002',
        kind: 'document',
        schemaVersion: 3,
        payload: expect.objectContaining({
          schemaVersion: 3,
          id: 'ec_document_0000000000002',
          root: expect.objectContaining({ componentRef: 'core.root' }),
        }),
      });
      expect(result.leakedInternalKey).toBe(false);
    },
  );
});
