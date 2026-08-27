import { expect, test, type Page } from '@playwright/test';

interface StoredNode {
  readonly id?: string;
  readonly componentRef?: string;
  readonly props?: Record<string, unknown>;
  readonly children?: StoredNode[];
}

interface StoredDocument {
  readonly root?: { readonly children?: StoredNode[] };
}

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

async function readRootChildren(page: Page, projectId: string): Promise<StoredNode[]> {
  const payload = (await readPersistedDocument(page, projectId)) as StoredDocument | null;
  return payload?.root?.children ?? [];
}

async function dispatchPuckAction(page: Page, action: Record<string, unknown>) {
  await page.evaluate(async (nextAction) => {
    const { studioPuckEditorCommands } = await import('/src/features/editor/puck-editor-runtime.ts');
    if (!studioPuckEditorCommands.isConnected()) throw new Error('Puck command bridge is not connected.');
    studioPuckEditorCommands.dispatch(nextAction as Parameters<typeof studioPuckEditorCommands.dispatch>[0]);
  }, action);
}

test.describe('M05.8 Editor core E2E', () => {
  test('inserts, nests, reorders, edits, undoes/redoes, saves and reopens the real editor', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m05-8-core-${Date.now()}`;
    await seedEmptyProject(page, projectId);

    await page.goto('/editor');
    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 20_000 });

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
    await expect.poll(async () => (await readRootChildren(page, projectId)).length).toBe(4);

    const insertedChildren = await readRootChildren(page, projectId);
    expect(insertedChildren.map((node) => node.componentRef)).toEqual(['Button', 'Image', 'Text', 'Container']);

    const textIndex = insertedChildren.findIndex((node) => node.componentRef === 'Text');
    const containerIndex = insertedChildren.findIndex((node) => node.componentRef === 'Container');
    const containerId = insertedChildren[containerIndex]?.id;
    expect(textIndex).toBeGreaterThanOrEqual(0);
    expect(containerIndex).toBeGreaterThanOrEqual(0);
    expect(containerId).toBeTruthy();

    await dispatchPuckAction(page, {
      type: 'move',
      sourceIndex: textIndex,
      sourceZone: 'root:default-zone',
      destinationIndex: 0,
      destinationZone: `${containerId}:children`,
    });

    await expect
      .poll(async () => {
        const children = await readRootChildren(page, projectId);
        const container = children.find((node) => node.componentRef === 'Container');
        return container?.children?.[0]?.componentRef;
      })
      .toBe('Text');

    const afterMove = await readRootChildren(page, projectId);
    const containerIndexAfterMove = afterMove.findIndex((node) => node.componentRef === 'Container');
    expect(containerIndexAfterMove).toBeGreaterThanOrEqual(0);

    await dispatchPuckAction(page, {
      type: 'reorder',
      sourceIndex: containerIndexAfterMove,
      destinationIndex: 0,
      destinationZone: 'root:default-zone',
    });

    await expect
      .poll(async () => (await readRootChildren(page, projectId)).map((node) => node.componentRef))
      .toEqual(['Container', 'Button', 'Image']);

    await page.getByRole('tab', { name: 'Capas' }).click();
    const outline = page.locator('[data-puck-composition="outline"]');
    await outline.getByText('Texto', { exact: true }).first().click();

    const fields = page.locator('[data-puck-composition="fields"]');
    const textField = fields.getByLabel('Texto', { exact: true });
    await expect(textField).toBeVisible();
    await textField.fill('Texto editado E2E');

    await expect
      .poll(async () => {
        const children = await readRootChildren(page, projectId);
        const container = children.find((node) => node.componentRef === 'Container');
        return container?.children?.[0]?.props?.text;
      })
      .toBe('Texto editado E2E');

    await undo.click();
    await expect(redo).toBeEnabled();
    await expect
      .poll(async () => {
        const children = await readRootChildren(page, projectId);
        const container = children.find((node) => node.componentRef === 'Container');
        return container?.children?.[0]?.props?.text;
      })
      .toBe('Texto');

    await redo.click();
    await expect
      .poll(async () => {
        const children = await readRootChildren(page, projectId);
        const container = children.find((node) => node.componentRef === 'Container');
        return container?.children?.[0]?.props?.text;
      })
      .toBe('Texto editado E2E');

    await page.reload();
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 20_000 });
    await expect(page.locator('.ec-topbar-save')).toContainText('Guardado');

    const reopened = JSON.stringify(await readPersistedDocument(page, projectId));
    expect(reopened).toContain('Texto editado E2E');
    expect(reopened).toContain('Container');
    expect(reopened).toContain('Image');
    expect(reopened).toContain('Button');
    expect(reopened).not.toContain('"history"');
    expect(reopened).not.toContain('"ui"');
    expect(reopened).not.toContain('"zones"');
  });
});
