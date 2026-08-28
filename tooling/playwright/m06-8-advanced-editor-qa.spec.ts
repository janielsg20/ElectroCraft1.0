import { expect, test, type Page } from '@playwright/test';

interface StoredNode {
  readonly id?: string;
  readonly componentRef?: string;
}

interface StoredDocument {
  readonly root?: { readonly children?: StoredNode[] };
}

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Advanced editor QA M06.8', metadata: { source: 'm06.8-e2e' } },
      objects: [],
      reason: 'm06.8-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

async function readScreen(page: Page, projectId: string): Promise<StoredDocument | null> {
  return page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.flushAutosave();
    const opened = await projectStorageRuntime.openProject(id);
    return (
      (opened?.objects.find(
        (object) => object.kind === 'document' && (object.payload as { kind?: string }).kind === 'screen',
      )?.payload as StoredDocument | undefined) ?? null
    );
  }, projectId);
}

async function selectRootItem(page: Page, index: number) {
  await page.evaluate(async (itemIndex) => {
    const { studioPuckEditorCommands } = await import('/src/features/editor/puck-editor-runtime.ts');
    studioPuckEditorCommands.dispatch({
      type: 'setUi',
      ui: { itemSelector: { index: itemIndex, zone: 'root:default-zone' } },
    });
  }, index);
}

test.describe('M06.8 advanced editor QA', () => {
  test('keeps the same advanced Puck session usable from desktop to mobile', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m06-8-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 60_000 });
    await expect(workspace).toHaveAttribute('data-editor-layout', 'desktop');
    await expect(page.locator('.ec-editor-puck-root')).toHaveCount(1);

    await page.locator('[data-palette-item="palette.layout.container"] .ec-palette-item-main').click();
    await expect.poll(async () => (await readScreen(page, projectId))?.root?.children?.length).toBe(1);
    await selectRootItem(page, 0);

    await expect(page.locator('[data-canvas-context-bar]')).toBeVisible();
    await expect(page.locator('[data-advanced-selection-toolbar]')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Jerarquía del componente seleccionado' })).toContainText(
      'Contenedor',
    );

    const platformTool = page.locator('[data-topbar-tool="platform"]');
    await platformTool.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Android', exact: true }).click();
    await expect(platformTool.getByRole('combobox')).toContainText('Android');

    await page.setViewportSize({ width: 430, height: 932 });
    await expect(workspace).toHaveAttribute('data-editor-layout', 'mobile');
    await expect(page.locator('[data-editor-responsive-mode="mobile"]')).toBeVisible();
    await expect(page.locator('[data-mobile-destination]')).toHaveCount(5);
    await expect(page.locator('.ec-editor-puck-root')).toHaveCount(1);

    await page.locator('[data-mobile-destination="properties"]').click();
    await expect(page.locator('[data-editor-mobile-sheet="properties"]')).toBeVisible();
    await expect(page.locator('[data-editor-mobile-sheet="properties"] .ec-editor-inspector')).toBeVisible();

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);

    const screen = await readScreen(page, projectId);
    expect(screen?.root?.children?.map((node) => node.componentRef)).toEqual(['Container']);
  });
});
