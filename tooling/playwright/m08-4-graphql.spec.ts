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

async function openGraphQLWizard(page: Page) {
  await page.goto('/data-sources');
  await expect(page.getByRole('heading', { name: 'Fuentes de datos' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Nueva fuente', exact: true }).click();
  await page.getByRole('button', { name: 'GraphQL', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'GraphQL' })).toBeVisible();
  await expect(page.locator('[data-help-trigger="help.data.graphql"]')).toBeVisible();
  await expect(page.getByLabel('Pasos de configuración GraphQL')).toBeVisible();
}

function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

const introspectionResponse = {
  data: {
    __schema: {
      queryType: { name: 'Query' },
      mutationType: { name: 'Mutation' },
      types: [
        {
          kind: 'OBJECT',
          name: 'Query',
          fields: [
            {
              name: 'products',
              args: [],
              type: { kind: 'LIST', name: null, ofType: { kind: 'OBJECT', name: 'Product', ofType: null } },
            },
          ],
        },
        {
          kind: 'OBJECT',
          name: 'Mutation',
          fields: [],
        },
        {
          kind: 'OBJECT',
          name: 'Product',
          fields: [
            { name: 'id', args: [], type: { kind: 'SCALAR', name: 'ID', ofType: null } },
            { name: 'name', args: [], type: { kind: 'SCALAR', name: 'String', ofType: null } },
          ],
        },
      ],
    },
  },
};

test.describe.serial('M08.4 GraphQL Connector UX', () => {
  test('inspecciona, prueba y guarda una fuente GraphQL real', async ({ page }) => {
    test.setTimeout(180_000);
    await createDataProject(page, 'App GraphQL F08');

    await page.route('https://api.example.test/graphql', async (route) => {
      const payload = route.request().postDataJSON() as { query?: string };
      const body = payload.query?.includes('ElectroCraftIntrospection')
        ? introspectionResponse
        : { data: { products: [{ id: 'p-1', name: 'Cable GraphQL' }] } };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    await openGraphQLWizard(page);
    await expect(page.getByRole('heading', { name: 'Endpoint' })).toBeVisible();
    await page.getByLabel('Nombre').fill('Catálogo GraphQL E2E');
    await page.getByLabel('Clave').fill('catalogGraphQL');
    await page.getByLabel('Endpoint').fill('https://api.example.test/graphql');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Autenticación' })).toBeVisible();
    await expect(page.getByLabel('Autenticación GraphQL')).toContainText('Sin autenticación');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Esquema' })).toBeVisible();
    await page.getByRole('button', { name: 'Inspeccionar esquema' }).click();
    await expect(page.getByText(/operación\(es\) detectadas por introspection/)).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Consultas / Mutaciones' })).toBeVisible();
    await expect(page.getByText('products', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Advanced' })).toBeVisible();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Probar' })).toBeVisible();
    await expect(page.getByLabel('Operación GraphQL de prueba')).toContainText('Productos');
    await page.getByRole('button', { name: 'Probar', exact: true }).click();
    await expect(page.getByText('Prueba completada mediante GraphQLDataSourceAdapter.', { exact: true })).toBeVisible();
    await expect(page.locator('.ec-rest-test-result')).toContainText('Cable GraphQL');
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page.getByRole('heading', { name: 'Guardar' })).toBeVisible();
    await expect(page.getByText('Sin secreto persistido')).toBeVisible();
    await page.screenshot({ path: '.ai/evidence/F08/M08.4/graphql-wizard-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Guardar fuente' }).click();

    await expect(page.getByRole('option', { name: /Catálogo GraphQL E2E/ })).toBeVisible({ timeout: 60_000 });
    await page.getByRole('option', { name: /Catálogo GraphQL E2E/ }).click();
    await expect(page.getByText('graphql.fetch', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Registrado', { exact: true }).first()).toBeVisible();
  });

  test('móvil mantiene el wizard GraphQL full-screen sin overflow', async ({ page }) => {
    test.setTimeout(180_000);
    await createDataProject(page, 'App GraphQL móvil F08');
    await page.setViewportSize({ width: 375, height: 812 });
    await openGraphQLWizard(page);
    expect(await hasHorizontalOverflow(page)).toBe(false);
    const sheetBox = await page.locator('[data-graphql-source-wizard]').boundingBox();
    expect(sheetBox).not.toBeNull();
    expect(sheetBox?.width ?? 0).toBeLessThanOrEqual(375.5);
    expect(sheetBox?.height ?? 0).toBeLessThanOrEqual(812);
    await page.screenshot({ path: '.ai/evidence/F08/M08.4/graphql-wizard-mobile.png', fullPage: true });
  });
});
