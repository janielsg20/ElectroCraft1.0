import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Taxonomías F08');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
}

async function createInternalSource(page: Page) {
  await page.goto('/data-sources');
  const createInternal = page.getByRole('button', { name: 'Crear ElectroCraft Data' });
  if (await createInternal.isVisible()) {
    await createInternal.click();
    await expect(page.getByText('ElectroCraft Data creada.')).toBeVisible({ timeout: 60_000 });
  }
}

test('M08.10 define taxonomías y persiste términos jerárquicos desde Modelos', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);
  await page.goto('/models');
  await page.getByRole('button', { name: 'Nuevo modelo' }).click();
  await page.getByRole('tab', { name: 'Taxonomías' }).click();
  await page.getByRole('button', { name: 'Nueva', exact: true }).click();

  const definition = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Definición' }) });
  await definition.getByLabel('Nombre').fill('Categorías');
  await definition.getByLabel('Clave').fill('categories');
  await definition.getByLabel('Singular').fill('Categoría');
  await definition.getByLabel('Plural').fill('Categorías');
  await definition.getByRole('button', { name: 'Guardar definición' }).click();
  await expect(page.getByRole('status')).toContainText('Definición de taxonomía guardada.', { timeout: 60_000 });

  const manager = page.locator('#taxonomy-terms');
  await manager.getByLabel('Nombre').fill('Electrónica');
  await manager.getByLabel('Slug').fill('electronica');
  await manager.getByRole('button', { name: 'Crear término' }).click();
  await expect(manager.getByText('Electrónica', { exact: true })).toBeVisible({ timeout: 60_000 });

  await manager.getByRole('button', { name: 'Nuevo término' }).click();
  await manager.getByLabel('Nombre').fill('Teléfonos');
  await manager.getByLabel('Slug').fill('telefonos');
  await manager.getByRole('combobox', { name: 'Término padre' }).click();
  await page.getByRole('option', { name: 'Electrónica' }).click();
  await manager.getByRole('button', { name: 'Crear término' }).click();
  await expect(manager.getByText('Teléfonos', { exact: true })).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: '.ai/evidence/F08/M08.10/taxonomies-desktop.png', fullPage: true });

  await page.reload();
  await page.getByRole('tab', { name: 'Taxonomías' }).click();
  await expect(page.getByText('Categorías', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#taxonomy-terms').getByText('Teléfonos', { exact: true })).toBeVisible({
    timeout: 60_000,
  });
});
