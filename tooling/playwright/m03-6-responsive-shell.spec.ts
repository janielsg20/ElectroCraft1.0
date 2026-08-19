import { expect, test } from '@playwright/test';

test.describe('M03.6 responsive AppShell and editor', () => {
  test('keeps laptop split mode when the canvas has enough useful width', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 850 });
    await page.goto('/');

    const sidebar = page.locator('.ec-app-shell-sidebar');
    expect(Math.round((await sidebar.boundingBox())?.width ?? 0)).toBe(64);

    const layout = page.locator('[data-editor-responsive-mode="laptop"]');
    await expect(layout).toHaveAttribute('data-laptop-panel-strategy', 'split');
    await expect(page.locator('[data-editor-region="context"]')).toBeVisible();
    await expect(page.locator('[data-editor-region="canvas"]')).toBeVisible();

    const inspectorTrigger = page.getByRole('button', { name: 'Inspector', exact: true });
    await inspectorTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Inspector' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(inspectorTrigger).toBeFocused();
  });

  test('moves both secondary panels to overlays on a narrow laptop', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('/');

    const layout = page.locator('[data-editor-responsive-mode="laptop"]');
    await expect(layout).toHaveAttribute('data-laptop-panel-strategy', 'overlay');
    await expect(page.locator('[data-editor-region="canvas"]')).toBeVisible();
    await expect(page.locator('[data-editor-region="context"]')).toHaveCount(0);

    const contextTrigger = page.getByRole('button', { name: 'Contexto', exact: true });
    await contextTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Contexto' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(contextTrigger).toBeFocused();

    const inspectorTrigger = page.getByRole('button', { name: 'Inspector', exact: true });
    await inspectorTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Inspector' })).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(inspectorTrigger).toBeFocused();
  });

  test('uses a 56px tablet rail while keeping full navigation and editor tools in Sheets', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/');

    const sidebar = page.locator('.ec-app-shell-sidebar');
    await expect(sidebar).toBeVisible();
    expect(Math.round((await sidebar.boundingBox())?.width ?? 0)).toBe(56);

    const menuTrigger = page.getByRole('button', { name: 'Abrir navegación' });
    await menuTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Navegación' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menuTrigger).toBeFocused();

    const contextTrigger = page.getByRole('button', { name: 'Contexto', exact: true });
    const inspectorTrigger = page.getByRole('button', { name: 'Inspector', exact: true });
    expect((await contextTrigger.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect((await inspectorTrigger.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);

    await contextTrigger.click();
    await expect(page.getByRole('dialog', { name: 'Contexto' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(contextTrigger).toBeFocused();
  });

  test('renders the exact five-action mobile dock with bottom Properties and full-height Outline', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const dock = page.getByRole('navigation', { name: 'Navegación inferior del editor' });
    await expect(dock).toBeVisible();

    const destinations = dock.locator('[data-mobile-destination]');
    await expect(destinations).toHaveCount(5);
    await expect(destinations.nth(0)).toContainText('Componentes');
    await expect(destinations.nth(1)).toContainText('Pantallas');
    await expect(destinations.nth(2)).toContainText('Lienzo');
    await expect(destinations.nth(3)).toContainText('Propiedades');
    await expect(destinations.nth(4)).toContainText('Más');

    for (let index = 0; index < 5; index += 1) {
      const box = await destinations.nth(index).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(58);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }

    const properties = dock.locator('[data-mobile-destination="properties"]');
    await properties.click();
    const propertiesDialog = page.getByRole('dialog', { name: 'Propiedades' });
    await expect(propertiesDialog).toBeVisible();
    await expect(propertiesDialog).toHaveAttribute('data-sheet-side', 'bottom');
    const closeProperties = propertiesDialog.getByRole('button', { name: 'Cerrar Propiedades' });
    const closePropertiesBox = await closeProperties.boundingBox();
    expect(closePropertiesBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(closePropertiesBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await closeProperties.click();
    await expect(properties).toBeFocused();

    const more = dock.locator('[data-mobile-destination="more"]');
    await more.click();
    const moreDialog = page.getByRole('dialog', { name: 'Más' });
    await expect(moreDialog).toBeVisible();
    await expect(moreDialog.locator('[data-mobile-tool="outline"]')).toBeVisible();
    const moreBox = await moreDialog.boundingBox();
    expect(Math.round(moreBox?.width ?? 0)).toBe(360);
    expect(Math.round(moreBox?.height ?? 0)).toBe(800);
    await page.keyboard.press('Escape');
    await expect(more).toBeFocused();

    const canvasAction = dock.locator('[data-mobile-destination="canvas"]');
    await canvasAction.click();
    await expect(page.locator('[data-editor-canvas-stage]')).toBeFocused();

    const screens = dock.locator('[data-mobile-destination="screens"]');
    await expect(screens).toHaveAttribute('href', '/screens');

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
