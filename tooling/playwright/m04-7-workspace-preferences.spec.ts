import { expect, test } from '@playwright/test';

async function openWorkspaceSettings(page: import('@playwright/test').Page) {
  const settings = page.getByRole('button', { name: 'Configuración' });
  await expect(settings).toBeEnabled({ timeout: 60_000 });
  await settings.click();
  const dialog = page.getByRole('dialog', { name: 'Configuración' });
  await expect(dialog).toBeVisible();
  const workspace = dialog.locator('[data-workspace-settings]');
  await expect(workspace.getByRole('heading', { name: 'Espacio de trabajo' })).toBeVisible();
  return { dialog, workspace };
}

async function selectSidebarSide(page: import('@playwright/test').Page, side: 'Izquierda' | 'Derecha') {
  const { workspace } = await openWorkspaceSettings(page);
  await workspace.getByLabel('Lado del panel lateral').click();
  await page.getByRole('option', { name: side }).click();
  await expect(page.locator('.ec-app-shell')).toHaveAttribute(
    'data-sidebar-side',
    side === 'Derecha' ? 'right' : 'left',
  );
  await page.keyboard.press('Escape');
}

test.describe('M04.7 Workspace preferences', () => {
  test('persiste lado, ancho y presentación del Sidebar después de reload', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const { workspace } = await openWorkspaceSettings(page);
    await workspace.getByLabel('Lado del panel lateral').click();
    await page.getByRole('option', { name: 'Derecha' }).click();

    await workspace.getByLabel('Contenido del panel lateral').click();
    await page.getByRole('option', { name: 'Solo texto' }).click();

    const width = workspace.getByLabel('Ancho del panel');
    await width.fill('318');
    await width.blur();

    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'right');
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-display', 'text');
    await expect(page.locator('.ec-app-shell-sidebar')).toHaveCSS('width', '318px');

    await page.reload();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'right', { timeout: 60_000 });
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-display', 'text');
    await expect(page.locator('.ec-app-shell-sidebar')).toHaveCSS('width', '318px');
  });

  test('guarda, aplica, renombra y elimina un diseño de espacio de trabajo', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    let opened = await openWorkspaceSettings(page);
    await opened.workspace.getByLabel('Lado del panel lateral').click();
    await page.getByRole('option', { name: 'Derecha' }).click();
    await opened.workspace.getByLabel('Nombre del diseño').fill('Diseño E2E');
    await opened.workspace.getByRole('button', { name: 'Guardar', exact: true }).click();

    let saved = opened.workspace.locator('[data-workspace-saved-layout]').filter({ hasText: 'Diseño E2E' });
    await expect(saved).toBeVisible();

    await opened.workspace.getByLabel('Lado del panel lateral').click();
    await page.getByRole('option', { name: 'Izquierda' }).click();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'left');

    await saved.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'right');

    await saved.getByLabel('Nuevo nombre para Diseño E2E').fill('Diseño E2E renombrado');
    await saved.getByRole('button', { name: 'Renombrar' }).click();
    saved = opened.workspace.locator('[data-workspace-saved-layout]').filter({ hasText: 'Diseño E2E renombrado' });
    await expect(saved).toBeVisible();

    await saved.getByRole('button', { name: 'Eliminar' }).click();
    await expect(opened.workspace.locator('[data-workspace-saved-layout]')).toHaveCount(0);
  });

  test('sincroniza una preferencia entre dos pestañas de la misma base local', async ({ page, context }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    const second = await context.newPage();
    await second.setViewportSize({ width: 1440, height: 900 });
    await second.goto('/editor');
    await expect(second.getByRole('button', { name: 'Configuración' })).toBeEnabled({ timeout: 60_000 });

    await selectSidebarSide(page, 'Derecha');
    await expect(second.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'right', { timeout: 60_000 });

    await selectSidebarSide(second, 'Izquierda');
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'left', { timeout: 60_000 });
  });

  test('mantiene el layout móvil sin overflow aunque existan anchos desktop grandes', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    const { workspace } = await openWorkspaceSettings(page);
    await workspace.getByLabel('Ancho de Contexto').fill('420');
    await workspace.getByLabel('Ancho del Inspector').fill('460');
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 360, height: 800 });
    await expect(page.locator('[data-editor-responsive-mode="mobile"]')).toBeVisible();
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
