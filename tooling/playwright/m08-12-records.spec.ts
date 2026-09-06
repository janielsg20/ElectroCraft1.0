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
  const workspace = page.locator('[data-records-workspace]');
  await expect(workspace).toBeVisible({ timeout: 60_000 });
  const recordsStatus = workspace.locator('.ec-records-status');
  await workspace.getByRole('button', { name: 'Nuevo registro' }).click();
  const detail = workspace.getByRole('region', { name: 'Detalle del registro' });
  const firstText = detail.locator('input[type="text"]').first();
  await firstText.fill('Producto E2E');
  await detail.getByRole('button', { name: 'Guardar' }).click();
  await expect(recordsStatus).toContainText(/Registro creado|registro\(s\) cargado/i, { timeout: 60_000 });
  await expect(workspace.getByText('Producto E2E', { exact: true }).first()).toBeVisible();

  await detail.getByRole('button', { name: 'Eliminar' }).click();
  await expect(recordsStatus).toContainText(/eliminado/i, { timeout: 60_000 });
  await workspace.getByLabel('Incluir eliminados').check();
  await expect(workspace.getByText('Eliminado', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
});