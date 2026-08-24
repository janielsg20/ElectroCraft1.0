import { expect, test } from '@playwright/test';

async function waitForWorkspacePersistence(page: import('@playwright/test').Page) {
  await expect(page.locator('html')).toHaveAttribute('data-workspace-persistence-state', 'ready', {
    timeout: 60_000,
  });
}

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
  await waitForWorkspacePersistence(page);
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
    await waitForWorkspacePersistence(page);

    await page.reload();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'right', { timeout: 60_000 });
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-display', 'text');
    await expect(page.locator('.ec-app-shell-sidebar')).toHaveCSS('width', '318px');
  });

  test('guarda, aplica, renombra y elimina un diseño de espacio de trabajo', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const opened = await openWorkspaceSettings(page);
    await opened.workspace.getByLabel('Lado del panel lateral').click();
    await page.getByRole('option', { name: 'Derecha' }).click();
    await opened.workspace.getByPlaceholder('Nombre del diseño').fill('Diseño E2E');
    await opened.workspace.getByRole('button', { name: 'Guardar', exact: true }).click();
    await waitForWorkspacePersistence(page);

    let saved = opened.workspace.locator('[data-workspace-saved-layout]').filter({ hasText: 'Diseño E2E' });
    await expect(saved).toBeVisible();

    await opened.workspace.getByLabel('Lado del panel lateral').click();
    await page.getByRole('option', { name: 'Izquierda' }).click();
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'left');
    await waitForWorkspacePersistence(page);

    await saved.getByRole('button', { name: 'Aplicar' }).click();
    await waitForWorkspacePersistence(page);
    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-side', 'right');

    await saved.getByLabel('Nuevo nombre para Diseño E2E').fill('Diseño E2E renombrado');
    await saved.getByRole('button', { name: 'Renombrar' }).click();
    await waitForWorkspacePersistence(page);
    saved = opened.workspace.locator('[data-workspace-saved-layout]').filter({ hasText: 'Diseño E2E renombrado' });
    await expect(saved).toBeVisible();

    await saved.getByRole('button', { name: 'Eliminar' }).click();
    await waitForWorkspacePersistence(page);
    await expect(opened.workspace.locator('[data-workspace-saved-layout]')).toHaveCount(0);
  });

  test('restaura las últimas pestañas de Contexto e Inspector después de reload', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const layers = page.getByRole('tab', { name: 'Capas' });
    const design = page.getByRole('tab', { name: 'Diseño' });
    await layers.click();
    await design.click();
    await expect(layers).toHaveAttribute('aria-selected', 'true');
    await expect(design).toHaveAttribute('aria-selected', 'true');
    await waitForWorkspacePersistence(page);

    await page.reload();
    await expect(page.getByRole('tab', { name: 'Capas' })).toHaveAttribute('aria-selected', 'true', {
      timeout: 60_000,
    });
    await expect(page.getByRole('tab', { name: 'Diseño' })).toHaveAttribute('aria-selected', 'true');
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

  test('mantiene el layout móvil sin overflow con los anchos desktop máximos', async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    const { workspace } = await openWorkspaceSettings(page);
    await workspace.getByLabel('Ancho de Contexto').fill('380');
    await workspace.getByLabel('Ancho del Inspector').fill('440');
    await waitForWorkspacePersistence(page);
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
