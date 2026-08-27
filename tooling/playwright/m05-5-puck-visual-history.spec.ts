import { expect, test, type Page } from '@playwright/test';

const VISUAL_HISTORY_KEY = 'electrocraft.editor.visualHistoryLimit.v1';

function readStoredHistoryLimit(page: Page) {
  return page.evaluate((key) => window.localStorage.getItem(key), VISUAL_HISTORY_KEY);
}

test.describe('M05.5 Puck visual history', () => {
  test('keeps a clean Puck session and persists the bounded Editor history preference', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/editor');
    await page.evaluate((key) => window.localStorage.removeItem(key), VISUAL_HISTORY_KEY);
    await page.reload();

    const undo = page.locator('[data-puck-history-action="undo"]').first();
    const redo = page.locator('[data-puck-history-action="redo"]').first();
    await expect(undo).toBeVisible();
    await expect(redo).toBeVisible();
    await expect(undo).toBeDisabled();
    await expect(redo).toBeDisabled();

    await page.locator('[data-topbar-settings-trigger]').click();
    const settings = page.locator('[data-topbar-settings-sheet]');
    const editor = settings.locator('[data-settings-destination="editor"]');
    await expect(editor).toBeVisible();
    await expect(editor).toContainText('Historial visual');
    await expect(editor).toContainText('No modifica el Historial de versiones del proyecto.');

    const limit = editor.getByRole('spinbutton', { name: 'Límite del historial visual' });
    await expect(limit).toHaveValue('50');
    await limit.fill('1');
    await expect.poll(() => readStoredHistoryLimit(page)).toBe('1');

    await page.keyboard.press('Escape');
    await page.reload();
    await expect(undo).toBeDisabled();
    await expect(redo).toBeDisabled();

    await page.locator('[data-topbar-settings-trigger]').click();
    const reopenedEditor = page.locator('[data-settings-destination="editor"]');
    const reopenedLimit = reopenedEditor.getByRole('spinbutton', { name: 'Límite del historial visual' });
    await expect(reopenedLimit).toHaveValue('1');
  });

  test('clamps unsafe preference input and remains usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    await page.locator('[data-topbar-settings-trigger]').click();

    const editor = page.locator('[data-settings-destination="editor"]');
    const limit = editor.getByRole('spinbutton', { name: 'Límite del historial visual' });
    await limit.fill('999');
    await expect(limit).toHaveValue('100');
    await expect.poll(() => readStoredHistoryLimit(page)).toBe('100');

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });

  test('persists Puck set actions used by undo and redo without persisting engine history', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { loadStudioPuckEditor } = await import('/src/features/editor/puck-editor-runtime.ts');
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');

      const projectId = crypto.randomUUID();
      const project = {
        id: projectId,
        name: 'Proyecto history M05.5',
        metadata: { source: 'm05.5-browser' },
      };
      const document = {
        schemaVersion: 3 as const,
        id: 'ec_document_0000000000055',
        version: 1,
        name: 'History',
        kind: 'screen' as const,
        root: {
          id: 'ec_node_0000000000056',
          componentRef: 'core.root',
          props: {},
          children: [
            {
              id: 'ec_node_0000000000057',
              componentRef: 'Text',
              props: { text: 'Inicial' },
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
      const definitions = [
        {
          schemaVersion: 1 as const,
          id: 'ec_component_0000000000058',
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
        objects: [{ objectId: document.id, kind: 'document', schemaVersion: 3, payload: document }],
        reason: 'm05.5-history-e2e',
      });

      const runtime = await loadStudioPuckEditor({
        projectId,
        definitions: definitions as unknown as Parameters<typeof loadStudioPuckEditor>[0]['definitions'],
        renderers: { Text: () => null },
      });
      type SyncAction = Parameters<typeof runtime.actionSync.applyAction>[0];
      type SyncState = Parameters<typeof runtime.actionSync.applyAction>[1];
      const action = (type: string) => ({ type }) as SyncAction;
      const appState = (data: unknown) => ({ data }) as SyncState;
      const initial = runtime.session.data;
      const edited = structuredClone(initial);
      edited.content[0]!.props.text = 'Editado';

      async function readDocument() {
        const opened = await projectStorageRuntime.openProject(projectId);
        return opened?.objects.find((object) => object.objectId === document.id);
      }

      runtime.actionSync.applyAction(action('setData'), appState(edited), appState(initial));
      await projectStorageRuntime.flushAutosave();
      const afterEdit = await readDocument();

      runtime.actionSync.applyAction(action('set'), appState(initial), appState(edited));
      await projectStorageRuntime.flushAutosave();
      const afterUndo = await readDocument();

      runtime.actionSync.applyAction(action('set'), appState(edited), appState(initial));
      await projectStorageRuntime.flushAutosave();
      const afterRedo = await readDocument();

      return {
        afterEdit,
        afterUndo,
        afterRedo,
        leakedHistory: JSON.stringify(afterRedo?.payload ?? {}).includes('"history"'),
        leakedUi: JSON.stringify(afterRedo?.payload ?? {}).includes('"ui"'),
      };
    });

    expect(result.afterEdit?.payload).toMatchObject({
      root: { children: [expect.objectContaining({ props: { text: 'Editado' } })] },
    });
    expect(result.afterUndo?.payload).toMatchObject({
      root: { children: [expect.objectContaining({ props: { text: 'Inicial' } })] },
    });
    expect(result.afterRedo?.payload).toMatchObject({
      root: { children: [expect.objectContaining({ props: { text: 'Editado' } })] },
    });
    expect(result.leakedHistory).toBe(false);
    expect(result.leakedUi).toBe(false);
  });
});
