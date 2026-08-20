import { expect, test } from '@playwright/test';

test.describe('M04.1 almacenamiento local real', () => {
  test('initializes the browser database behind Settings without exposing engine internals', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const settings = page.getByRole('button', { name: 'Configuración' });
    await settings.click();

    const dialog = page.getByRole('dialog', { name: 'Configuración' });
    const storage = dialog.locator('[data-project-storage-settings]');
    await expect(storage).toBeVisible();
    await expect(storage.getByRole('heading', { name: 'Almacenamiento' })).toBeVisible();

    await expect(storage.getByRole('status').first()).toContainText(/Base local persistente lista mediante (OPFS|IndexedDB)\./, {
      timeout: 30_000,
    });
    await expect(storage).toContainText(/(OPFS persistente|IndexedDB persistente)/);
    await expect(storage.getByRole('button', { name: 'Revisar' })).toBeEnabled();
    await expect(storage).not.toContainText('No se pudo inicializar el almacenamiento local');

    expect(pageErrors).toEqual([]);
  });

  test('keeps storage diagnostics usable on mobile without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    await page.getByRole('button', { name: 'Configuración' }).click();
    const dialog = page.getByRole('dialog', { name: 'Configuración' });
    const storage = dialog.locator('[data-project-storage-settings]');

    await expect(storage.getByRole('status').first()).toContainText(/Base local persistente lista mediante (OPFS|IndexedDB)\./, {
      timeout: 30_000,
    });
    const repair = storage.getByRole('button', { name: 'Revisar' });
    const repairBox = await repair.boundingBox();
    expect(repairBox?.height ?? 0).toBeGreaterThanOrEqual(36);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
