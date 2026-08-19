import { expect, test } from '@playwright/test';

test.describe('M03.3 Sidebar global', () => {
  test('renders the exact grouped desktop navigation and active item', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');

    const sidebar = page.locator('.ec-app-shell-sidebar');
    expect((await sidebar.boundingBox())?.width).toBe(240);

    for (const group of ['Construir', 'Datos', 'Lógica', 'App', 'Recursos', 'Apariencia', 'Publicar']) {
      await expect(sidebar.getByRole('heading', { name: group })).toBeVisible();
    }

    const links = sidebar.getByRole('link');
    await expect(links).toHaveCount(24);
    await expect(sidebar.getByRole('link', { name: 'Editor' })).toHaveAttribute('aria-current', 'page');
    await expect(sidebar.getByText('Taxonomías', { exact: true })).toHaveCount(0);
    await expect(sidebar.getByText('Relaciones', { exact: true })).toHaveCount(0);
  });

  test('collapses 240 to 64 and keeps tooltip + keyboard access', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const sidebar = page.locator('.ec-app-shell-sidebar');
    const collapse = page.getByRole('button', { name: 'Contraer barra lateral' });
    await collapse.click();

    await expect(page.locator('.ec-app-shell')).toHaveAttribute('data-sidebar-collapsed', 'true');
    expect((await sidebar.boundingBox())?.width).toBe(64);

    const editor = sidebar.getByRole('link', { name: 'Editor' });
    await editor.focus();
    await expect(editor).toBeFocused();
    await editor.hover();
    await expect(page.getByRole('tooltip').filter({ hasText: 'Editor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Expandir barra lateral' })).toBeVisible();
  });

  test('resolves aria-current from the structural route', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/modelos');

    await expect(page.getByRole('link', { name: 'Modelos' }).first()).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Editor' }).first()).not.toHaveAttribute('aria-current', 'page');
  });

  test('keeps grouped navigation usable in the mobile Radix Sheet', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir navegación' }).click();

    const dialog = page.getByRole('dialog', { name: 'Navegación' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Construir' })).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Publicar' })).toBeVisible();

    const editor = dialog.getByRole('link', { name: 'Editor' });
    const editorBox = await editor.boundingBox();
    expect(editorBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await expect(editor).toHaveAttribute('aria-current', 'page');
  });
});
