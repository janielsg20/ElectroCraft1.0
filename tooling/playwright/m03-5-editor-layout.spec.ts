import { expect, test } from '@playwright/test';

test.describe('M03.5 Context / Canvas / Inspector / Status', () => {
  test('renders exact desktop pane sizes and a 26px informational statusbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/editor');

    await expect(page.locator('[data-editor-layout="desktop"]')).toBeVisible();
    const context = page.locator('[data-editor-region="context"]');
    const canvas = page.locator('[data-editor-region="canvas"]');
    const inspector = page.locator('[data-editor-region="inspector"]');

    expect(Math.round((await context.boundingBox())?.width ?? 0)).toBe(288);
    expect(Math.round((await inspector.boundingBox())?.width ?? 0)).toBe(320);
    expect((await canvas.boundingBox())?.width ?? 0).toBeGreaterThan(300);
    expect(Math.round((await page.locator('.ec-app-shell-statusbar').boundingBox())?.height ?? 0)).toBe(26);
    await expect(page.locator('.ec-app-shell-statusbar')).toContainText('Listo');
  });

  test('resizes Context with keyboard and respects its declared range', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const context = page.locator('[data-editor-region="context"]');
    const separator = page.getByRole('separator', { name: 'Redimensionar panel Contexto' });
    await separator.focus();
    await page.keyboard.press('ArrowRight');
    expect(Math.round((await context.boundingBox())?.width ?? 0)).toBe(296);

    await page.keyboard.press('End');
    expect(Math.round((await context.boundingBox())?.width ?? 0)).toBe(380);
    await page.keyboard.press('Home');
    expect(Math.round((await context.boundingBox())?.width ?? 0)).toBe(240);
  });

  test('moves secondary tools to Sheets on tablet and restores the trigger focus', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/editor');

    await expect(page.locator('[data-editor-layout="tablet"]')).toBeVisible();
    await expect(page.locator('[data-editor-region="canvas"]')).toBeVisible();

    const contextTrigger = page.getByRole('button', { name: 'Contexto', exact: true });
    await contextTrigger.click();
    const contextDialog = page.getByRole('dialog', { name: 'Contexto' });
    await expect(contextDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(contextTrigger).toBeFocused();

    const inspectorTrigger = page.getByRole('button', { name: 'Inspector', exact: true });
    await inspectorTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Inspector' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(inspectorTrigger).toBeFocused();
  });

  test('keeps mobile canvas-first without horizontal document overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/editor');

    await expect(page.locator('[data-editor-layout="mobile"]')).toBeVisible();
    await expect(page.locator('[data-editor-region="canvas"]')).toBeVisible();
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
