import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.describe('M04.6 importar, crear copia y restaurar', () => {
  test('downloads a project backup, imports an independent copy and restores the original safely', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.evaluate(async () => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      await projectStorageRuntime.initialize();
      await projectStorageRuntime.saveProject({
        project: { id: 'm04-6-e2e', name: 'Proyecto M04.6', metadata: { entry: 'screen-home' } },
        objects: [
          {
            objectId: 'screen-home',
            kind: 'screen',
            schemaVersion: 1,
            payload: { title: 'Original M04.6' },
          },
        ],
        reason: 'm04-6-e2e-fixture',
      });
    });
    await page.reload();

    const originalCard = page.locator('.ec-project-card').filter({ hasText: 'Proyecto M04.6' }).first();
    await expect(originalCard).toBeVisible({ timeout: 30_000 });
    await originalCard.getByRole('button', { name: 'Copias' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('menuitem', { name: 'Crear copia' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^proyecto-m04-6-\d{4}-\d{2}-\d{2}\.electrocraft\.json$/);
    const backupPath = await download.path();
    expect(backupPath).toBeTruthy();

    const backupDocument = JSON.parse(await readFile(backupPath!, 'utf8')) as {
      manifest: { format: string; version: number; projectId: string; mediaFilesIncluded: boolean };
    };
    expect(backupDocument.manifest).toMatchObject({
      format: 'electrocraft-project-backup',
      version: 1,
      projectId: 'm04-6-e2e',
      mediaFilesIncluded: false,
    });

    await page.getByRole('button', { name: 'Importar copia', exact: true }).first().click();
    const importDialog = page.getByRole('dialog', { name: 'Importar copia de seguridad' });
    await expect(importDialog).toBeVisible();
    await importDialog.locator('input[type="file"]').setInputFiles(backupPath!);
    await expect(importDialog.getByRole('heading', { name: '2. Impacto' })).toBeVisible();
    await expect(importDialog).toContainText('Ya existe un proyecto con este ID');
    await expect(importDialog.getByRole('radio', { name: /Importar como copia/ })).toBeChecked();
    await importDialog.getByRole('button', { name: 'Importar como copia' }).click();
    await expect(importDialog).toContainText('Proyecto importado correctamente.');
    await importDialog.getByRole('button', { name: 'Cerrar' }).click();

    await expect(page.getByText('Proyecto M04.6 (importado)', { exact: true })).toBeVisible({ timeout: 30_000 });
    const copied = await page.evaluate(async () => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      const projects = await projectStorageRuntime.listProjects({ search: '(importado)', status: 'active', sort: 'updated-desc' });
      const imported = projects.find(({ name }) => name === 'Proyecto M04.6 (importado)');
      return imported ? projectStorageRuntime.openProject(imported.id) : null;
    });
    expect(copied?.project.id).not.toBe('m04-6-e2e');
    expect(copied?.objects[0]?.objectId).not.toBe('screen-home');
    expect(copied?.objects[0]?.payload).toMatchObject({ title: 'Original M04.6' });

    await page.evaluate(async () => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      await projectStorageRuntime.renameProject('m04-6-e2e', 'Proyecto M04.6 mutado');
    });
    await page.reload();

    const mutatedCard = page.locator('.ec-project-card').filter({ hasText: 'Proyecto M04.6 mutado' }).first();
    await expect(mutatedCard).toBeVisible({ timeout: 30_000 });
    await mutatedCard.getByRole('button', { name: 'Copias' }).click();
    await page.getByRole('menuitem', { name: 'Restaurar desde copia' }).click();
    const restoreDialog = page.getByRole('dialog', { name: 'Restaurar desde una copia' });
    await expect(restoreDialog).toBeVisible();
    await restoreDialog.locator('input[type="file"]').setInputFiles(backupPath!);
    await expect(restoreDialog).toContainText('Se creará una revisión de seguridad antes de reemplazarlo.');
    await restoreDialog.getByRole('button', { name: 'Restaurar y reemplazar' }).click();
    await expect(restoreDialog).toContainText('Proyecto restaurado. La versión anterior quedó guardada');
    await restoreDialog.getByRole('button', { name: 'Cerrar' }).click();

    await expect(page.getByText('Proyecto M04.6', { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    const restored = await page.evaluate(async () => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      return projectStorageRuntime.openProject('m04-6-e2e');
    });
    expect(restored?.project.name).toBe('Proyecto M04.6');
    expect(restored?.objects[0]?.payload).toMatchObject({ title: 'Original M04.6' });
    expect(restored?.revision?.reason).toBe('backup-restored');
    expect(pageErrors).toEqual([]);
  });

  test('shows a validation error for a tampered backup before offering any import action', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Importar copia', exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Importar copia de seguridad' });
    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'tampered.electrocraft.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          manifest: {
            format: 'electrocraft-project-backup',
            version: 1,
            createdAt: new Date().toISOString(),
            projectId: 'fake',
            projectName: 'Fake',
            objectCount: 0,
            contentRecordCount: 0,
            taxonomyTermCount: 0,
            relationCount: 0,
            mediaReferenceCount: 0,
            mediaFilesIncluded: false,
            snapshotChecksum: 'sha256:fake',
          },
          snapshot: {
            project: { id: 'fake', name: 'Fake', metadata: {} },
            status: 'active',
            objects: [],
            content: { records: [], terms: [], recordTerms: [], relations: [] },
            media: [],
          },
          checksum: 'sha256:fake',
        }),
      ),
    });
    await expect(dialog.locator('.ec-project-backup-status')).toHaveAttribute('data-state', 'error');
    await expect(dialog).toContainText(/checksum/i);
    await expect(dialog.getByRole('button', { name: 'Importar', exact: true })).toBeDisabled();
  });
});
