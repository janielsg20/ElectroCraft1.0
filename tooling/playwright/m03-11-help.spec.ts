import { expect, test } from '@playwright/test';

test.describe('M03.11 contextual Help system', () => {
  test('keeps Ayuda before Settings and opens a searchable drawer with focus restoration', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const help = page.getByRole('button', { name: 'Ayuda' });
    const settings = page.getByRole('button', { name: 'Configuración' });
    const ordering = await page.locator('.ec-topbar-right').evaluate((element) => {
      const helpButton = element.querySelector('[data-topbar-help-trigger]');
      const settingsButton = element.querySelector('[data-topbar-settings-trigger]');
      return Boolean(
        helpButton &&
        settingsButton &&
        helpButton.compareDocumentPosition(settingsButton) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(ordering).toBe(true);

    await help.click();
    const drawer = page.getByRole('dialog', { name: 'AppShell del Studio' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('WorkspacePreferencesPort');

    const search = drawer.getByLabel('Buscar en la ayuda');
    await search.fill('Puck');
    await expect(drawer.locator('[data-help-search-results]')).toContainText('Componentes');
    await drawer.getByRole('button', { name: /Componentes/ }).click();
    await expect(page.getByRole('dialog', { name: 'Componentes' })).toContainText('Palette');

    await page.getByRole('button', { name: 'Cerrar ayuda' }).click();
    await expect(help).toBeFocused();
    await expect(settings).toBeVisible();
  });

  test('uses Tooltip + 360px Popover for contextual desktop help and restores focus with Escape', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/content');

    const trigger = page.locator('header [data-help-trigger="help.section.records"]');
    await trigger.hover();
    await expect(page.getByRole('tooltip')).toContainText('contenido estructurado');
    await trigger.click();

    const popover = page.locator('[data-help-desktop-popover="help.section.records"]');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Registros');
    await expect(popover).toContainText('Ejemplo');
    const width = (await popover.boundingBox())?.width ?? 0;
    expect(width).toBeGreaterThanOrEqual(320);
    expect(width).toBeLessThanOrEqual(380);

    await page.keyboard.press('Escape');
    await expect(popover).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('uses a Sheet for contextual help on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/content');

    const trigger = page.locator('header [data-help-trigger="help.section.records"]');
    await trigger.click();
    const sheet = page.locator('[data-help-mobile-sheet="help.section.records"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText('Registros');
    await expect(sheet).toContainText('List/Detail');

    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('links real empty states to ¿Qué puedo hacer aquí? without demo content', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto('/queries');

    const emptyState = page.locator('[data-empty-state]');
    await expect(emptyState).toBeVisible();
    const action = emptyState.getByRole('button', { name: '¿Qué puedo hacer aquí?' });
    await expect(action).toBeVisible();
    await action.click();
    await expect(page.locator('[data-help-desktop-popover="help.section.queries"]')).toContainText('Consultas');
    await expect(page.locator('body')).not.toContainText('Demo');
  });

  test('attaches contextual help to canonical bootstrap H1 routes without inventing obsolete destinations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto('/screens');
    await expect(page.locator('[data-help-trigger="help.section.screens"]')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Taxonomías');
    await expect(page.locator('body')).not.toContainText('Relaciones');
  });
});
