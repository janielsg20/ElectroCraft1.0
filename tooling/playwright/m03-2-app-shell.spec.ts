import { expect, test } from '@playwright/test';

test.describe('M03.2 AppShell', () => {
  test('reserves exact desktop geometry and keeps scrolling inside the workspace', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');

    const shell = page.locator('.ec-app-shell');
    const sidebar = page.locator('.ec-app-shell-sidebar');
    const topbar = page.locator('.ec-app-shell-topbar');
    const workspace = page.locator('.ec-app-shell-workspace');
    const statusbar = page.locator('.ec-app-shell-statusbar');

    await expect(shell).toBeVisible();
    await expect(page.locator('[data-help-id="help.studio.shell"]')).toBeVisible();
    await expect(page.getByText('Editor', { exact: true })).toBeVisible();
    await expect(page.getByText('Configuración', { exact: true })).toBeVisible();

    const [sidebarBox, topbarBox, statusbarBox, workspaceBox] = await Promise.all([
      sidebar.boundingBox(),
      topbar.boundingBox(),
      statusbar.boundingBox(),
      workspace.boundingBox(),
    ]);

    expect(sidebarBox?.width).toBe(240);
    expect(topbarBox?.height).toBe(52);
    expect(statusbarBox?.height).toBe(26);
    expect(workspaceBox?.width ?? 0).toBeGreaterThan(0);

    const metrics = await page.evaluate(() => ({
      bodyOverflow: getComputedStyle(document.body).overflow,
      bodyScrollHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight,
      rootHeight: document.querySelector('.ec-app-shell')?.getBoundingClientRect().height ?? 0,
    }));

    expect(metrics.bodyOverflow).toBe('hidden');
    expect(metrics.bodyScrollHeight).toBeLessThanOrEqual(metrics.viewportHeight);
    expect(metrics.rootHeight).toBe(1000);
  });

  test('collapses only the reserved rail on laptop without shrinking the workspace', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto('/');

    const sidebarBox = await page.locator('.ec-app-shell-sidebar').boundingBox();
    const workspaceBox = await page.locator('.ec-app-shell-workspace').boundingBox();

    expect(sidebarBox?.width).toBe(64);
    expect(workspaceBox?.width ?? 0).toBeGreaterThan(1000);
    await expect(page.locator('.ec-app-shell-menu-trigger')).toBeHidden();
  });

  test('moves structural navigation to a keyboard-accessible Radix Sheet on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/');

    await expect(page.locator('.ec-app-shell-sidebar')).toBeHidden();
    const menuButton = page.getByRole('button', { name: 'Abrir navegación' });
    await expect(menuButton).toBeVisible();

    await menuButton.focus();
    await expect(menuButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Navegación' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Navegación' }).getByText('Editor', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Navegación' })).toHaveCount(0);
    await expect(menuButton).toBeFocused();
  });

  test('keeps mobile touch targets and avoids horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: 'Abrir navegación' });
    const menuBox = await menuButton.boundingBox();
    expect(menuBox?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(menuBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      workspaceWidth: document.querySelector('.ec-app-shell-workspace')?.getBoundingClientRect().width ?? 0,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.workspaceWidth).toBeLessThanOrEqual(metrics.clientWidth);
  });
});
