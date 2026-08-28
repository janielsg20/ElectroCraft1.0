import { expect, test, type Page } from '@playwright/test';

interface StoredNode {
  readonly id?: string;
  readonly componentRef?: string;
  readonly style?: { readonly base?: { readonly visibility?: string | null } } | null;
  readonly children?: StoredNode[];
}

interface StoredDocument {
  readonly id?: string;
  readonly kind?: string;
  readonly root?: StoredNode;
}

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Context actions M06.6', metadata: { source: 'm06.6-e2e' } },
      objects: [],
      reason: 'm06.6-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

async function readDocuments(page: Page, projectId: string): Promise<StoredDocument[]> {
  return page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.flushAutosave();
    const opened = await projectStorageRuntime.openProject(id);
    return (opened?.objects.filter((object) => object.kind === 'document').map((object) => object.payload) ??
      []) as StoredDocument[];
  }, projectId);
}

async function dispatch(page: Page, action: Record<string, unknown>) {
  await page.evaluate(async (nextAction) => {
    const { studioPuckEditorCommands } = await import('/src/features/editor/puck-editor-runtime.ts');
    studioPuckEditorCommands.dispatch(nextAction as Parameters<typeof studioPuckEditorCommands.dispatch>[0]);
  }, action);
}

test.describe('M06.6 breadcrumbs and context actions', () => {
  test('copies canonical subtree, persists visibility and reusable block, and keeps lock session-only', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m06-6-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 60_000 });
    const palette = page.locator('[data-studio-palette]');
    await palette.locator('[data-palette-item="palette.layout.container"] .ec-palette-item-main').click();
    await palette.locator('[data-palette-item="palette.basic.text"] .ec-palette-item-main').click();

    await expect
      .poll(async () => {
        const screen = (await readDocuments(page, projectId)).find((document) => document.kind === 'screen');
        return screen?.root?.children?.length;
      })
      .toBe(2);

    const screen = (await readDocuments(page, projectId)).find((document) => document.kind === 'screen');
    const root = screen?.root?.children ?? [];
    const containerIndex = root.findIndex((node) => node.componentRef === 'Container');
    const textIndex = root.findIndex((node) => node.componentRef === 'Text');
    const containerId = root[containerIndex]?.id;
    expect(containerId).toBeTruthy();

    await dispatch(page, {
      type: 'move',
      sourceIndex: textIndex,
      sourceZone: 'root:default-zone',
      destinationIndex: 0,
      destinationZone: `${containerId}:children`,
    });
    await dispatch(page, {
      type: 'setUi',
      ui: { itemSelector: { index: 0, zone: `${containerId}:children` } },
    });

    const breadcrumbs = page.getByRole('navigation', { name: 'Jerarquía del componente seleccionado' });
    await expect(breadcrumbs).toContainText('Página');
    await expect(breadcrumbs).toContainText('Contenedor');
    await expect(breadcrumbs).toContainText('Texto');

    const pastedId = await page.evaluate(async () => {
      const { studioPuckContextControls } = await import('/src/features/editor/puck-editor-runtime.ts');
      studioPuckContextControls.copy();
      return studioPuckContextControls.paste();
    });

    await expect
      .poll(async () => {
        const current = (await readDocuments(page, projectId)).find((document) => document.kind === 'screen');
        return current?.root?.children?.find((node) => node.componentRef === 'Container')?.children?.length;
      })
      .toBe(2);

    const copiedIds = (await readDocuments(page, projectId))
      .find((document) => document.kind === 'screen')
      ?.root?.children?.find((node) => node.componentRef === 'Container')
      ?.children?.map((node) => node.id);
    expect(new Set(copiedIds).size).toBe(2);
    expect(copiedIds).toContain(pastedId);

    const reusableId = await page.evaluate(async () => {
      const { studioPuckContextControls } = await import('/src/features/editor/puck-editor-runtime.ts');
      studioPuckContextControls.setVisible(false);
      const blockId = studioPuckContextControls.saveAsBlock();
      studioPuckContextControls.toggleLock();
      return blockId;
    });

    await expect
      .poll(async () => {
        const documents = await readDocuments(page, projectId);
        const current = documents.find((document) => document.kind === 'screen');
        const pasted = current?.root?.children
          ?.find((node) => node.componentRef === 'Container')
          ?.children?.find((node) => node.id === pastedId);
        const reusable = documents.find((document) => document.id === reusableId);
        return {
          visibility: pasted?.style?.base?.visibility,
          reusableKind: reusable?.kind,
          reusableRoot: reusable?.root?.componentRef,
        };
      })
      .toEqual({ visibility: 'hidden', reusableKind: 'reusable-component', reusableRoot: 'Text' });

    const locked = await page.evaluate(async (id) => {
      const { studioPuckContextControls } = await import('/src/features/editor/puck-editor-runtime.ts');
      return studioPuckContextControls.getSnapshot().lockedIds.includes(id);
    }, pastedId);
    expect(locked).toBe(true);

    await page.reload();
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 60_000 });
    const reopened = await readDocuments(page, projectId);
    expect(reopened.find((document) => document.kind === 'screen')).toBeTruthy();
    expect(reopened.find((document) => document.id === reusableId)?.kind).toBe('reusable-component');
    const serialized = JSON.stringify(reopened);
    expect(serialized).not.toMatch(/clipboardAvailable|lockedIds|blockSaverConnected|AppState|"history"|"ui"|"zones"/);
  });
});
