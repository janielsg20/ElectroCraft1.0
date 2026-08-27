import { expect, test, type Page } from '@playwright/test';

async function seedEmptyProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');

    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Editor core M05.8', metadata: { source: 'm05.8-e2e' } },
      objects: [],
      reason: 'm05.8-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

async function readPersistedDocument(page: Page, projectId: string) {
  return page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.flushAutosave();
    const opened = await projectStorageRuntime.openProject(id);
    return opened?.objects.find((object) => object.kind === 'document')?.payload ?? null;
  }, projectId);
}

test.describe('M05.8 Editor core E2E', () => {
  test('inserts, edits, undoes/redoes, saves and reopens the real core editor', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m05-8-core-${Date.now()}`;
    await seedEmptyProject(page, projectId);

    await page.goto('/editor');
    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready');

    const palette = page.locator('[data-studio-palette]');
    await expect(palette).toHaveAttribute('data-puck-active-components', '5');

    for (const paletteId of [
      'palette.layout.container',
      'palette.basic.text',
      'palette.basic.image',
      'palette.basic.button',
    ]) {
      await palette.locator(`[data-palette-item="${paletteId}"] .ec-palette-item-main`).click();
    }

    const undo = page.locator('[data-puck-history-action="undo"]').first();
    const redo = page.locator('[data-puck-history-action="redo"]').first();
    await expect(undo).toBeEnabled();

    const afterInsert = (await readPersistedDocument(page, projectId)) as {
      root?: { children?: Array<{ componentRef?: string; props?: Record<string, unknown> }> };
    } | null;
    expect(afterInsert?.root?.children?.map((node) => node.componentRef)).toEqual([
      'Button',
      'Image',
      'Text',
      'Container',
    ]);

    await page.getByRole('tab', { name: 'Capas' }).click();
    const outline = page.locator('[data-puck-composition="outline"]');
    await outline.getByText('Texto', { exact: true }).first().click();

    const textField = page.locator('[data-puck-composition="fields"]').getByLabel('Texto', { exact: true });
    await expect(textField).toBeVisible();
    await textField.fill('Texto editado E2E');

    await expect.poll(async () => {
      const payload = (await readPersistedDocument(page, projectId)) as {
        root?: { children?: Array<{ componentRef?: string; props?: Record<string, unknown> }> };
      } | null;
      return payload?.root?.children?.find((node) => node.componentRef === 'Text')?.props?.text;
    }).toBe('Texto editado E2E');

    await undo.click();
    await expect(redo).toBeEnabled();
    await expect.poll(async () => {
      const payload = (await readPersistedDocument(page, projectId)) as {
        root?: { children?: Array<{ componentRef?: string; props?: Record<string, unknown> }> };
      } | null;
      return payload?.root?.children?.find((node) => node.componentRef === 'Text')?.props?.text;
    }).toBe('Texto');

    await redo.click();
    await expect.poll(async () => {
      const payload = (await readPersistedDocument(page, projectId)) as {
        root?: { children?: Array<{ componentRef?: string; props?: Record<string, unknown> }> };
      } | null;
      return payload?.root?.children?.find((node) => node.componentRef === 'Text')?.props?.text;
    }).toBe('Texto editado E2E');

    await page.reload();
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready');
    await expect(page.locator('.ec-topbar-save')).toContainText('Guardado');

    const reopened = JSON.stringify(await readPersistedDocument(page, projectId));
    expect(reopened).toContain('Texto editado E2E');
    expect(reopened).not.toContain('"history"');
    expect(reopened).not.toContain('"ui"');
    expect(reopened).not.toContain('"zones"');
  });

  test('round-trips nested/reordered core data through the browser autosave bridge', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    const result = await page.evaluate(async () => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      const { loadStudioPuckEditor } = await import('/src/features/editor/puck-editor-runtime.ts');
      const { studioCoreEditorDefinitions, studioCoreEditorRenderers } = await import(
        '/src/features/editor/puck-core-components.tsx'
      );

      const projectId = `m05-8-nested-${Date.now()}`;
      await projectStorageRuntime.initialize();
      await projectStorageRuntime.saveProject({
        project: { id: projectId, name: 'Nested M05.8', metadata: {} },
        objects: [],
        reason: 'm05.8-nested-seed',
      });
      const runtime = await loadStudioPuckEditor({
        projectId,
        definitions: studioCoreEditorDefinitions,
        renderers: studioCoreEditorRenderers,
      });
      const data = structuredClone(runtime.session.data);
      const component = (type: string, id: string, props: Record<string, unknown>) => ({
        type,
        props: { id, ...props },
      });
      data.content = [
        component('Container', 'ec_node_0000000000580', {
          children: [component('Text', 'ec_node_0000000000581', { text: 'Anidado' })],
        }),
        component('Button', 'ec_node_0000000000582', { label: 'Acción' }),
        component('Image', 'ec_node_0000000000583', { src: '', alt: 'Imagen nested' }),
      ];

      runtime.persistence.apply(data);
      await projectStorageRuntime.flushAutosave();
      const opened = await projectStorageRuntime.openProject(projectId);
      const payload = opened?.objects.find((object) => object.kind === 'document')?.payload;
      return { payload, serialized: JSON.stringify(payload ?? {}) };
    });

    expect(result.payload).toMatchObject({
      root: {
        children: [
          { componentRef: 'Container', children: [{ componentRef: 'Text', props: { text: 'Anidado' } }] },
          { componentRef: 'Button', props: { label: 'Acción' } },
          { componentRef: 'Image', props: { alt: 'Imagen nested' } },
        ],
      },
    });
    expect(result.serialized).not.toContain('"history"');
    expect(result.serialized).not.toContain('"ui"');
    expect(result.serialized).not.toContain('"zones"');
  });
});
