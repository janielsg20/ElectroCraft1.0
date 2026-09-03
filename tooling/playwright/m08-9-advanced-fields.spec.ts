import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Campos Avanzados F08');
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

async function addField(page: Page, label: string, type: string) {
  await page.getByLabel('Nombre del nuevo campo').fill(label);
  await page.getByLabel('Tipo del nuevo campo').selectOption(type);
  await page.getByRole('button', { name: 'Añadir' }).click();
  await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible({ timeout: 60_000 });
}

test('M08.9 configura campos anidados, calculados y condicionales en Modelos', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);
  await page.goto('/models');
  await page.getByRole('button', { name: 'Nuevo modelo' }).click();
  await page.getByRole('tab', { name: 'Campos' }).click();

  await addField(page, 'Dirección', 'group');
  await expect(page.getByText('Los campos hijos se guardan como objeto JSON anidado.')).toBeVisible();

  await addField(page, 'Calle', 'text');
  await page.getByLabel('Dentro de').selectOption({ label: 'Dirección · Grupo' });
  await page.getByRole('button', { name: 'Guardar estructura' }).click();
  await expect(
    page.getByText('Configuración avanzada guardada. Dependencias y ciclos fueron validados.'),
  ).toBeVisible();
  await expect(page.locator('.ec-field-row[data-depth="1"]').filter({ hasText: 'Calle' })).toBeVisible();

  await addField(page, 'Líneas', 'repeater');
  await page.getByLabel('Máximo de elementos').fill('5');
  await page.getByRole('button', { name: 'Guardar estructura' }).click();
  await expect(page.getByText('Cada elemento del Repeater valida sus hijos de forma independiente.')).toBeVisible();

  await addField(page, 'Total', 'calculated');
  await page.getByLabel('Operación segura').selectOption('coalesce');
  await page.getByLabel('Dependencia 1').selectOption({ label: 'Nombre' });
  await page.getByRole('button', { name: 'Guardar estructura' }).click();
  await expect(
    page.getByText('Solo se ejecutan operaciones registradas; nunca se evalúa código del usuario.'),
  ).toBeVisible();

  await addField(page, 'Nota', 'conditional');
  await page.getByLabel('Depende de').selectOption({ label: 'Nombre' });
  await page.getByLabel('Operador').selectOption('not-empty');
  await page.getByRole('button', { name: 'Guardar estructura' }).click();
  await expect(page.getByText('La condición usa un AST tipado y se interpreta sin `eval`.')).toBeVisible();

  await page.getByRole('button', { name: 'Subir' }).click();
  await expect(page.getByText('Orden de campos actualizado.')).toBeVisible({ timeout: 60_000 });
  await page.screenshot({ path: '.ai/evidence/F08/M08.9/advanced-fields-desktop.png', fullPage: true });

  await page.reload();
  await page.getByRole('tab', { name: 'Campos' }).click();
  for (const label of ['Dirección', 'Calle', 'Líneas', 'Total', 'Nota']) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 60_000 });
  }
});
