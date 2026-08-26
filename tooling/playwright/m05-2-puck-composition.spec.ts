import { expect, test } from '@playwright/test';

test.describe('M05.2 public Puck composition', () => {
  test('composes Components, Outline, Preview and Fields in the Studio editor', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    await expect(page.getByRole('tab', { name: 'Componentes' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Pantallas' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Capas' })).toBeVisible();
    await expect(page.locator('[data-puck-composition="components"]')).toBeVisible();
    await expect(page.locator('[data-puck-composition="preview"]')).toBeVisible();
    await expect(page.locator('[data-puck-composition="fields"]')).toBeAttached();

    const palette = page.locator('[data-studio-palette]').first();
    await expect(palette).toHaveAttribute('data-puck-active-components', '0');

    await page.getByRole('tab', { name: 'Capas' }).click();
    await expect(page.locator('[data-puck-composition="outline"]')).toBeVisible();
  });

  test('maps Studio tokens to Puck while keeping the Preview iframe isolated from host styles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    const theme = await workspace.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        surface: styles.getPropertyValue('--puck-color-surface').trim(),
        border: styles.getPropertyValue('--puck-color-border').trim(),
        text: styles.getPropertyValue('--puck-color-text').trim(),
        interactive: styles.getPropertyValue('--puck-color-interactive').trim(),
        focus: styles.getPropertyValue('--puck-color-focus-ring').trim(),
      };
    });

    for (const value of Object.values(theme)) expect(value.length).toBeGreaterThan(0);

    const iframe = page.locator('[data-puck-composition="preview"] iframe').first();
    await expect(iframe).toBeAttached();
    await page.evaluate(() => document.documentElement.setAttribute('data-m05-2-host-theme', 'studio-only'));

    const handle = await iframe.elementHandle();
    const frame = await handle?.contentFrame();
    expect(frame).not.toBeNull();
    expect(await frame?.evaluate(() => document.documentElement.getAttribute('data-m05-2-host-theme'))).toBeNull();
  });

  test('keeps keyboard Palette navigation available without duplicating Puck selection state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const palette = page.locator('[data-studio-palette]').first();
    const search = palette.getByRole('searchbox', { name: 'Buscar componentes' });
    await search.focus();
    await page.keyboard.press('ArrowDown');
    await expect(palette.locator('.ec-palette-item-main').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-editor-canvas-stage]')).toBeFocused();

    await palette
      .locator('[data-palette-item="palette.basic.text"]')
      .first()
      .getByRole('button', { name: /Insertar: Texto/ })
      .click();
    await expect(palette.locator('[data-palette-diagnostic="PALETTE_COMPONENT_UNAVAILABLE"]')).toBeVisible();
  });
});
