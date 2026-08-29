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
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Editor' });
    await expect(drawer).toBeVisible();
    const search = drawer.getByLabel('Buscar en la ayuda');
    await search.fill('ExportIR');
    await expect(drawer.locator('[data-help-search-results]')).toContainText('Exportar');
    await captureViewportEvidence(page, testInfo, 'desktop-help-search');
    await page.keyboard.press('Escape');
    await expect(help).toBeFocused();
    await expect(settings).toBeVisible();
  });

  test('exposes real empty/disabled/ready states and fails closed on an unknown route', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 820 });
    await page.goto('/queries');
    await expect(page.getByRole('button', { name: '¿Qué puedo hacer aquí?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Deshacer' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Rehacer' })).toHaveCount(0);
    await expect(page.locator('.ec-app-shell-statusbar')).toContainText('Listo');

    await page.goto('/editor');
    const toolsTrigger = page.getByRole('button', { name: 'Abrir herramientas contextuales' });
    await expect(toolsTrigger).toBeVisible();
    await toolsTrigger.click();
    const tools = page.getByRole('dialog', { name: 'Herramientas contextuales' });
    await expect(tools.getByRole('button', { name: 'Deshacer' })).toBeDisabled();
    await expect(tools.getByRole('button', { name: 'Rehacer' })).toBeDisabled();
    await page.keyboard.press('Escape');

    await page.goto('/ruta-inexistente-m03-12');
    await expect(page.getByText('Ruta no disponible', { exact: false })).toBeVisible();
    await expect(page.locator('[aria-current="page"]')).toHaveCount(0);
  });

  test('keeps Studio theme persistence isolated from project/theme/export storage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    await page.evaluate(() => {
      window.localStorage.removeItem('electrocraft.studio.theme.v2');
      window.localStorage.setItem(
        'electrocraft.studio.appearance.v1',
        JSON.stringify({ tone: 'light', accent: 'amber' }),
      );
      window.localStorage.setItem('electrocraft.studio.appearance-presets.v1', JSON.stringify([{ id: 'legacy' }]));
      window.localStorage.setItem('electrocraft.project.e2e-sentinel', 'project-stable');
      window.localStorage.setItem('electrocraft.theme.e2e-sentinel', 'theme-stable');
      window.localStorage.setItem('electrocraft.export.e2e-sentinel', 'export-stable');
    });
    await page.reload();

    await page.locator('[data-appearance-trigger="topbar"]').first().click();
    const sheet = page.locator('[data-appearance-sheet="topbar"]').last();
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-appearance-value]')).toHaveCount(2);
    await sheet.locator('[data-appearance-value="dark"]').click();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.ecTheme)).toBe('dark');

    const storage = await page.evaluate(() => ({
      studioTheme: window.localStorage.getItem('electrocraft.studio.theme.v2'),
      legacyAppearance: window.localStorage.getItem('electrocraft.studio.appearance.v1'),
      legacyPresets: window.localStorage.getItem('electrocraft.studio.appearance-presets.v1'),
      project: window.localStorage.getItem('electrocraft.project.e2e-sentinel'),
      theme: window.localStorage.getItem('electrocraft.theme.e2e-sentinel'),
      exportValue: window.localStorage.getItem('electrocraft.export.e2e-sentinel'),
    }));
    expect(storage.studioTheme).toBe(JSON.stringify('dark'));
    expect(storage.legacyAppearance).toBeNull();
    expect(storage.legacyPresets).toBeNull();
    expect(storage.project).toBe('project-stable');
    expect(storage.theme).toBe('theme-stable');
    expect(storage.exportValue).toBe('export-stable');
  });

  test('does not leak known English release labels, raw translation keys or missing-key diagnostics', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/editor');
    const body = page.locator('body');
    for (const forbidden of [
      'Save changes',
      'Cancel changes',
      'Open settings',
      'Components panel',
      'Export project',
      'I18N_MISSING_KEY',
      'translation missing',
    ]) {
      await expect(body).not.toContainText(forbidden);
    }
  });
});
