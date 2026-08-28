import { expect, test, type Page } from '@playwright/test';

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Canvas guides M06.4', metadata: { source: 'm06.4-e2e' } },
      objects: [],
      reason: 'm06.4-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

test.describe('M06.4 Canvas guides', () => {
  test('creates, nudges and removes an editor-only guide with a keyboard alternative', async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m06-4-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 120_000 });

    const ruler = page.getByRole('button', {
      name: 'Regla horizontal. Haz clic para crear una guía vertical',
    });
    await expect(ruler).toBeVisible();
    await ruler.click({ position: { x: 120, y: 8 } });

    const guide = page.locator('.ec-canvas-guide--x').first();
    await expect(guide).toBeVisible();
    const before = await guide.getAttribute('aria-label');
    await guide.focus();
    await page.keyboard.press('ArrowRight');
    await expect(guide).not.toHaveAttribute('aria-label', before ?? '');
    await page.keyboard.press('Delete');
    await expect(page.locator('.ec-canvas-guide--x')).toHaveCount(0);

    await page.locator('[data-topbar-settings-trigger]').click();
    await expect(page.getByText('Regla', { exact: true })).toBeVisible();
    await page.getByLabel('Ocultar regla').click();
    await expect(ruler).toBeHidden();
  });
});
