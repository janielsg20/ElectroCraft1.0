import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Registros F08');
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

test('M08.12 crea, valida, edita y elimina suavemente un registro desde /content', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);
  await page.goto('/models');
  const newModel = page.getByRole('button', { name: 'Nuevo modelo' });
  await expect(newModel).toBeEnabled({ timeout: 60_000 });
  await newModel.click();
  await expect(page.getByRole('heading', { name: 'Nuevo modelo', exact: true })).toBeVisible({ timeout: 60_000 });

  await page.goto('/content');
  await expect(page.locator('[data-records-workspace]')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Nuevo registro' }).click();
  const detail = page.getByRole('region', { name: 'Detalle del registro' });
  const firstText = detail.locator('input[type="text"]').first();
  await firstText.fill('Producto E2E');
  await detail.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText(/Registro creado|registro\(s\) cargado/i, { timeout: 60_000 });
  await expect(page.getByText('Producto E2E', { exact: true }).first()).toBeVisible();

  await detail.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByRole('status')).toContainText(/eliminado/i, { timeout: 60_000 });
  await page.getByLabel('Incluir eliminados').check();
  await expect(page.getByText('Eliminado', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
});
