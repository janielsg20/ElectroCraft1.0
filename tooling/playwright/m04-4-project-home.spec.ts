import { expect, test } from '@playwright/test';

test('Project Home crea, reabre y archiva', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  const create = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(create).toBeEnabled({ timeout: 60_000 });
  await create.click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
  await page.goto('/');
  const project = page.getByRole('button', { name: /Proyecto sin título/ });
  await expect(project.first()).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Archivar' }).first().click();
  await expect(project).toHaveCount(0, { timeout: 60_000 });

  const status = page.getByRole('combobox', { name: 'Estado de proyectos' });
  await status.click();
  await page.getByRole('option', { name: 'Archivados' }).click();
  await expect(status).toContainText('Archivados');
  await expect(project.first()).toBeVisible({ timeout: 60_000 });
});

test('Project Home es usable en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Proyectos' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(
    false,
  );
  await page.screenshot({ path: '.ai/evidence/F04/M04.4/project-home-mobile.png', fullPage: true });
});
