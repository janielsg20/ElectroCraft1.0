import { expect, test } from '@playwright/test';

test('Project Home exporta e importa una copia verificable', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.goto('/');

  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('Backup UI');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });

  await page.goto('/');
  await expect(page.getByText('Backup UI').first()).toBeVisible({ timeout: 60_000 });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Crear copia' }).first().click(),
  ]);
  const backupPath = testInfo.outputPath('backup-ui.electrocraft.json');
  await download.saveAs(backupPath);

  await page.getByRole('button', { name: 'Importar copia' }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Archivo de copia').setInputFiles(backupPath);
  await expect(dialog.getByText('Backup UI')).toBeVisible();
  await expect(dialog.getByText(/objetos/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Importar copia' }).click();

  await expect(dialog).toBeHidden({ timeout: 60_000 });
  await expect(page.getByText('Backup UI (importado)').first()).toBeVisible({ timeout: 60_000 });
});