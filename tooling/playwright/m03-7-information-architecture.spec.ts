import { expect, test } from '@playwright/test';

test.describe('M03.7 Progressive Disclosure and information architecture', () => {
  test('keeps Settings primary controls visible and Advanced collapsed by default', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const settingsTrigger = page.locator('[data-topbar-settings-trigger]');
    await settingsTrigger.click();

    const dialog = page.locator('[data-topbar-settings-sheet]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Espacio de trabajo', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Preferencias del AppShell', { exact: true })).toHaveCount(0);

    const advanced = dialog.locator('[data-progressive-disclosure="settings-advanced"]');
    const advancedTrigger = advanced.getByRole('button', { name: 'Avanzado' });
    await expect(advancedTrigger).toHaveAttribute('data-state', 'closed');
    await advancedTrigger.click();
    await expect(advancedTrigger).toHaveAttribute('data-state', 'open');
    await expect(advanced.getByText('Preferencias del AppShell', { exact: true })).toBeVisible();
    await expect(advanced.getByText('Adapter de workspace', { exact: true })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(settingsTrigger).toBeFocused();
  });

  test('keeps Inspector primary properties visible while advanced design controls stay directly reachable', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const inspector = page.locator('[data-editor-region="inspector"]');
    await expect(inspector).toBeVisible();
    await expect(inspector.getByText('Propiedades principales', { exact: true })).toBeVisible();
    await expect(inspector.getByText('Selecciona un elemento', { exact: true })).toBeVisible();

    const contentTab = inspector.getByRole('tab', { name: 'Contenido' });
    const designTab = inspector.getByRole('tab', { name: 'Diseño' });
    await expect(contentTab).toHaveAttribute('data-state', 'active');
    await designTab.click();
    await expect(designTab).toHaveAttribute('data-state', 'active');

    const advanced = inspector.locator('[data-progressive-disclosure="inspector-advanced"]');
    const advancedTrigger = advanced.getByRole('button', { name: 'Avanzado' });
    await expect(advancedTrigger).toHaveAttribute('data-state', 'open');
    await expect(advanced.locator('.ec-presentation-state')).toBeVisible();
    await expect(advanced).toContainText(/Selecciona un componente|selección/i);
  });

  test('uses one canonical Content route for the List/Detail pattern', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/content');

    const route = page.locator('[data-ia-route="content-list-detail"]');
    await expect(route).toBeVisible();
    await expect(route.locator('[data-list-detail-pattern]').first()).toBeVisible();
    await expect(route).toContainText(
      /Abre un proyecto|ElectroCraft Data|No hay modelos de datos|No hay registros|Selecciona un registro|Nuevo registro/i,
    );
    await expect(page).toHaveURL(/\/content$/);
  });

  for (const route of ['/queries', '/forms', '/admin', '/media', '/export']) {
    test(`renders an honest empty state for ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 1180, height: 800 });
      await page.goto(route);
      await expect(page.locator('[data-ia-route="module-empty-state"]')).toBeVisible();
      await expect(page.locator('[data-information-level="primary"]')).toBeVisible();
    });
  }

  test('fails closed for a redundant or unknown route instead of inventing a success screen', async ({ page }) => {
    await page.goto('/content/detail');
    await expect(page.locator('[data-ia-route]')).toHaveCount(0);
    await expect(page.getByText('Ruta no disponible en este bootstrap', { exact: true })).toBeVisible();
  });

  test('keeps mobile Properties reachable through the existing bottom Sheet', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/editor');

    const properties = page.locator('[data-mobile-destination="properties"]');
    await properties.click();
    const dialog = page.locator('[data-editor-mobile-sheet="properties"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('data-sheet-side', 'bottom');
    await expect(dialog.getByText('Propiedades principales', { exact: true })).toBeVisible();

    const designTab = dialog.getByRole('tab', { name: 'Diseño' });
    await designTab.click();
    await expect(designTab).toHaveAttribute('data-state', 'active');
    const advanced = dialog.locator('[data-progressive-disclosure="inspector-advanced"]');
    await expect(advanced).toBeVisible();
    await expect(advanced.getByRole('button', { name: 'Avanzado' })).toHaveAttribute('data-state', 'open');
    await expect(advanced.locator('.ec-presentation-state')).toBeVisible();
    await expect(advanced).toContainText(/Selecciona un componente|selección/i);
  });
});
