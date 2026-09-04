import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Relaciones F08');
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

test('M08.11 define y persiste una relación N:N desde Modelos', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);
  await page.goto('/models');
  const newModel = page.getByRole('button', { name: 'Nuevo modelo' });
  await expect(newModel).toBeEnabled({ timeout: 60_000 });
  await newModel.click();
  await expect(page.getByRole('heading', { name: 'Nuevo modelo', exact: true })).toBeVisible({ timeout: 60_000 });

  await page.getByRole('tab', { name: 'Relaciones' }).click();
  await expect(page.getByRole('heading', { name: 'Relaciones', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva', exact: true }).click();
  const definition = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Definición' }) });
  await expect(definition).toBeVisible({ timeout: 60_000 });
  await definition.getByLabel('Nombre').fill('Productos relacionados');
  await definition.getByLabel('Clave').fill('related-products');
  await definition.getByLabel('Tipo de relación').selectOption('many-to-many');
  await definition.getByLabel('Integridad al eliminar').selectOption('detach');
  await definition.getByLabel('Clave inversa').fill('related-from');
  await definition.getByLabel('Etiqueta inversa').fill('Relacionado desde');
  await definition.getByRole('button', { name: 'Guardar definición' }).click();
  await expect(page.locator('.ec-relation-detail').getByRole('status')).toContainText(
    'Definición de relación guardada.',
    { timeout: 60_000 },
  );
  await expect(page.getByLabel('Registro de origen')).toBeVisible();
  await expect(page.getByLabel('Registro de destino')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Nuevo modelo', exact: true })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('tab', { name: 'Relaciones' }).click();
  await expect(page.getByText('Productos relacionados', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByLabel('Tipo de relación')).toHaveValue('many-to-many');
  await expect(page.getByLabel('Integridad al eliminar')).toHaveValue('detach');
});
