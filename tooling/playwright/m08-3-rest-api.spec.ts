import { expect, test, type Page } from '@playwright/test';

async function createDataProject(page: Page, name: string) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Nombre del proyecto').fill(name);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByRole('heading', { name: /Diseño/ })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
}

function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

async function openRestWizard(page: Page) {
  await page.goto('/data-sources');
  await expect(page.getByRole('heading', { name: 'Fuentes de datos' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Nueva fuente', exact: true }).click();
  await page.getByRole('button', { name: 'REST API', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'REST API' })).toBeVisible();
  await expect(page.locator('[data-help-trigger="help.data.rest"]')).toBeVisible();
  await expect(page.getByLabel('Pasos de configuración REST')).toBeVisible();
}

test.describe.serial('M08.3 REST API Connector y OpenAPI UX', () => {
  test('crea, prueba y guarda una fuente REST manual usando el adapter real', async ({ page }) => {
    test.setTimeout(180_000);
    await createDataProject(page, 'App datos REST F08');

    await page.route('https://api.example.test/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ items: [{ id: 'p-1', name: 'Cable USB-C' }] }),
      });
    });

    await openRestWizard(page);
    await expect(page.getByRole('heading', { name: 'Endpoint base' })).toBeVisible();
    await page.getByLabel('Nombre').fill('Catálogo E2E');
    await page.getByLabel('Clave').fill('catalogE2E');
    await page.getByLabel('URL base').fill('https://api.example.test');
    await expect(page.getByLabel('Modo de ejecución REST')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Autenticación' })).toBeVisible();
    await expect(page.getByLabel('Autenticación REST')).toContainText('Sin autenticación');
    await expect(page.getByText('Las credenciales nunca se guardan en el proyecto.')).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'OpenAPI / Manual' })).toBeVisible();
    await page.getByLabel('Origen de operaciones REST').click();
    await page.getByRole('option', { name: 'Configurar manualmente' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Operaciones' })).toBeVisible();
    await expect(page.getByLabel('Método REST')).toContainText('GET');
    await page.getByLabel('Ruta').fill('/products');
    await page.getByLabel('Nombre').fill('Listar productos');
    await page.getByRole('button', { name: 'Añadir operación' }).click();
    await expect(page.getByText('Listar productos', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Probar solicitud' })).toBeVisible();
    await expect(page.getByLabel('Operación REST de prueba')).toContainText('GET · Listar productos');
    await page.getByRole('button', { name: 'Probar solicitud' }).click();
    await expect(
      page
        .locator('.ec-rest-source-sheet')
        .getByText('Prueba completada mediante el adapter REST real.', { exact: true }),
    ).toBeVisible();
    await expect(page.locator('.ec-rest-test-result')).toContainText('Cable USB-C');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Guardar fuente' })).toBeVisible();
    await expect(page.getByText('Sin secreto persistido')).toBeVisible();
    await page.screenshot({ path: '.ai/evidence/F08/M08.3/rest-wizard-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Guardar fuente' }).click();

    await expect(page.getByRole('heading', { name: 'REST API' })).toBeHidden();
    await expect(page.getByRole('option', { name: /Catálogo E2E/ })).toBeVisible({ timeout: 60_000 });
    await page.getByRole('option', { name: /Catálogo E2E/ }).click();
    await expect(page.getByText('rest.fetch', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Registrado', { exact: true }).first()).toBeVisible();
  });

  test('móvil usa wizard full-screen, ayuda tipada y no introduce overflow horizontal', async ({ page }) => {
    test.setTimeout(180_000);
    await createDataProject(page, 'App datos REST móvil F08');
    await page.setViewportSize({ width: 375, height: 812 });
    await openRestWizard(page);

    expect(await hasHorizontalOverflow(page)).toBe(false);
    await expect(page.getByRole('heading', { name: 'Endpoint base' })).toBeVisible();
    await expect(page.locator('[data-help-trigger="help.data.rest"]')).toBeVisible();
    await expect(page.getByLabel('Modo de ejecución REST')).toBeVisible();

    const sheetBox = await page.locator('.ec-rest-source-sheet').boundingBox();
    expect(sheetBox).not.toBeNull();
    expect(sheetBox?.width ?? 0).toBeLessThanOrEqual(375.5);
    expect(sheetBox?.height ?? 0).toBeLessThanOrEqual(812);
    await page.screenshot({ path: '.ai/evidence/F08/M08.3/rest-wizard-mobile.png', fullPage: true });
  });
});
