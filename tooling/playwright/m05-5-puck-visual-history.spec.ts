import { expect, test } from '@playwright/test';

const VISUAL_HISTORY_KEY = 'electrocraft.editor.visualHistoryLimit.v1';

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
    await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), VISUAL_HISTORY_KEY)).toBe('1');

    await page.keyboard.press('Escape');
    await page.reload();
    await expect(undo).toBeDisabled();
    await expect(redo).toBeDisabled();

    await page.locator('[data-topbar-settings-trigger]').click();
    await expect(
      page.locator('[data-settings-destination="editor"]').getByRole('spinbutton', { name: 'Límite del historial visual' }),
    ).toHaveValue('1');
  });

  test('clamps unsafe preference input and remains usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/editor');
    await page.locator('[data-topbar-settings-trigger]').click();

    const editor = page.locator('[data-settings-destination="editor"]');
    const limit = editor.getByRole('spinbutton', { name: 'Límite del historial visual' });
    await limit.fill('999');
    await expect(limit).toHaveValue('100');
    await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), VISUAL_HISTORY_KEY)).toBe('100');

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
