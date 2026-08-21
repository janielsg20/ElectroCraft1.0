import { expect, test } from '@playwright/test';
test('wizard crea y reabre un proyecto y expone acciones', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(button).toBeEnabled({ timeout: 60_000 });
  await button.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Nombre del proyecto').fill('Portal editorial');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByRole('heading', { name: /Diseño/ })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByText('Portal editorial')).toBeVisible();
  await page.screenshot({ path: '.ai/evidence/F04/M04.5/wizard-review.png', fullPage: true });
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
  await page.reload();
  await expect(page.getByRole('button', { name: /Portal editorial/ })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'Duplicar' }).first()).toBeVisible();
});
test('wizard móvil ocupa la pantalla sin overflow', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(button).toBeEnabled({ timeout: 60_000 });
  await button.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(
    false,
  );
});
