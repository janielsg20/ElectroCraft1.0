import { expect, test } from '@playwright/test';

test.describe('M03.4 Topbar y Settings', () => {
  test('renders exact desktop regions and keeps Settings last', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/models');
    const topbar = page.locator('.ec-app-shell-topbar');
    expect((await topbar.boundingBox())?.height).toBe(52);
    await expect(topbar.getByText('Proyecto local')).toBeVisible();
    await expect(topbar.getByText('Modelos', { exact: true })).toBeVisible();
    await expect(topbar.getByText('Documento', { exact: true })).toBeVisible();
    await expect(topbar.getByText('Web', { exact: true })).toBeVisible();
    await expect(topbar.getByText('Escritorio', { exact: true })).toBeVisible();
    await expect(topbar.getByRole('link', { name: 'Vista previa' })).toBeVisible();
    await expect(topbar.getByRole('link', { name: 'Exportar' })).toBeVisible();
    await expect(topbar.getByText('Local', { exact: true })).toBeVisible();
    const rightButtons = topbar.locator('.ec-topbar-right button');
    await expect(rightButtons.last()).toHaveAttribute('aria-label', 'Configuración');
  });

  test('opens Settings, updates Sidebar preference and restores trigger focus', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const settings = page.getByRole('button', { name: 'Configuración' });
    await settings.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Configuración' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Contraer barra lateral' }).click();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-collapsed', 'true');
    await dialog.getByRole('button', { name: 'Cerrar configuración' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(settings).toBeFocused();
  });

  test('renders critical help in a persistent Sheet and restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const help = page.getByRole('button', { name: 'Ayuda' });
    await help.click();
    const dialog = page.getByRole('dialog', { name: 'AppShell del Studio' });
    await expect(dialog).toContainText('Configuración es siempre el último control');
    await dialog.getByRole('button', { name: 'Cerrar ayuda' }).click();
    await expect(help).toBeFocused();
  });

  test('moves secondary tools to a Radix Sheet on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/');
    await expect(page.locator('.ec-topbar-center')).toBeHidden();
    const tools = page.getByRole('button', { name: 'Más herramientas' });
    await expect(tools).toBeVisible();
    await tools.click();
    const dialog = page.getByRole('dialog', { name: 'Herramientas' });
    await expect(dialog.getByText('Documento', { exact: true })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Vista previa' })).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Exportar' })).toBeVisible();
  });

  test('keeps mobile topbar touch targets and horizontal fit', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    for (const name of ['Abrir navegación', 'Más herramientas', 'Ayuda', 'Configuración']) {
      const box = await page.getByRole('button', { name }).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
