import { expect, test } from '@playwright/test';

test.describe('M03.8 discoverable Palette', () => {
  test('renders search and the exact high-density catalog on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const palette = page.locator('[data-studio-palette]').first();
    await expect(palette).toBeVisible();
    await expect(palette.getByRole('searchbox', { name: 'Buscar componentes' })).toBeVisible();
    await expect(palette.getByRole('heading', { name: 'Layout' })).toBeVisible();
    await expect(palette.getByRole('heading', { name: 'Basic' })).toBeVisible();
    await expect(palette.getByRole('heading', { name: 'Commerce Pack' })).toBeVisible();

    const grid = palette.locator('[data-palette-grid]').first();
    await expect(grid).toBeVisible();
    const columns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(2);

    const overflow = await palette.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    expect(overflow).toBe(false);
  });

  test.each([
    ['posts', 'palette.dynamic.listing'],
    ['menu', 'palette.navigation.navigation'],
    ['login', 'palette.navigation.login'],
    ['JetEngine', 'palette.dynamic.field'],
    ['social', 'palette.social.icons'],
    ['commerce', 'palette.commerce.product-card'],
  ])('discovers %s by conceptual search', async ({ page }, query, expectedId) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const palette = page.locator('[data-studio-palette]').first();
    const search = palette.getByRole('searchbox', { name: 'Buscar componentes' });
    await search.fill(query);
    await expect(palette.locator(`[data-palette-item="${expectedId}"]`).first()).toBeVisible();
  });

  test('persists favorites and recent by palette item id', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const palette = page.locator('[data-studio-palette]').first();
    const text = palette.locator('[data-palette-item="palette.basic.text"]').first();
    await text.getByRole('button', { name: 'Añadir a favoritos' }).click();
    await text.getByRole('button', { name: /Insertar: Texto/ }).click();

    await expect(palette.locator('[data-palette-diagnostic="PALETTE_COMPONENT_UNAVAILABLE"]')).toBeVisible();
    const stored = await page.evaluate(() => window.localStorage.getItem('electrocraft.workspace.palette.v1'));
    expect(stored).toContain('palette.basic.text');
    expect(stored).not.toContain('ComponentDefinition');

    await page.reload();
    const reloaded = page.locator('[data-studio-palette]').first();
    await expect(reloaded.getByRole('heading', { name: 'Favoritos' })).toBeVisible();
    await expect(reloaded.getByRole('heading', { name: 'Recientes' })).toBeVisible();
    await expect(
      reloaded.locator('[aria-label="Favoritos"]').locator('[data-palette-item="palette.basic.text"]').first(),
    ).toBeVisible();
  });

  test('shows actionable diagnostics instead of silent success for a pending Block mapping', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const palette = page.locator('[data-studio-palette]').first();
    const search = palette.getByRole('searchbox', { name: 'Buscar componentes' });
    await search.fill('Tarjeta de producto');
    await palette
      .locator('[data-palette-item="palette.commerce.product-card"]')
      .first()
      .getByRole('button', { name: /Insertar: Tarjeta de producto/ })
      .click();

    const diagnostic = palette.locator('[data-palette-diagnostic="PALETTE_MAPPING_PENDING"]');
    await expect(diagnostic).toBeVisible();
    await expect(diagnostic.getByText('Ubicación', { exact: true })).toBeVisible();
    await expect(diagnostic.getByText('Causa', { exact: true })).toBeVisible();
    await expect(diagnostic.getByText('Acción sugerida', { exact: true })).toBeVisible();
  });

  test('moves focus from search into items and Escape back to canvas', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const palette = page.locator('[data-studio-palette]').first();
    const search = palette.getByRole('searchbox', { name: 'Buscar componentes' });
    await search.focus();
    await page.keyboard.press('ArrowDown');
    await expect(palette.locator('.ec-palette-item-main').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-editor-canvas-stage]')).toBeFocused();
  });

  test('uses the mobile Componentes bottom sheet without desktop compression', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.locator('[data-mobile-destination="components"]').click();

    const sheet = page.locator('[data-editor-mobile-sheet="components"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-sheet-side', 'bottom');
    const palette = sheet.locator('[data-studio-palette]');
    await expect(palette).toBeVisible();
    await palette.getByRole('searchbox', { name: 'Buscar componentes' }).fill('login');
    await expect(palette.locator('[data-palette-item="palette.navigation.login"]').first()).toBeVisible();

    const grid = palette.locator('[data-palette-grid]').first();
    const columns = await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBeGreaterThanOrEqual(1);
    const overflow = await sheet.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    expect(overflow).toBe(false);
  });
});
