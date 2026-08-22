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

test.describe('M03.9 editor session appearance profile', () => {
  test('previews all canonical groups, reverts, applies and restores after reload', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await expect(
      sheet.getByText('No modifica el documento, el tema del proyecto ni lo exportado.', { exact: false }),
    ).toBeVisible();
    await sheet.locator('[data-appearance-group="tone"] [data-appearance-value="dark"]').click();
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="rose"]').click();
    await sheet.locator('[data-appearance-group="semantic-colors"] [data-appearance-value="vivid"]').click();
    await sheet.locator('[data-appearance-group="contrast"] [data-appearance-value="high"]').click();
    await sheet.locator('[data-appearance-group="typography-family"] [data-appearance-value="humanist"]').click();
    await sheet.locator('[data-appearance-group="typography-scale"] [data-appearance-value="large"]').click();
    await sheet.locator('[data-appearance-group="icon-size"] [data-appearance-value="large"]').click();
    await sheet.locator('[data-appearance-group="icon-style"] [data-appearance-value="strong"]').click();
    await sheet.locator('[data-appearance-group="radii"] [data-appearance-value="rounded"]').click();
    await sheet.locator('[data-appearance-group="elevation"] [data-appearance-value="raised"]').click();
    await sheet.locator('[data-appearance-group="button-shape"] [data-appearance-value="pill"]').click();
    await sheet.locator('[data-appearance-group="field-shape"] [data-appearance-value="square"]').click();
    await sheet.locator('[data-appearance-group="menu-appearance"] [data-appearance-value="glass"]').click();
    await sheet.locator('[data-appearance-group="density"] [data-appearance-value="comfortable"]').click();
    await sheet.locator('[data-appearance-group="control-size"] [data-appearance-value="large"]').click();
    await sheet.locator('[data-appearance-group="spacing-scale"] [data-appearance-value="spacious"]').click();
    await sheet.locator('[data-appearance-group="canvas-density"] [data-appearance-value="spacious"]').click();
    await sheet.locator('[data-appearance-group="animation-intensity"] [data-appearance-value="high"]').click();

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('rose');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecSemanticColors)).toBe('vivid');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTypographyFamily)).toBe('humanist');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecIconStyle)).toBe('strong');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecRadii)).toBe('rounded');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecElevation)).toBe('raised');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecControlSize)).toBe('large');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecButtonShape)).toBe('pill');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecFieldShape)).toBe('square');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMenuAppearance)).toBe('glass');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecSpacingScale)).toBe('spacious');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecCanvasDensity)).toBe('spacious');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMotion)).toBe('high');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecContrast)).toBe('high');

    await sheet.locator('[data-appearance-revert]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('system');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('indigo');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTypographyFamily)).toBe('system');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMotion)).toBe('standard');

    await sheet.locator('[data-appearance-profile-name]').fill('Mi Studio');
    await sheet.locator('[data-appearance-group="tone"] [data-appearance-value="dark"]').click();
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="emerald"]').click();
    await sheet.locator('[data-appearance-group="typography-family"] [data-appearance-value="mono"]').click();
    await sheet.locator('[data-appearance-group="contrast"] [data-appearance-value="high"]').click();
    await sheet.locator('[data-appearance-apply]').click();

    const stored = await page.evaluate(() => window.localStorage.getItem('electrocraft.studio.appearance.v1'));
    expect(stored).toContain('Mi Studio');
    expect(stored).toContain('emerald');
    expect(stored).toContain('mono');

    await page.reload();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.ecAppearanceProfile))
      .toBe('Mi Studio');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('dark');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('emerald');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTypographyFamily)).toBe('mono');
  });

  test('is reachable from Settings and asks for a decision before closing unapplied changes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);

    await page.locator('[data-topbar-settings-trigger]').click();
    const settings = page.locator('[data-topbar-settings-sheet]');
    await expect(settings.locator('[data-settings-destination="appearance"]')).toBeVisible();
    await settings.locator('[data-settings-destination="appearance"] [data-appearance-trigger="topbar"]').click();
    const appearance = page.locator('[data-appearance-sheet="topbar"]').last();
    await expect(appearance).toBeVisible();

    await appearance.locator('[data-appearance-group="accent"] [data-appearance-value="blue"]').click();
    await appearance.getByRole('button', { name: 'Cerrar apariencia' }).click();
    const decision = appearance.locator('[data-appearance-close-decision]');
    await expect(decision).toBeVisible();
    await expect(appearance).toBeVisible();
    await decision.locator('[data-appearance-discard-close]').click();
    await expect(appearance).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('indigo');
  });

  test('saves and reuses a personal preset outside project data', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await sheet.locator('[data-appearance-profile-name]').fill('Preset personal');
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="amber"]').click();
    await sheet.locator('[data-appearance-group="radii"] [data-appearance-value="rounded"]').click();
    await sheet.locator('[data-appearance-save-preset]').click();
    await sheet.locator('[data-appearance-revert]').click();

    await sheet.locator('[data-appearance-preset-trigger]').click();
    const personalPreset = page.locator('[data-preset-kind="personal"]').last();
    await expect(personalPreset).toHaveText('Preset personal');
    await personalPreset.click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('amber');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecRadii)).toBe('rounded');

    const storedPresets = await page.evaluate(() =>
      window.localStorage.getItem('electrocraft.studio.appearance-presets.v1'),
    );
    expect(storedPresets).toContain('Preset personal');
  });

  test('warns on an inaccessible combination and restores accessible defaults', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await sheet.locator('[data-appearance-group="semantic-colors"] [data-appearance-value="muted"]').click();
    const warning = sheet.locator('[data-appearance-accessibility-warning]');
    await expect(warning).toBeVisible();
    await warning.locator('[data-appearance-restore-accessible]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecContrast)).toBe('high');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMotion)).toBe('reduced');
    await expect(warning).toBeHidden();
  });

  test('caps high motion when the operating system requests reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await sheet.locator('[data-appearance-group="animation-intensity"] [data-appearance-value="high"]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecSystemReducedMotion)).toBe('true');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecMotion)).toBe('reduced');
    await expect(sheet.getByText('El sistema solicita movimiento reducido', { exact: false })).toBeVisible();
  });

  test('reset restores exact defaults while retaining the custom profile name', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await resetAppearance(page);
    const sheet = await openDesktopAppearance(page);

    await sheet.locator('[data-appearance-profile-name]').fill('Perfil conservado');
    await sheet.locator('[data-appearance-group="tone"] [data-appearance-value="dark"]').click();
    await sheet.locator('[data-appearance-group="accent"] [data-appearance-value="amber"]').click();
    await sheet.locator('[data-appearance-group="canvas-density"] [data-appearance-value="compact"]').click();
    await sheet.locator('[data-appearance-apply]').click();
    await sheet.locator('[data-appearance-reset]').click();

    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.ecAppearanceProfile))
      .toBe('Perfil conservado');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecThemePreference)).toBe('system');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecAccent)).toBe('indigo');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecCanvasDensity)).toBe('comfortable');
  });

  test('keeps appearance reachable through More in the five-slot mobile bottom dock', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await resetAppearance(page);

    const dock = page.locator('.ec-editor-mobile-dock');
    await expect(dock).toBeVisible();
    await expect(dock.locator('[data-mobile-destination]')).toHaveCount(5);

    await dock.locator('[data-mobile-destination="more"]').click();
    const moreSheet = page.locator('[data-editor-mobile-sheet="outline"]');
    await expect(moreSheet).toBeVisible();

    const appearanceTrigger = moreSheet.locator('[data-appearance-trigger="mobile"]');
    await expect(appearanceTrigger).toBeVisible();
    await appearanceTrigger.click();

    const sheet = page.locator('[data-appearance-sheet="mobile"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('data-sheet-side', 'bottom');
    await expect(sheet.locator('[data-appearance-group="tone"]')).toBeVisible();

    const overflow = await dock.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
    expect(overflow).toBe(false);
  });
});