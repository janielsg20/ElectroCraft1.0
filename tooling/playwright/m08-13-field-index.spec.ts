import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Índices F08');
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

test('M08.13 configura búsqueda/filtros y persiste el índice tipado desde Campo > Avanzado', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);
  await page.goto('/models');
  await page.getByRole('button', { name: 'Nuevo modelo' }).click();
  await page.getByRole('tab', { name: 'Identidad' }).click();
  await page.getByLabel('Nombre del modelo').fill('Producto indexado');
  await page.getByRole('button', { name: 'Guardar identidad' }).click();
  await expect(page.getByRole('heading', { name: 'Producto indexado', exact: true })).toBeVisible({
    timeout: 60_000,
  });

  await page.getByRole('tab', { name: 'Campos' }).click();
  await page.getByLabel('Nombre del nuevo campo').fill('Título buscable');
  await page.getByLabel('Tipo del nuevo campo').selectOption('text');
  await page.getByRole('button', { name: 'Añadir' }).click();

  const indexing = page.locator('[data-field-indexing]');
  await expect(indexing.getByText('Búsqueda y filtros', { exact: true })).toBeVisible();
  await indexing.getByLabel(/Searchable/).check();
  await indexing.getByLabel(/Filterable/).check();
  await indexing.getByLabel(/Sortable/).check();
  await indexing.getByLabel(/Faceted/).check();
  await indexing.getByRole('button', { name: 'Guardar búsqueda y filtros' }).click();
  await expect(page.locator('.ec-models-action-status')).toContainText(/índice reconstruido/i, {
    timeout: 60_000,
  });
  await expect(indexing).toContainText(/Sin registros para indexar|Índice actualizado/);

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Producto indexado', exact: true })).toBeVisible({
    timeout: 60_000,
  });
  await page.getByRole('tab', { name: 'Campos' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Título buscable' }).click();
  const reloadedIndexing = page.locator('[data-field-indexing]');
  await expect(reloadedIndexing.getByLabel(/Searchable/)).toBeChecked();
  await expect(reloadedIndexing.getByLabel(/Filterable/)).toBeChecked();
  await expect(reloadedIndexing.getByLabel(/Sortable/)).toBeChecked();
  await expect(reloadedIndexing.getByLabel(/Faceted/)).toBeChecked();
  await expect(reloadedIndexing.getByRole('button', { name: 'Reconstruir índice' })).toBeVisible();
});
