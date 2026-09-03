import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Modelos F08');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
}

async function createInternalSource(page: Page) {
  await page.goto('/data-sources');
  await expect(page.getByRole('heading', { name: 'Fuentes de datos' })).toBeVisible({ timeout: 60_000 });
  const createInternal = page.getByRole('button', { name: 'Crear ElectroCraft Data' });
  if (await createInternal.isVisible()) {
    await createInternal.click();
    await expect(page.getByText('ElectroCraft Data creada.')).toBeVisible({ timeout: 60_000 });
  }
}

test('M08.8 crea y persiste un modelo con Field Registry desde Datos > Modelos', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);

  await page.goto('/models');
  await expect(page.getByRole('heading', { name: 'Modelos', exact: true })).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('[data-help-trigger="help.content.models"]')).toBeVisible();
  await page.getByRole('button', { name: 'Nuevo modelo' }).click();
  await expect(page.getByRole('heading', { name: 'Nuevo modelo', exact: true })).toBeVisible({ timeout: 60_000 });

  await page.getByRole('tab', { name: 'Identidad' }).click();
  await page.getByLabel('Nombre del modelo').fill('Producto');
  await page.getByLabel('Nombre singular').fill('Producto');
  await page.getByLabel('Nombre plural').fill('Productos');
  await page.getByRole('button', { name: 'Guardar identidad' }).click();
  await expect(page.getByRole('heading', { name: 'Producto', exact: true })).toBeVisible({ timeout: 60_000 });

  await page.getByRole('tab', { name: 'Campos' }).click();
  await page.getByLabel('Nombre del nuevo campo').fill('Precio');
  await page.getByLabel('Tipo del nuevo campo').selectOption('currency');
  await page.getByRole('button', { name: 'Añadir' }).click();
  const priceField = page.getByRole('listitem').filter({ hasText: 'Precio' });
  await expect(priceField).toBeVisible();
  await expect(priceField).toContainText('Moneda');

  await page.getByRole('button', { name: 'Analizar impacto' }).click();
  await expect(page.getByText('Este modelo todavía no tiene registros.')).toBeVisible();
  await page.screenshot({ path: '.ai/evidence/F08/M08.8/data-models-desktop.png', fullPage: true });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Producto', exact: true })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('tab', { name: 'Campos' }).click();
  await expect(page.getByText('Precio', { exact: true }).first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Modelos', exact: true })).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: '.ai/evidence/F08/M08.8/data-models-mobile.png', fullPage: true });
});