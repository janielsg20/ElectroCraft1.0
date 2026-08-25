import { expect, test } from '@playwright/test';

test.describe('M03.10 Spanish-first typed i18n', () => {
  test('shows Configuración > General > Idioma and persists Español', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    await page.getByRole('button', { name: 'Configuración' }).click();
    const dialog = page.getByRole('dialog', { name: 'Configuración' });
    const general = dialog.getByLabel('Configuración general');
    await expect(dialog.getByText('Configuración general')).toBeVisible();
    await expect(general.getByText('Idioma', { exact: true })).toBeVisible();

    const selector = general.getByRole('button', { name: 'Idioma' });
    await expect(selector).toContainText('Español');
    await selector.click();
    await page.getByRole('menuitem', { name: 'Español' }).click();

    await general.getByRole('button', { name: 'Guardar' }).click();
    await expect(general.getByText('Idioma guardado', { exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('electrocraft.studio.locale'))).toBe('es');

    await page.reload();
    await page.getByRole('button', { name: 'Configuración' }).click();
    await expect(
      page.getByRole('dialog', { name: 'Configuración' }).getByRole('button', { name: 'Idioma' }),
    ).toContainText('Español');
  });

  test('exposes persistent Spanish help for language infrastructure', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    await page.getByRole('button', { name: 'Configuración' }).click();

    const help = page.locator('[data-language-help-trigger]');
    await help.hover();
    await expect(page.getByRole('tooltip')).toContainText(
      'ElectroCraft se entrega en español. La infraestructura de idiomas permite añadir traducciones futuras sin cambiar la lógica de la aplicación.',
    );
  });

  test('does not leak known English shell controls from OSS engines', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    const body = page.locator('body');
    for (const forbidden of ['Save changes', 'Cancel changes', 'Open settings', 'Components panel', 'Export project']) {
      await expect(body).not.toContainText(forbidden);
    }
    await expect(page.getByRole('button', { name: 'Configuración' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Exportar' })).toBeVisible();
  });

  test('keeps language settings usable on mobile without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/editor');
    await page.getByRole('button', { name: 'Configuración' }).click();
    const dialog = page.getByRole('dialog', { name: 'Configuración' });
    const general = dialog.getByLabel('Configuración general');
    await expect(general.getByRole('button', { name: 'Idioma' })).toBeVisible();
    await expect(general.getByRole('button', { name: 'Guardar' })).toBeVisible();
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
