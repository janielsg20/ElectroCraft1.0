import { expect, test, type Page } from '@playwright/test';

async function resetAppearance(page: Page) {
  await page.goto('/editor');
  await page.evaluate(() => {
    window.localStorage.removeItem('electrocraft.studio.appearance.v1');
    window.localStorage.removeItem('electrocraft.studio.appearance-presets.v1');
  });
  await page.reload();
}

async function openDesktopAppearance(page: Page) {
  await page.locator('[data-appearance-trigger="topbar"]').first().click();
  const sheet = page.locator('[data-appearance-sheet="topbar"]').last();
  await expect(sheet).toBeVisible();
  return sheet;
}

const marketLayouts = [
  ['market:studio-carbon', 'ide'],
  ['market:canvas-atelier', 'canvas'],
  ['market:cms-editorial', 'cms'],
  ['market:commerce-desk', 'commerce'],
  ['market:data-command', 'data'],
  ['market:linear-neutral', 'minimal'],
  ['market:aurora-glass', 'glass'],
  ['market:neo-builder', 'brutal'],
  ['market:soft-graphite', 'soft'],
  ['market:zen-canvas', 'zen'],
] as const;

test.describe('UI/UX style gallery', () => {
  test('shows ten product designs and filters them by product family', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    const gallery = sheet.locator('[data-market-style-gallery]');
    await expect(gallery.locator('[data-market-preset]')).toHaveCount(10);

    await sheet.locator('[data-market-family-filter="Builder"]').click();
    await expect(gallery.locator('[data-market-preset]')).toHaveCount(3);
    await expect(gallery.locator('[data-market-preset="market:canvas-atelier"]')).toBeVisible();
    await expect(gallery.locator('[data-market-preset="market:aurora-glass"]')).toBeVisible();
    await expect(gallery.locator('[data-market-preset="market:neo-builder"]')).toBeVisible();

    await sheet.locator('[data-market-family-filter="Todos"]').click();
    await expect(gallery.locator('[data-market-preset]')).toHaveCount(10);
  });

  test('previews every product layout through a stable runtime identity', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    for (const [presetId, layout] of marketLayouts) {
      await sheet.locator(`[data-market-style-select="${presetId}"]`).click();
      await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketLayout)).toBe(layout);
      await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketPreset)).toBe(presetId);
    }
  });

  test('preserves the selected layout after appearance customization, applying and reloading', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await sheet.locator('[data-market-style-select="market:studio-carbon"]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketLayout)).toBe('ide');

    await sheet.locator('[data-appearance-profile-name]').fill('Carbon personalizado');
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="rose"]').click();
    await sheet.locator('[data-appearance-group="typography-family"] [data-appearance-value="humanist"]').click();

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketLayout)).toBe('ide');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketPreset)).toBe(
      'market:studio-carbon',
    );
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('rose');

    await sheet.locator('[data-appearance-apply]').click();
    const stored = await page.evaluate(() => window.localStorage.getItem('electrocraft.studio.appearance.v1'));
    expect(stored).toContain('"productDesign":"market:studio-carbon"');
    expect(stored).toContain('"accent":"rose"');
    expect(stored).toContain('"typographyFamily":"humanist"');

    await page.reload();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.ecAppearanceProfile))
      .toBe('Carbon personalizado');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketLayout)).toBe('ide');
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketPreset))
      .toBe('market:studio-carbon');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('rose');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTypographyFamily)).toBe('humanist');
  });

  test('changes computed shell treatment between technical and floating-builder presets', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await sheet.locator('[data-market-style-select="market:studio-carbon"]').click();
    const carbonRadius = await page
      .locator('.ec-app-shell-sidebar')
      .evaluate((element) => getComputedStyle(element).borderRadius);
    const carbonShadow = await page
      .locator('.ec-app-shell-sidebar')
      .evaluate((element) => getComputedStyle(element).boxShadow);
    expect(carbonRadius).toBe('0px');
    expect(carbonShadow).toBe('none');

    await sheet.locator('[data-market-style-select="market:canvas-atelier"]').click();
    const atelierRadius = await page
      .locator('.ec-app-shell-sidebar')
      .evaluate((element) => getComputedStyle(element).borderRadius);
    const atelierShadow = await page
      .locator('.ec-app-shell-sidebar')
      .evaluate((element) => getComputedStyle(element).boxShadow);
    expect(atelierRadius).not.toBe('0px');
    expect(atelierShadow).not.toBe('none');
  });

  test('keeps the gallery usable on mobile and respects system reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 800 });
    await resetAppearance(page);

    await page.locator('[data-appearance-trigger="mobile"]').click();
    const sheet = page.locator('[data-appearance-sheet="mobile"]');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-market-style-gallery] [data-market-preset]')).toHaveCount(10);

    await sheet.locator('[data-market-style-select="market:aurora-glass"]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMarketLayout)).toBe('glass');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMotion)).toBe('reduced');

    const horizontalOverflow = await sheet.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    expect(horizontalOverflow).toBe(false);
  });
});
