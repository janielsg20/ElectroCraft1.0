import { expect, test, type Page } from '@playwright/test';

interface StoredNode {
  readonly id?: string;
  readonly componentRef?: string;
  readonly style?: {
    readonly base?: {
      readonly width?: { readonly value?: number; readonly unit?: string } | null;
      readonly height?: { readonly value?: number; readonly unit?: string } | null;
    };
  } | null;
  readonly children?: StoredNode[];
}

interface StoredDocument {
  readonly root?: { readonly children?: StoredNode[] };
}

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Selección avanzada M06.5', metadata: { source: 'm06.5-e2e' } },
      objects: [],
      reason: 'm06.5-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

async function readDocument(page: Page, projectId: string): Promise<StoredDocument | null> {
  return page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.flushAutosave();
    const opened = await projectStorageRuntime.openProject(id);
    return (opened?.objects.find((object) => object.kind === 'document')?.payload as StoredDocument | undefined) ?? null;
  }, projectId);
}

test.describe('M06.5 advanced selection', () => {
  test('groups siblings, resizes the canonical group, ungroups and reopens without editor-only selection state', async ({
    page,
  }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m06-5-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 60_000 });
    const palette = page.locator('[data-studio-palette]');
    await palette.locator('[data-palette-item="palette.basic.text"] .ec-palette-item-main').click();
    await palette.locator('[data-palette-item="palette.basic.button"] .ec-palette-item-main').click();

    await expect.poll(async () => (await readDocument(page, projectId))?.root?.children?.length).toBe(2);
    const initial = (await readDocument(page, projectId))?.root?.children ?? [];
    const firstId = initial[0]?.id;
    const secondId = initial[1]?.id;
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();

    const groupId = await page.evaluate(
      async ({ first, second }) => {
        const { studioPuckAdvancedSelection } = await import('/src/features/editor/puck-editor-runtime.ts');
        studioPuckAdvancedSelection.selectOnly(first);
        studioPuckAdvancedSelection.toggle(second);
        return studioPuckAdvancedSelection.group();
      },
      { first: firstId!, second: secondId! },
    );

    await expect
      .poll(async () => {
        const root = (await readDocument(page, projectId))?.root?.children ?? [];
        return {
          count: root.length,
          ref: root[0]?.componentRef,
          childCount: root[0]?.children?.length,
        };
      })
      .toEqual({ count: 1, ref: 'Container', childCount: 2 });

    await expect(page.locator('[data-advanced-selection-toolbar]')).toContainText('1 elemento seleccionado');

    await page.evaluate(async () => {
      const { studioPuckAdvancedSelection } = await import('/src/features/editor/puck-editor-runtime.ts');
      studioPuckAdvancedSelection.resize(360, 200);
    });
    await expect
      .poll(async () => {
        const group = (await readDocument(page, projectId))?.root?.children?.[0];
        return { width: group?.style?.base?.width?.value, height: group?.style?.base?.height?.value };
      })
      .toEqual({ width: 360, height: 200 });

    const childIds = await page.evaluate(async () => {
      const { studioPuckAdvancedSelection } = await import('/src/features/editor/puck-editor-runtime.ts');
      return [...studioPuckAdvancedSelection.ungroup()];
    });
    expect(childIds).toHaveLength(2);

    await expect
      .poll(async () => (await readDocument(page, projectId))?.root?.children?.map((node) => node.componentRef).sort())
      .toEqual(['Button', 'Text']);

    const blockedResizeMessage = await page.evaluate(async (id) => {
      const { studioPuckAdvancedSelection } = await import('/src/features/editor/puck-editor-runtime.ts');
      studioPuckAdvancedSelection.selectOnly(id);
      try {
        studioPuckAdvancedSelection.resize(999, null);
      } catch {
        return studioPuckAdvancedSelection.getSnapshot().message;
      }
      return null;
    }, childIds.find((id) => (initial.find((node) => node.id === id)?.componentRef ?? '') === 'Text') ?? childIds[0]);
    expect(blockedResizeMessage).toMatch(/no declara resize compatible/i);

    await page.reload();
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 60_000 });
    const reopened = JSON.stringify(await readDocument(page, projectId));
    expect(reopened).not.toContain(groupId);
    expect(reopened).not.toMatch(/selectedIds|primaryId|AppState|"history"|"ui"|"zones"/);
  });
});
