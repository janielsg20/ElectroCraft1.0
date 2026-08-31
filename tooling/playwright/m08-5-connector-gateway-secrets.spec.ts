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

async function openIntegrations(page: Page) {
  await page.locator('[data-topbar-settings-trigger]').click();
  const sheet = page.locator('[data-topbar-settings-sheet]');
  await expect(sheet).toBeVisible();
  const integrations = sheet.locator('[data-settings-destination="integrations"]');
  await expect(integrations.getByRole('heading', { name: 'Gateway de conectores' })).toBeVisible();
  return integrations;
}

function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

test.describe.serial('M08.5 ConnectorGateway y SecretStore Settings', () => {
  test('crea SecretRef portable y mantiene el valor fail-closed sin Gateway', async ({ page }) => {
    test.setTimeout(180_000);
    await createDataProject(page, 'App Secrets F08');
    const integrations = await openIntegrations(page);

    await expect(integrations.getByText('Falta configuración', { exact: true }).first()).toBeVisible();
    await expect(integrations.getByRole('button', { name: 'Probar conexión' })).toBeDisabled();
    await expect(integrations.getByLabel('Entorno de secretos')).toContainText('Desarrollo');

    await integrations.getByLabel('Nombre').fill('Products API E2E');
    await integrations.getByLabel('Clave portable').fill('PRODUCTS_API_E2E');
    await integrations.getByRole('button', { name: 'Crear referencia' }).click();

    await expect(integrations.getByText('Products API E2E', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
    await expect(integrations.getByText(/Ref: PRODUCTS_API_E2E/)).toBeVisible();
    await expect(integrations.getByLabel('Nuevo valor')).toBeDisabled();
    await expect(integrations.getByText(/El valor almacenado no tiene operación de lectura/)).toBeVisible();

    await page.screenshot({ path: '.ai/evidence/F08/M08.5/gateway-secrets-settings-desktop.png', fullPage: true });
  });

  test('móvil conserva Settings usable y sin overflow horizontal', async ({ page }) => {
    test.setTimeout(180_000);
    await createDataProject(page, 'App Secrets móvil F08');
    await page.setViewportSize({ width: 375, height: 812 });
    const integrations = await openIntegrations(page);

    await expect(integrations.getByText('Desarrollo', { exact: true })).toBeVisible();
    await integrations.getByLabel('Entorno de secretos').click();
    await page.getByRole('option', { name: 'Producción' }).click();
    await expect(integrations.getByLabel('Entorno de secretos')).toContainText('Producción');
    expect(await hasHorizontalOverflow(page)).toBe(false);

    const sheetBox = await page.locator('[data-topbar-settings-sheet]').boundingBox();
    expect(sheetBox).not.toBeNull();
    expect(sheetBox?.width ?? 0).toBeLessThanOrEqual(375.5);
    await page.screenshot({ path: '.ai/evidence/F08/M08.5/gateway-secrets-settings-mobile.png', fullPage: true });
  });
});
