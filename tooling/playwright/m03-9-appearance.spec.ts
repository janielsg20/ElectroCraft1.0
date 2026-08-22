import { expect, test, type Page } from '@playwright/test';

const THEME_KEY = 'electrocraft.studio.theme.v2';

async function resetTheme(page: Page) {
  await page.goto('/editor');
  await page.evaluate(() => {
    window.localStorage.removeItem('electrocraft.studio.theme.v2');
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

test.describe('M03.9 single Studio theme', () => {
  test('offers only light and dark, persists immediately and restores after reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetTheme(page);

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTheme)).toBe('light');
    const sheet = await openDesktopAppearance(page);

    const choices = sheet.locator('[data-appearance-value]');
    await expect(choices).toHaveCount(2);
    await expect(sheet.locator('[data-appearance-value="light"]')).toBeVisible();
    await expect(sheet.locator('[data-appearance-value="dark"]')).toBeVisible();
    await expect(sheet).not.toContainText('Presets');
    await expect(sheet).not.toContainText('framework');

    await sheet.locator('[data-appearance-value="dark"]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTheme)).toBe('dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
    expect(await page.evaluate((key) => window.localStorage.getItem(key), THEME_KEY)).toBe(JSON.stringify('dark'));

    await page.reload();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTheme)).toBe('dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
  });

  test('cleans legacy appearance and preset storage after a new mode selection', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetTheme(page);
    await page.evaluate(() => {
      window.localStorage.setItem('electrocraft.studio.appearance.v1', JSON.stringify({ tone: 'dark', accent: 'rose' }));
      window.localStorage.setItem('electrocraft.studio.appearance-presets.v1', JSON.stringify([{ id: 'legacy' }]));
    });

    const sheet = await openDesktopAppearance(page);
    await sheet.locator('[data-appearance-value="dark"]').click();

    expect(await page.evaluate(() => window.localStorage.getItem('electrocraft.studio.appearance.v1'))).toBeNull();
    expect(await page.evaluate(() => window.localStorage.getItem('electrocraft.studio.appearance-presets.v1'))).toBeNull();
  });

  test('remains reachable through Settings with Radix focus-safe Sheet semantics', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetTheme(page);

    await page.locator('[data-topbar-settings-trigger]').click();
    const settings = page.locator('[data-topbar-settings-sheet]');
    await expect(settings.locator('[data-settings-destination="appearance"]')).toBeVisible();
    await settings.locator('[data-settings-destination="appearance"] [data-appearance-trigger="topbar"]').click();

    const appearance = page.locator('[data-appearance-sheet="topbar"]').last();
    await expect(appearance).toBeVisible();
    await expect(appearance).toHaveAttribute('data-sheet-side', 'right');
    await expect(appearance.getByRole('radiogroup', { name: 'Modo de color' })).toBeVisible();
    await appearance.getByRole('button', { name: 'Cerrar apariencia' }).click();
    await expect(appearance).toBeHidden();
  });

  test('keeps the two-mode selector usable from the six-slot mobile dock without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await resetTheme(page);

    const dock = page.locator('.ec-editor-mobile-dock');
    await expect(dock).toBeVisible();
    await expect(dock.locator('[data-appearance-trigger="mobile"]')).toBeVisible();
    expect(await dock.locator(':scope > *').count()).toBe(6);

    await dock.locator('[data-appearance-trigger="mobile"]').click();
    const sheet = page.locator('[data-appearance-sheet="mobile"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-sheet-side', 'bottom');
    await expect(sheet.locator('[data-appearance-value]')).toHaveCount(2);

    const overflow = await dock.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    expect(overflow).toBe(false);
  });
});
