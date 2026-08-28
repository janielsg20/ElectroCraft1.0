import { expect, test, type Page } from '@playwright/test';

interface StoredNode {
  readonly id?: string;
  readonly componentRef?: string;
  readonly layout?: { readonly mode?: string; readonly gap?: unknown } | null;
  readonly style?: {
    readonly base?: { readonly padding?: unknown; readonly background?: unknown; readonly opacity?: number | null };
  } | null;
}

interface StoredDocument {
  readonly schemaVersion?: number;
  readonly root?: { readonly children?: StoredNode[] };
}

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Layout y estilo M06.1', metadata: { source: 'm06.1-e2e' } },
      objects: [],
      reason: 'm06.1-seed',
    });
    await workspacePreferencesRuntime.initialize();
    await workspacePreferencesRuntime.patchLayout({ lastDocumentId: id, lastTabs: [] });
  }, projectId);
}

async function dispatch(page: Page, action: Record<string, unknown>) {
  await page.evaluate(async (nextAction) => {
    const { studioPuckEditorCommands } = await import('/src/features/editor/puck-editor-runtime.ts');
    studioPuckEditorCommands.dispatch(nextAction as Parameters<typeof studioPuckEditorCommands.dispatch>[0]);
  }, action);
}

async function readDocument(page: Page, projectId: string): Promise<StoredDocument | null> {
  return page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    await projectStorageRuntime.flushAutosave();
    const opened = await projectStorageRuntime.openProject(id);
    return (
      (opened?.objects.find((object) => object.kind === 'document')?.payload as StoredDocument | undefined) ?? null
    );
  }, projectId);
}

test.describe('M06.1 Layout/Style inspector', () => {
  test('edits semantic presentation through Puck, history, autosave and reopen', async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m06-1-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 120_000 });
    await page.locator('[data-palette-item="palette.layout.container"] .ec-palette-item-main').click();
    await expect
      .poll(async () => (await readDocument(page, projectId))?.root?.children?.length, { timeout: 60_000 })
      .toBe(1);

    await dispatch(page, { type: 'setUi', ui: { itemSelector: { index: 0, zone: 'root:default-zone' } } });
    const advancedDisclosure = page.locator('[data-progressive-disclosure="inspector-advanced"]');
    await advancedDisclosure.locator('.ec-ia-disclosure-trigger').click();
    await expect(advancedDisclosure).toHaveAttribute('data-state', 'open');
    await page.locator('.ec-editor-panel-tab').filter({ hasText: 'Diseño' }).click();

    const inspector = page.locator('[data-puck-layout-style-inspector]');
    await expect(inspector).toBeVisible();
    await expect(inspector.locator('[data-help-id="help.editor.advanced"]')).toBeVisible();
    await inspector.getByRole('button', { name: 'Fila', exact: true }).click();
    await inspector.getByLabel('Separación entre elementos').click();
    await page.getByRole('option', { name: 'Espacio 2' }).click();

    await expect
      .poll(async () => (await readDocument(page, projectId))?.root?.children?.[0]?.layout, { timeout: 60_000 })
      .toMatchObject({
        mode: 'row',
        gap: { kind: 'token', token: 'spacing.2' },
      });

    await inspector.getByRole('tab', { name: 'Estilo', exact: true }).click();
    await inspector.getByLabel('Token de relleno').click();
    await page.getByRole('option', { name: 'Espacio 4' }).click();
    await inspector.getByLabel('Token de fondo').click();
    await page.getByRole('option', { name: 'Superficie' }).click();
    await inspector.getByLabel('Opacidad').fill('0.6');

    await expect
      .poll(async () => (await readDocument(page, projectId))?.root?.children?.[0]?.style?.base, { timeout: 60_000 })
      .toMatchObject({
        padding: { kind: 'token', token: 'spacing.4' },
        background: { kind: 'token', token: 'color.surface' },
        opacity: 0.6,
      });

    const preview = page.locator('[data-puck-composition="preview"] iframe').contentFrame();
    const container = preview.locator('[data-ec-core-component="Container"]');
    await expect(container).toHaveCSS('display', 'flex');
    await expect(container).toHaveCSS('flex-direction', 'row');
    await expect(container).toHaveCSS('opacity', '0.6');

    const undo = page.locator('[data-puck-history-action="undo"]').first();
    const redo = page.locator('[data-puck-history-action="redo"]').first();
    await undo.click();
    await expect(redo).toBeEnabled();
    await redo.click();
    await expect
      .poll(async () => (await readDocument(page, projectId))?.root?.children?.[0]?.style?.base?.opacity, {
        timeout: 60_000,
      })
      .toBe(0.6);

    await page.reload();
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 120_000 });
    const reopened = await readDocument(page, projectId);
    expect(reopened?.schemaVersion).toBe(4);
    expect(reopened?.root?.children?.[0]?.layout?.mode).toBe('row');
    expect(JSON.stringify(reopened)).not.toMatch(/__electrocraft|AppState|itemSelector|history|zones/);
  });
});
