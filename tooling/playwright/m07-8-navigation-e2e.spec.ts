import { expect, test, type Page } from '@playwright/test';

async function createNavigationProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Nombre del proyecto').fill('App navegación F07');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page.getByRole('heading', { name: /Diseño/ })).toBeVisible();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
}

async function createScreen(page: Page, name: string, path: string) {
  await page.goto('/screens');
  await expect(page.getByRole('heading', { name: 'Pantallas' })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Nueva pantalla' }).click();
  await expect(page.getByRole('heading', { name: 'Nueva pantalla' })).toBeVisible();
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Ruta').fill(path);
  await page.getByRole('button', { name: 'Crear y abrir' }).click();
  await expect(page).toHaveURL(/\/editor\?screen=/, { timeout: 60_000 });
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByLabel('Pantalla', { exact: true })).toContainText(name);
}

function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

test.describe.serial('M07.8 Navigation E2E y UX', () => {
  test('create, edit, navigation builder, Preview y delete blocker funcionan como una experiencia', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await createNavigationProject(page);

    await createScreen(page, 'Productos', '/productos');
    await createScreen(page, 'Detalle', '/detalle');
    await createScreen(page, 'Acceso', '/acceso');

    await page.goto('/screens');
    await expect(page.getByRole('heading', { name: 'Pantallas' })).toBeVisible({ timeout: 60_000 });
    const screenOptions = page.getByRole('option');
    await expect(screenOptions).toHaveCount(4, { timeout: 60_000 });
    await page.getByRole('option', { name: /Detalle/ }).click();
    await expect(page.getByText('Esta Pantalla está en uso.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
    await expect(page.locator('[data-help-trigger="help.screens"]')).toBeVisible();
    await page.screenshot({ path: '.ai/evidence/F07/M07.8/screens-desktop.png', fullPage: true });

    await page.getByRole('button', { name: 'Abrir en Editor' }).click();
    await expect(page).toHaveURL(/\/editor\?screen=/, { timeout: 60_000 });
    await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByLabel('Pantalla', { exact: true })).toContainText('Detalle');
    await page.getByRole('tab', { name: 'Pantallas' }).click();
    await expect(page.locator('[data-editor-screen-context]')).toBeVisible();
    await expect(page.locator('[data-help-trigger="help.editor.screens"]')).toBeVisible();
    await page.screenshot({ path: '.ai/evidence/F07/M07.8/editor-screen-desktop.png', fullPage: true });

    await page.goto('/navigation');
    await expect(page.getByRole('heading', { name: 'Navegación' })).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-navigation-builder]')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('[data-help-trigger="help.navigation.builder"]')).toBeVisible();

    const typeSelect = page.getByLabel('Tipo de navegador');
    await typeSelect.click();
    await page.getByRole('option', { name: 'Pestañas' }).click();
    await page.getByLabel('Nombre del navegador').fill('Principal');
    await page.getByRole('button', { name: 'Agregar navegador' }).click();
    await expect(page.getByText('Principal', { exact: true }).first()).toBeVisible({ timeout: 60_000 });

    await typeSelect.click();
    await page.getByRole('option', { name: 'Modal' }).click();
    await page.getByLabel('Nombre del navegador').fill('Acceso modal');
    await page.getByRole('button', { name: 'Agregar navegador' }).click();
    await expect(page.getByText('Acceso modal', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
    await page.screenshot({ path: '.ai/evidence/F07/M07.8/navigation-builder-desktop.png', fullPage: true });

    await page.goto('/preview');
    await expect(page.locator('[data-navigation-preview]')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
    await expect(page.getByLabel('Ruta del Preview')).toBeVisible();
    await expect(page.getByText(/Ruta pública|Acceso permitido/)).toBeVisible();
    await page.screenshot({ path: '.ai/evidence/F07/M07.8/preview-desktop.png', fullPage: true });
  });

  test('tablet y móvil mantienen flujo, teclado, ayuda y ausencia de overflow horizontal', async ({ page }) => {
    test.setTimeout(180_000);
    await createNavigationProject(page);
    await createScreen(page, 'Productos', '/productos');

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/navigation');
    await expect(page.locator('[data-navigation-builder]')).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole('button', { name: 'Propiedades' })).toBeVisible();
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await page.getByRole('button', { name: 'Propiedades' }).click();
    await expect(page.getByRole('heading', { name: 'Propiedades de Navegación' })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/screens');
    await expect(page.getByRole('heading', { name: 'Pantallas' })).toBeVisible({ timeout: 60_000 });
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await page.getByRole('option', { name: /Productos/ }).click();
    await expect(page.getByRole('button', { name: '← Pantallas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Eliminar' })).toBeDisabled();
    await page.screenshot({ path: '.ai/evidence/F07/M07.8/screens-mobile.png', fullPage: true });

    await page.goto('/editor');
    await expect(page.locator('[data-editor-responsive-mode="mobile"]')).toBeVisible({ timeout: 60_000 });
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await page
      .getByRole('button', { name: /Pantallas/ })
      .first()
      .click();
    await expect(page.locator('[data-editor-screen-context]')).toBeVisible();
    await expect(page.locator('[data-help-trigger="help.editor.screens"]')).toBeVisible();

    await page.goto('/preview');
    await expect(page.locator('[data-navigation-preview]')).toBeVisible({ timeout: 60_000 });
    expect(await hasHorizontalOverflow(page)).toBe(false);
    await expect(page.getByLabel('Ruta del Preview')).toBeVisible();
    await page.screenshot({ path: '.ai/evidence/F07/M07.8/preview-mobile.png', fullPage: true });
  });
});
