import { expect, test } from '@playwright/test';

async function createAndOpenProject(page: import('@playwright/test').Page) {
  await page.goto('/');
  const create = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(create).toBeEnabled({ timeout: 60_000 });
  await create.click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
}

async function openHistory(page: import('@playwright/test').Page) {
  const history = page.getByRole('link', { name: 'Historial', exact: true }).first();
  await expect(history).toBeVisible({ timeout: 60_000 });
  await history.click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.locator('[data-revision-history-route]')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Historial de versiones' })).toBeVisible();
}

test.describe('M04.8 Project revision history', () => {
  test('guarda, recarga y restaura una revisión sin borrar el historial', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await createAndOpenProject(page);
    await openHistory(page);

    await page.getByRole('button', { name: 'Guardar revisión' }).click();
    const options = page.getByRole('option');
    await expect.poll(async () => options.count(), { timeout: 60_000 }).toBeGreaterThanOrEqual(2);

    const beforeRestoreCount = await options.count();
    await options.last().click();
    await page.getByRole('button', { name: 'Restaurar', exact: true }).click();
    const confirmation = page.getByRole('alertdialog');
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText('no borra el historial existente');
    await confirmation.getByRole('button', { name: 'Restaurar versión' }).click();

    await expect.poll(async () => options.count(), { timeout: 60_000 }).toBeGreaterThanOrEqual(beforeRestoreCount + 2);
    await expect(options.first()).toContainText('Restauración de una versión anterior');

    const persistedCount = await options.count();
    await page.reload();
    await expect(page.locator('[data-revision-history-route]')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('option')).toHaveCount(persistedCount, { timeout: 60_000 });
    await expect(page.getByRole('option').first()).toContainText('Restauración de una versión anterior');
  });

  test('mantiene Historial usable en móvil sin comprimir el layout desktop', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await createAndOpenProject(page);
    await openHistory(page);
    await page.getByRole('button', { name: 'Guardar revisión' }).click();
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 60_000 });

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.ec-revision-history-layout')).toBeVisible();
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
