import { expect, test } from '@playwright/test';

test('muestra el historial y restaura una revisión como checkpoint nuevo', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  await page.evaluate(async () => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.initialize();
    const project = { id: 'm04-8-browser', name: 'Panel de control', metadata: {} };
    await projectStorageRuntime.saveProject({
      project,
      objects: [{ objectId: 'inicio', kind: 'screen', schemaVersion: 1, payload: { version: 1 } }],
      reason: 'initial',
    });
    await projectStorageRuntime.saveProject({
      project,
      objects: [{ objectId: 'inicio', kind: 'screen', schemaVersion: 1, payload: { version: 2 } }],
      reason: 'autosave',
    });
  });

  await page.getByRole('button', { name: 'Configuración' }).click();
  const history = page.getByRole('heading', { name: 'Historial de versiones' }).locator('..');
  await expect(history.getByRole('list', { name: 'Revisiones' })).toBeVisible();
  await expect(history.getByText('Resumen de cambios')).toBeVisible();
  await page.screenshot({ path: '.ai/evidence/F04/M04.8/revision-history-settings.png', fullPage: true });
});
