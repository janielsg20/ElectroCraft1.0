import { expect, test } from '@playwright/test';

test.describe('M03.1 design-system gallery', () => {
  test('supports keyboard, theme cycle and Radix overlays', async ({ page }) => {
    await page.goto('/__design-system');

    await expect(page.getByRole('heading', { name: 'Sistema de diseño ElectroCraft' })).toBeVisible();
    await expect(page.locator('[data-help-id="help.studio.shell"]')).toBeVisible();
    await expect(page.getByText('Editor', { exact: true })).toBeVisible();
    await expect(page.getByText('Configuración', { exact: true })).toBeVisible();

    const themeButton = page.getByRole('button', { name: /Tema:/ });
    await page.keyboard.press('Tab');
    await expect(themeButton).toBeFocused();
    await expect.poll(() => themeButton.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
    await expect(themeButton).toContainText('Sistema');
    await themeButton.click();
    await expect(themeButton).toContainText('Claro');
    await themeButton.click();
    await expect(themeButton).toContainText('Oscuro');

    const actions = page.getByRole('button', { name: 'Acciones' });
    await actions.focus();
    await expect(actions).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Duplicar' })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Abrir inspector' }).click();
    await expect(page.getByRole('dialog', { name: 'Inspector técnico' })).toBeVisible();
    await expect(page.getByLabel('Nombre')).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar panel' }).click();
    await expect(page.getByRole('dialog', { name: 'Inspector técnico' })).toHaveCount(0);
  });

  for (const viewport of [
    { name: 'mobile', width: 360, height: 800 },
    { name: 'tablet', width: 768, height: 900 },
    { name: 'desktop', width: 1440, height: 1000 },
  ]) {
    test(`renders without horizontal overflow on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/__design-system');

      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);

      if (viewport.width < 768) {
        const primaryButton = page.getByRole('button', { name: 'Acción principal' });
        const box = await primaryButton.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  }
});
