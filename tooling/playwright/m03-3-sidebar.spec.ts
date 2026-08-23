import { expect, test } from '@playwright/test';

const groupLabels = ['Construir', 'Datos', 'Lógica', 'App', 'Recursos', 'Apariencia', 'Publicar'] as const;

test.describe('M03.3 Sidebar global', () => {
  test('renders exact groups, active item and 256 to 64 collapse on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/editor');

    const shell = page.locator('.ec-app-shell');
    const sidebar = page.locator('.ec-app-shell-sidebar');
    const editor = page.getByRole('link', { name: 'Editor' });

    for (const group of groupLabels) await expect(page.getByText(group, { exact: true })).toBeVisible();
    await expect(editor).toHaveAttribute('aria-current', 'page');
    expect((await sidebar.boundingBox())?.width).toBe(256);

    await page.getByRole('button', { name: 'Contraer barra lateral' }).click();
    await expect(shell).toHaveAttribute('data-sidebar-collapsed', 'true');
    expect((await sidebar.boundingBox())?.width).toBe(64);
    await expect(editor).toBeVisible();

    await editor.focus();
    await expect(page.getByRole('tooltip').filter({ hasText: 'Editor' })).toBeVisible();

    await page.getByRole('button', { name: 'Expandir barra lateral' }).click();
    await expect(shell).toHaveAttribute('data-sidebar-collapsed', 'false');
    expect((await sidebar.boundingBox())?.width).toBe(256);
  });

  test('tracks the active destination through pathname semantics', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/screens');

    await expect(page.getByRole('link', { name: 'Pantallas' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Editor' })).not.toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('Taxonomías', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Relaciones', { exact: true })).toHaveCount(0);
  });

  test('keeps the grouped Sidebar accessible in the mobile Radix Sheet', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/editor');

    await page.getByRole('button', { name: 'Abrir navegación' }).click();
    const dialog = page.getByRole('dialog', { name: 'Navegación' });
    await expect(dialog).toBeVisible();

    for (const group of groupLabels) await expect(dialog.getByText(group, { exact: true })).toBeVisible();
    const editor = dialog.getByRole('link', { name: 'Editor' });
    const editorBox = await editor.boundingBox();
    expect(editorBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await expect(editor).toHaveAttribute('aria-current', 'page');
  });
});
