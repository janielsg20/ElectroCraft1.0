import { expect, test, type Page } from '@playwright/test';

async function initializeStorage(page: Page) {
  return page.evaluate(async () => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.initialize();
    return projectStorageRuntime.refresh();
  });
}

async function openStoredProject(page: Page, projectId: string) {
  return page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.initialize();
    return projectStorageRuntime.openProject(id);
  }, projectId);
}

test.describe('M04.2 PGlite multi-tab worker', () => {
  test('shares one logical IndexedDB database and survives leader handoff', async ({ context }) => {
    const first = await context.newPage();
    const second = await context.newPage();
    await first.goto('/');
    await second.goto('/');

    const firstDiagnostics = await initializeStorage(first);
    const secondDiagnostics = await initializeStorage(second);

    expect(firstDiagnostics.backend).toBe('indexeddb');
    expect(secondDiagnostics.backend).toBe('indexeddb');
    expect(firstDiagnostics.lifecyclePhase).toBe('ready');
    expect(secondDiagnostics.lifecyclePhase).toBe('ready');
    expect(firstDiagnostics.coordination?.mode).toBe('multi-tab');
    expect(secondDiagnostics.coordination?.mode).toBe('multi-tab');

    const roles = [firstDiagnostics.coordination?.role, secondDiagnostics.coordination?.role];
    expect(roles).toContain('leader');
    expect(roles).toContain('follower');

    const leaderPage = firstDiagnostics.coordination?.role === 'leader' ? first : second;
    const followerPage = leaderPage === first ? second : first;
    const projectId = `m04-2-shared-${Date.now()}`;

    await leaderPage.evaluate(async (id) => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      await projectStorageRuntime.saveProject({
        project: { id, name: 'Proyecto Multi-Tab', metadata: {} },
        objects: [
          {
            objectId: 'screen-home',
            kind: 'screen',
            schemaVersion: 1,
            payload: { title: 'Compartido entre pestañas', version: 1 },
          },
        ],
        reason: 'm04-2-multitab-write',
      });
    }, projectId);

    const shared = await openStoredProject(followerPage, projectId);
    expect(shared?.project.name).toBe('Proyecto Multi-Tab');
    expect(shared?.objects[0]?.payload).toEqual({ title: 'Compartido entre pestañas', version: 1 });

    await leaderPage.close();

    await expect
      .poll(
        async () => {
          const diagnostics = await followerPage.evaluate(async () => {
            const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
            return projectStorageRuntime.refresh();
          });
          return diagnostics.coordination;
        },
        { timeout: 30_000 },
      )
      .toMatchObject({ mode: 'multi-tab', role: 'leader' });

    const afterHandoff = await followerPage.evaluate(async (id) => {
      const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
      const diagnostics = await projectStorageRuntime.refresh();
      await projectStorageRuntime.saveProject({
        project: { id, name: 'Proyecto Multi-Tab', metadata: {} },
        objects: [
          {
            objectId: 'screen-home',
            kind: 'screen',
            schemaVersion: 1,
            payload: { title: 'Leader handoff completado', version: 2 },
          },
        ],
        reason: 'm04-2-leader-handoff',
      });
      return {
        diagnostics,
        project: await projectStorageRuntime.openProject(id),
      };
    }, projectId);

    expect(afterHandoff.diagnostics.coordination?.leaderChanges).toBeGreaterThanOrEqual(1);
    expect(afterHandoff.project?.objects[0]?.payload).toEqual({ title: 'Leader handoff completado', version: 2 });
    await followerPage.close();
  });
});
