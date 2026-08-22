import { expect, test } from '@playwright/test';

async function createProject(page: Parameters<typeof test>[0] extends never ? never : any, name: string) {
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill(name);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
}

test('M04.6 exporta e importa una copia validada desde Project Home', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');
  await createProject(page, 'Proyecto backup E2E');

  await page.goto('/');
  await expect(page.getByRole('button', { name: /Proyecto backup E2E/ })).toBeVisible({ timeout: 60_000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Crear copia de seguridad' }).first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('proyecto-backup-e2e.electrocraft-backup.json');
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();

  await page.getByRole('button', { name: 'Importar proyecto' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Archivo de copia de seguridad').setInputFiles(backupPath!);
  await expect(dialog.getByRole('heading', { name: 'Resumen de impacto' })).toBeVisible();
  await expect(dialog.getByText('1')).not.toHaveCount(0);
  await expect(dialog.getByLabel('Nombre de la copia')).toHaveValue('Proyecto backup E2E (copia importada)');
  await dialog.getByRole('button', { name: 'Importar copia' }).click();

  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Proyecto backup E2E \(copia importada\)/ })).toBeVisible({
    timeout: 60_000,
  });
});

test('M04.6 valida el archivo antes de habilitar importación y mantiene el diálogo usable en móvil', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const importButton = page.getByRole('button', { name: 'Importar proyecto' });
  await expect(importButton).toBeEnabled({ timeout: 60_000 });
  await importButton.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Importar copia' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(
    false,
  );
});
