import { expect, test } from '@playwright/test';

test.describe('M03.4 Topbar global + Settings', () => {
  test('renders exact desktop regions and keeps Settings as the last right action', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');

    const topbar = page.locator('.ec-app-shell-topbar');
    expect((await topbar.boundingBox())?.height).toBe(52);
    await expect(page.locator('.ec-topbar-left')).toContainText('Studio');
    await expect(page.locator('.ec-topbar-left')).toContainText('Editor');
    await expect(page.locator('[data-topbar-tool="platform"]')).toContainText('Web');
    await expect(page.locator('[data-topbar-tool="breakpoint"]')).toContainText('Escritorio');

    const settingsIsLast = await page
      .locator('.ec-topbar-right')
      .evaluate((element) => element.lastElementChild?.hasAttribute('data-topbar-settings-trigger'));
    expect(settingsIsLast).toBe(true);
  });

  test('opens Settings, updates the shared Sidebar preference and restores focus on close', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const settings = page.getByRole('button', { name: 'Configuración' });
    await settings.click();
    const dialog = page.getByRole('dialog', { name: 'Configuración' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Espacio de trabajo')).toBeVisible();

    await dialog.getByRole('button', { name: 'Contraer' }).click();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-collapsed', 'true');
    expect((await page.locator('.ec-app-shell-sidebar').boundingBox())?.width).toBe(64);

    await dialog.getByRole('button', { name: 'Cerrar configuración' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(settings).toBeFocused();
  });

  test('opens persistent AppShell help instead of hiding critical help in a tooltip', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Ayuda' }).click();
    const dialog = page.getByRole('dialog', { name: 'AppShell del Studio' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('WorkspacePreferencesPort');
    await dialog.getByRole('button', { name: 'Cerrar ayuda' }).click();
    await expect(page.getByRole('button', { name: 'Ayuda' })).toBeFocused();
  });

  test('moves contextual tools into a Sheet on tablet and avoids horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/');

    await expect(page.locator('.ec-topbar-center')).toBeHidden();
    const tools = page.getByRole('button', { name: 'Abrir herramientas contextuales' });
    await expect(tools).toBeVisible();
    await tools.click();
    const toolsDialog = page.getByRole('dialog', { name: 'Herramientas contextuales' });
    await expect(toolsDialog).toContainText('Tablet');
    await page.keyboard.press('Escape');
    await expect(tools).toBeFocused();

    await page.setViewportSize({ width: 360, height: 800 });
    const settingsBox = await page.getByRole('button', { name: 'Configuración' }).boundingBox();
    const helpBox = await page.getByRole('button', { name: 'Ayuda' }).boundingBox();
    expect(settingsBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(settingsBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(helpBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(helpBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
