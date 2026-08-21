import { expect, test } from '@playwright/test';

test.describe('M04.3 autosave incremental y recovery', () => {
  test('persists only dirty objects, keeps a checkpoint and restores it explicitly', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('/');
    const projectId = `m04-3-autosave-${Date.now()}`;

    const result = await page.evaluate(async (id) => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      await projectStorageRuntime.initialize();
      await projectStorageRuntime.saveProject({
        project: { id, name: 'Proyecto con autosave', metadata: {} },
        objects: [
          { objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { version: 1 } },
          { objectId: 'theme', kind: 'theme', schemaVersion: 1, payload: { palette: 'original' } },
        ],
        reason: 'initial',
      });
      const checkpoint = await projectStorageRuntime.createCheckpoint(id, 'manual-e2e');
      const pending = projectStorageRuntime.queueAutosave({
        project: { id, name: 'Proyecto con autosave', metadata: {} },
        dirtyObjects: [{ objectId: 'screen-home', kind: 'screen', schemaVersion: 1, payload: { version: 2 } }],
      });
      await projectStorageRuntime.flushAutosave();
      const incremented = await projectStorageRuntime.openProject(id);
      await projectStorageRuntime.restoreRevision(id, checkpoint.id);
      const restored = await projectStorageRuntime.openProject(id);
      return { pending, incremented, restored };
    }, projectId);

    expect(result.pending).toEqual({ dirtyObjectIds: ['screen-home'], deletedObjectIds: [] });
    expect(result.incremented?.objects.map(({ objectId, payload }) => [objectId, payload])).toEqual([
      ['screen-home', { version: 2 }],
      ['theme', { palette: 'original' }],
    ]);
    expect(result.restored?.objects.map(({ objectId, payload }) => [objectId, payload])).toEqual([
      ['screen-home', { version: 1 }],
      ['theme', { palette: 'original' }],
    ]);
    await expect(page.locator('.ec-topbar-save')).toHaveText('Guardado');

    await page.getByRole('button', { name: 'Configuración' }).click();
    const storage = page.getByRole('dialog', { name: 'Configuración' }).locator('[data-project-storage-settings]');
    await storage.getByRole('button', { name: 'Comprobar integridad' }).click();
    await expect(storage.locator('[data-storage-recovery="coherent"]')).toContainText(
      'El proyecto actual es coherente',
    );
    await page.screenshot({
      path: '.ai/evidence/F04/M04.3/storage-recovery-settings.png',
      fullPage: true,
    });
  });
});
