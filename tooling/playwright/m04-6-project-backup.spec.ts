import { expect, test } from '@playwright/test';

test('descarga e importa una copia portable desde Project Home', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/');

  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('Proyecto backup E2E');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-canvas-stage]')).toBeVisible({ timeout: 60_000 });

  await page.goto('/');
  await expect(page.getByRole('button', { name: /Proyecto backup E2E/ })).toBeVisible({ timeout: 60_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar copia' }).first().click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('proyecto-backup-e2e.electrocraft.json');
  const backupPath = await download.path();
  expect(backupPath).not.toBeNull();

  await page.locator('input[type="file"]').setInputFiles(backupPath!);
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Importar copia de proyecto' })).toBeVisible();
  await expect(dialog.getByText(/objetos · copia del/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Importar' }).click();

  await expect(page.getByText('Proyecto backup E2E — copia importada', { exact: true })).toBeVisible({
    timeout: 60_000,
  });
});

test('bloquea una copia corrupta antes de abrir el diálogo de importación', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Importar copia' }).first()).toBeEnabled({ timeout: 60_000 });
  await page.locator('input[type="file"]').setInputFiles({
    name: 'corrupta.electrocraft.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"format":"electrocraft.project-backup","version":1,"checksum":"incorrecto"}'),
  });
  await expect(page.getByRole('alert')).toContainText(/project|backup|objects/i);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
