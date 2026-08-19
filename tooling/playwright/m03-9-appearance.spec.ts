import { expect, test } from '@playwright/test';

async function resetAppearance(page: Parameters<typeof test>[0]['page']) {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.removeItem('electrocraft.studio.appearance.v1'));
  await page.reload();
}

test.describe('M03.9 editor session appearance profile', () => {
  test('previews, reverts, applies and restores the profile after reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);

    await page.locator('[data-appearance-trigger="topbar"]').click();
    const sheet = page.locator('[data-appearance-sheet="topbar"]');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText('No modifica el documento ni el tema exportado.', { exact: false })).toBeVisible();

    await sheet.locator('[data-appearance-group="tone"] [data-appearance-value="dark"]').click();
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="rose"]').click();
    await sheet.locator('[data-appearance-group="density"] [data-appearance-value="comfortable"]').click();
    await sheet.locator('[data-appearance-group="canvas-density"] [data-appearance-value="spacious"]').click();

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('rose');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecDensity)).toBe('comfortable');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecCanvasDensity)).toBe('spacious');

    await sheet.locator('[data-appearance-revert]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('system');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('indigo');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecDensity)).toBe('high');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecCanvasDensity)).toBe('comfortable');

    await sheet.locator('[data-appearance-profile-name]').fill('Mi Studio');
    await sheet.locator('[data-appearance-group="tone"] [data-appearance-value="dark"]').click();
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="emerald"]').click();
    await sheet.locator('[data-appearance-group="density"] [data-appearance-value="comfortable"]').click();
    await sheet.locator('[data-appearance-apply]').click();

    const stored = await page.evaluate(() => window.localStorage.getItem('electrocraft.studio.appearance.v1'));
    expect(stored).toContain('Mi Studio');
    expect(stored).toContain('emerald');
    expect(stored).toContain('comfortable');

    await page.reload();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAppearanceProfile)).toBe('Mi Studio');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('emerald');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecDensity)).toBe('comfortable');
  });

  test('reset restores exact appearance defaults and retains the custom profile name', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    await page.locator('[data-appearance-trigger="topbar"]').click();
    const sheet = page.locator('[data-appearance-sheet="topbar"]');

    await sheet.locator('[data-appearance-profile-name]').fill('Perfil conservado');
    await sheet.locator('[data-appearance-group="tone"] [data-appearance-value="dark"]').click();
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="amber"]').click();
    await sheet.locator('[data-appearance-group="canvas-density"] [data-appearance-value="compact"]').click();
    await sheet.locator('[data-appearance-apply]').click();
    await sheet.locator('[data-appearance-reset]').click();

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAppearanceProfile)).toBe('Perfil conservado');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('system');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('indigo');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecDensity)).toBe('high');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecCanvasDensity)).toBe('comfortable');
  });

  test('keeps appearance directly reachable in the six-slot mobile bottom dock', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await resetAppearance(page);

    const dock = page.locator('.ec-editor-mobile-dock');
    await expect(dock).toBeVisible();
    await expect(dock.locator('[data-appearance-trigger="mobile"]')).toBeVisible();
    expect(await dock.locator(':scope > *').count()).toBe(6);

    await dock.locator('[data-appearance-trigger="mobile"]').click();
    const sheet = page.locator('[data-appearance-sheet="mobile"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-sheet-side', 'bottom');
    await expect(sheet.locator('[data-appearance-group="tone"]')).toBeVisible();

    const overflow = await dock.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    expect(overflow).toBe(false);
  });
});
