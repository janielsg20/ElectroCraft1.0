import { expect, test, type Page } from '@playwright/test';

interface StoredDocument {
  readonly root?: {
    readonly children?: Array<{
      readonly style?: {
        readonly platform?: {
          readonly android?: { readonly width?: { readonly value?: number; readonly unit?: string } | null };
        };
      } | null;
    }>;
  };
}

async function seedProject(page: Page, projectId: string) {
  await page.goto('/');
  await page.evaluate(async (id) => {
    const { projectStorageRuntime } = await import('/src/features/projects/project-storage-runtime.ts');
    const { workspacePreferencesRuntime } = await import('/src/features/projects/workspace-preferences-runtime.ts');
    await projectStorageRuntime.initialize();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Platform overrides M06.3', metadata: { source: 'm06.3-e2e' } },
      objects: [],
      reason: 'm06.3-seed',
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

test.describe('M06.3 platform overrides', () => {
  test('authors an Android-only property and previews it without leaking editor context', async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1600, height: 900 });
    const projectId = `m06-3-${Date.now()}`;
    await seedProject(page, projectId);
    await page.goto('/editor');

    const workspace = page.locator('.ec-editor-workspace');
    await expect(workspace).toHaveAttribute('data-editor-sync-state', 'ready', { timeout: 120_000 });
    await page.locator('[data-palette-item="palette.layout.container"] .ec-palette-item-main').click();
    await dispatch(page, { type: 'setUi', ui: { itemSelector: { index: 0, zone: 'root:default-zone' } } });
    await page.locator('.ec-editor-panel-tab').filter({ hasText: 'Diseño' }).click();

    await page.getByLabel('Plataforma').first().click();
    await page.getByRole('option', { name: 'Android', exact: true }).click();

    const inspector = page.locator('[data-puck-layout-style-inspector]');
    await inspector.getByRole('tab', { name: 'Plataforma', exact: true }).click();
    await expect(inspector.locator('[data-platform-diagnostic="adapted"]')).toContainText('Adaptado');
    await inspector.getByLabel('Ancho en píxeles').fill('320');

    await expect
      .poll(
        async () => (await readDocument(page, projectId))?.root?.children?.[0]?.style?.platform?.android?.width?.value,
        { timeout: 60_000 },
      )
      .toBe(320);

    const preview = page.locator('[data-puck-composition="preview"] iframe').contentFrame();
    const container = preview.locator('[data-ec-core-component="Container"]');
    await expect(container).toHaveCSS('width', '320px');

    await page.getByLabel('Plataforma').first().click();
    await page.getByRole('option', { name: 'Web', exact: true }).click();
    await expect(container).not.toHaveCSS('width', '320px');

    const stored = await readDocument(page, projectId);
    expect(JSON.stringify(stored)).not.toMatch(/puckPlatformControls|itemSelector|AppState/);
  });
});
