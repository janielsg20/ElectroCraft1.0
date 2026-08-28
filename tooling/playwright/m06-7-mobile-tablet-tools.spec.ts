import { expect, test, type Page } from '@playwright/test';

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Responsive tools M06.7', metadata: { source: 'm06.7-e2e' } },
      objects: [],
      reason: 'm06.7-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

async function selectedRootItem(page: Page) {
  await page.evaluate(async () => {
    const { studioPuckEditorCommands } = await import('/src/features/editor/puck-editor-runtime.ts');
    studioPuckEditorCommands.dispatch({
      type: 'setUi',
      ui: { itemSelector: { index: 0, zone: 'root:default-zone' } },
    });
  });
}

for (const width of [360, 430, 768] as const) {
  test(`M06.7 keeps one real editor usable at ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: width === 768 ? 1024 : 860 });
    const projectId = `m06-7-${width}-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 60_000 });
    await expect(page.locator('.ec-editor-puck-root')).toHaveCount(1);
    await expect(page.locator('[data-puck-composition="preview"] iframe')).toHaveCount(1);

    if (width < 768) {
      await expect(workspace).toHaveAttribute('data-editor-layout', 'mobile');
      for (const destination of ['components', 'screens', 'canvas', 'properties', 'more']) {
        await expect(page.locator(`[data-mobile-destination="${destination}"]`)).toBeVisible();
      }
      await page.locator('[data-mobile-destination="components"]').click();
      const componentsSheet = page.locator('[data-editor-mobile-sheet="components"]');
      await expect(componentsSheet).toBeVisible();
      await componentsSheet.locator('[data-palette-item="palette.basic.text"] .ec-palette-item-main').click();
      await page.keyboard.press('Escape');
    } else {
      await expect(workspace).toHaveAttribute('data-editor-layout', 'tablet');
      await page.locator('[data-editor-open-context]').click();
      const contextSheet = page.locator('[data-editor-tool-sheet="context"]');
      await expect(contextSheet).toBeVisible();
      await contextSheet.locator('[data-palette-item="palette.basic.text"] .ec-palette-item-main').click();
      await page.keyboard.press('Escape');
    }

    await selectedRootItem(page);
    await expect(page.locator('[data-canvas-context-bar]')).toBeVisible();
    await expect(page.locator('[data-advanced-selection-toolbar]')).toBeVisible();

    if (width < 768) {
      await page.locator('[data-mobile-destination="properties"]').click();
      await expect(page.locator('[data-editor-mobile-sheet="properties"]')).toBeVisible();
    } else {
      await page.locator('[data-editor-open-inspector]').click();
      await expect(page.locator('[data-editor-tool-sheet="inspector"]')).toBeVisible();
    }

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
}
