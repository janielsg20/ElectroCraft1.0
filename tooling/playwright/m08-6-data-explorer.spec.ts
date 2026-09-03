import { expect, test, type Page } from '@playwright/test';

async function createDataProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Data Explorer F08');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
}

async function createRestSource(page: Page) {
  await page.goto('/data-sources');
  await expect(page.getByRole('heading', { name: 'Fuentes de datos' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Nueva fuente', exact: true }).click();
  await page.getByRole('button', { name: 'REST API', exact: true }).click();
  await page.getByLabel('Nombre').fill('Catálogo Explorer');
  await page.getByLabel('Clave').fill('catalogExplorer');
  await page.getByLabel('URL base').fill('https://api.example.test');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Origen de operaciones REST').click();
  await page.getByRole('option', { name: 'Configurar manualmente' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Ruta').fill('/products');
  await page.getByLabel('Nombre').fill('Listar productos');
  await page.getByRole('button', { name: 'Añadir operación' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Probar solicitud' }).click();
  await expect(page.getByText('Prueba completada mediante el adapter REST real.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Guardar fuente' }).click();
  await expect(page.getByRole('option', { name: /Catálogo Explorer/ })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('option', { name: /Catálogo Explorer/ }).click();
}

test('M08.6 ejecuta una lectura, sanitiza la traza y crea un borrador de consulta', async ({ page }) => {
  test.setTimeout(180_000);
  await createDataProject(page);
  await page.route('https://api.example.test/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ items: [{ id: 'p-1', name: 'Cable Explorer', token: 'never-visible' }] }),
    });
  });
  await createRestSource(page);

  await page.getByRole('button', { name: 'Explorar' }).click();
  await expect(page.getByRole('heading', { name: 'Explorar' })).toBeVisible();
  await expect(page.locator('[data-help-trigger="help.data.explorer"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Listar productos', exact: true })).toBeVisible();
  await expect(page.getByText('Sin ejecutar')).toBeVisible();
  await page.getByRole('button', { name: 'Ejecutar' }).click();

  await expect(page.locator('.ec-data-explorer-table-scroll td').filter({ hasText: 'Cable Explorer' })).toBeVisible();
  await expect(page.getByText('Operación ejecutada correctamente.')).toBeVisible();
  await page.getByText('Avanzado · traza sanitizada').click();
  const trace = page.locator('.ec-data-explorer-result pre');
  await expect(trace).toContainText('[REDACTADO]');
  await expect(trace).not.toContainText('never-visible');
  await page.screenshot({ path: '.ai/evidence/F08/M08.6/data-explorer-desktop.png', fullPage: true });

  await page.getByRole('button', { name: 'Crear consulta desde esta operación' }).click();
  await expect(page.getByText(/creada como borrador/)).toBeVisible();
});
