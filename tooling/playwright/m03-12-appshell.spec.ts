import { expect, test, type Page, type TestInfo } from '@playwright/test';

const viewportMatrix = [
  { name: 'desktop-1440', width: 1440, height: 900, mode: 'desktop' },
  { name: 'desktop-1280', width: 1280, height: 820, mode: 'desktop' },
  { name: 'laptop-1024', width: 1024, height: 768, mode: 'laptop' },
  { name: 'tablet-768', width: 768, height: 900, mode: 'tablet' },
  { name: 'mobile-375', width: 375, height: 812, mode: 'mobile' },
  { name: 'mobile-320', width: 320, height: 720, mode: 'mobile' },
] as const;

const canonicalNavigationLabels = [
  'Editor',
  'Pantallas',
  'Componentes',
  'Plantillas',
  'Generar con IA',
  'Registros',
  'Modelos',
  'Fuentes de datos',
  'Consultas',
  'Acciones y workflows',
  'Estado y variables',
  'Formularios',
  'Navegación',
  'Usuarios y permisos',
  'Administración',
  'Medios',
  'Extensiones',
  'Temas',
  'Sistema de diseño',
  'Tokens',
  'Vista previa',
  'Compatibilidad',
  'Exportar',
  'Desplegar',
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
}

async function captureViewportEvidence(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

test.describe('M03.12 AppShell E2E closure matrix', () => {
  for (const viewport of viewportMatrix) {
    test(`${viewport.name} preserves the responsive AppShell contract`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/editor');

      await expect(page.locator('.ec-app-shell-topbar')).toBeVisible();
      await expect(page.locator('.ec-app-shell-statusbar')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Configuración' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Ayuda' })).toBeVisible();

      const sidebar = page.locator('.ec-app-shell-sidebar');
      if (viewport.mode === 'desktop') {
        await expect(sidebar).toBeVisible();
        expect(Math.round((await sidebar.boundingBox())?.width ?? 0)).toBe(240);
        await expect(page.locator('[data-editor-region="context"]')).toBeVisible();
        await expect(page.locator('[data-editor-region="canvas"]')).toBeVisible();
        await expect(page.locator('[data-editor-region="inspector"]')).toBeVisible();
      } else if (viewport.mode === 'laptop') {
        await expect(sidebar).toBeVisible();
        expect(Math.round((await sidebar.boundingBox())?.width ?? 0)).toBe(64);
        await expect(page.locator('[data-editor-responsive-mode="laptop"]')).toHaveAttribute(
          'data-laptop-panel-strategy',
          'overlay',
        );
        await expect(page.locator('[data-editor-region="canvas"]')).toBeVisible();
      } else if (viewport.mode === 'tablet') {
        await expect(sidebar).toBeVisible();
        expect(Math.round((await sidebar.boundingBox())?.width ?? 0)).toBe(56);
        await expect(page.locator('[data-editor-responsive-mode="tablet"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Abrir navegación' })).toBeVisible();
      } else {
        await expect(sidebar).toBeHidden();
        const dock = page.getByRole('navigation', { name: 'Navegación inferior del editor' });
        await expect(dock).toBeVisible();
        await expect(dock.locator('[data-mobile-destination]')).toHaveCount(5);
        await expect(dock.locator('[data-appearance-trigger="mobile"]')).toHaveCount(0);
      }

      await assertNoHorizontalOverflow(page);
      await captureViewportEvidence(page, testInfo, viewport.name);
    });
  }

  test('renders the exact canonical Spanish navigation and excludes obsolete top-level destinations', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/editor');
    const sidebar = page.locator('.ec-app-shell-sidebar');

    for (const label of canonicalNavigationLabels) {
      await expect(sidebar.getByRole('link', { name: label, exact: true })).toHaveCount(1);
    }
    for (const obsolete of ['Taxonomías', 'Relaciones', 'Roles', 'Automatizaciones']) {
      await expect(sidebar.getByText(obsolete, { exact: true })).toHaveCount(0);
    }
    await expect(sidebar.getByRole('link', { name: 'Editor' })).toHaveAttribute('aria-current', 'page');
  });

  test('keeps Help before Settings and supports keyboard open/search/close with focus return', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const help = page.getByRole('button', { name: 'Ayuda' });
    const settings = page.getByRole('button', { name: 'Configuración' });
    const ordered = await page.locator('.ec-topbar-right').evaluate((element) => {
      const helpButton = element.querySelector('[data-topbar-help-trigger]');
      const settingsButton = element.querySelector('[data-topbar-settings-trigger]');
      return Boolean(
        helpButton &&
        settingsButton &&
        helpButton.compareDocumentPosition(settingsButton) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(ordered).toBe(true);

    await help.focus();
    await help.press('Enter');
    const helpSheet = page.locator('[data-help-drawer]');
    await expect(helpSheet).toBeVisible();
    const search = helpSheet.getByRole('searchbox');
    await search.fill('proyecto');
    await expect(helpSheet.getByText('Proyectos', { exact: true }).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(helpSheet).toBeHidden();
    await expect(help).toBeFocused();

    await captureViewportEvidence(page, testInfo, 'help-focus-return');
  });

  test('exposes real empty/disabled/ready states and fails closed on an unknown route', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/queries');
    await expect(page.locator('[data-route-state="empty"]')).toBeVisible();

    await page.goto('/deploy');
    await expect(page.locator('[data-route-state="disabled"]')).toBeVisible();

    await page.goto('/editor');
    await expect(page.locator('[data-route-state="ready"]')).toBeVisible();

    await page.goto('/ruta-inexistente');
    await expect(page.locator('[data-route-state="unknown"]')).toBeVisible();
    await captureViewportEvidence(page, testInfo, 'unknown-route-fail-closed');
  });

  test('keeps Studio theme persistence isolated from project/theme/export storage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');

    const before = await page.evaluate(() => ({
      localStorage: Object.fromEntries(Object.entries(window.localStorage)),
      theme: document.documentElement.dataset.ecTheme,
    }));

    const trigger = page.locator('[data-appearance-trigger="topbar"]').first();
    await trigger.click();
    const sheet = page.locator('[data-appearance-sheet="topbar"]').last();
    await expect(sheet).toBeVisible();
    await sheet.locator('[data-appearance-value="light"]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTheme)).toBe('light');

    const after = await page.evaluate(() => ({
      localStorage: Object.fromEntries(Object.entries(window.localStorage)),
      theme: document.documentElement.dataset.ecTheme,
    }));

    expect(before.theme).not.toBe(after.theme);
    const changedKeys = new Set(
      [...Object.keys(before.localStorage), ...Object.keys(after.localStorage)].filter(
        (key) => before.localStorage[key] !== after.localStorage[key],
      ),
    );
    expect([...changedKeys]).toEqual(['electrocraft.studio.theme.v2']);
  });

  test('does not leak known English release labels, raw translation keys or missing-key diagnostics', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    const body = page.locator('body');

    for (const forbidden of ['Settings', 'Help', 'Preview', 'Export', '[missing:', 'studio.']) {
      await expect(body).not.toContainText(forbidden);
    }
  });
});
