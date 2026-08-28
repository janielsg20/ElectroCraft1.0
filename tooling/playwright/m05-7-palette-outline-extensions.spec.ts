import { expect, test } from '@playwright/test';

const PALETTE_PREFERENCES_STORAGE_KEY = 'electrocraft.workspace.palette.v1';

test.describe('M05.7 Palette and Outline extensions', () => {
  test('keeps search, favorites and recents as workspace discovery around the Puck source', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto('/editor');
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          favorites: ['palette.basic.text'],
          recent: ['palette.layout.container'],
        }),
      );
    }, PALETTE_PREFERENCES_STORAGE_KEY);
    await page.reload();

    const palette = page.locator('[data-studio-palette]');
    await expect(palette).toBeVisible();
    await expect(palette).toHaveAttribute('data-palette-extension-mode', 'electro');
    await expect(palette.locator('[data-palette-item="palette.basic.text"]').first()).toBeVisible();
    await expect(palette.locator('[data-palette-item="palette.layout.container"]').first()).toBeVisible();

    const search = palette.locator('input[type="search"]');
    await search.fill('texto enriquecido');
    await expect(palette.locator('[data-palette-item="palette.basic.rich-text"]')).toBeVisible();
    await expect(palette.locator('[data-palette-item="palette.layout.container"]')).toHaveCount(0);
  });

  test('projects canonical categories into the Puck config without persisting outline UI state', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      const { createStudioPuckDocumentSession } = await import('/src/features/editor/puck-document-session.ts');
      const emptyStyle = {
        schemaVersion: 1 as const,
        base: {
          width: null,
          height: null,
          minWidth: null,
          maxWidth: null,
          gap: null,
          padding: null,
          margin: null,
          fontSize: null,
          fontWeight: null,
          textAlign: null,
          foreground: null,
          background: null,
          opacity: null,
        },
        responsive: {},
        platform: {},
      };
      const definition = (key: string, category: string, id: string) => ({
        schemaVersion: 1 as const,
        id,
        version: 1,
        key,
        label: key,
        category,
        fields: [],
        defaultProps: {},
        layout: {
          mode: 'flow' as const,
          gap: null,
          align: 'stretch' as const,
          justify: 'start' as const,
          wrap: false,
          columns: null,
        },
        style: emptyStyle,
        references: { componentRefs: [], assetRefs: [], actionRefs: [] },
        metadata: {},
      });
      const document = {
        schemaVersion: 4 as const,
        id: 'ec_document_0000000000570',
        version: 1,
        name: 'Palette M05.7',
        kind: 'screen' as const,
        root: {
          id: 'ec_node_0000000000571',
          componentRef: 'core.root',
          props: {},
          children: [],
        },
        references: { documentRefs: [] },
        metadata: {},
        formMeta: null,
        templateMeta: null,
      };
      const definitions = [
        definition('Text', 'Basic', 'ec_component_0000000000572'),
        definition('RichText', 'Basic', 'ec_component_0000000000573'),
        definition('Container', 'Layout', 'ec_component_0000000000574'),
      ];
      const session = createStudioPuckDocumentSession(
        document as Parameters<typeof createStudioPuckDocumentSession>[0],
        definitions as Parameters<typeof createStudioPuckDocumentSession>[1],
        { Text: () => null, RichText: () => null, Container: () => null },
      );
      const serialized = JSON.stringify(session.reconstruct(session.data).document);

      return {
        categories: session.config.categories,
        leakedUi: serialized.includes('"ui"'),
        leakedOutline: serialized.toLowerCase().includes('outline'),
        leakedFavorites: serialized.includes('favorites'),
        leakedRecent: serialized.includes('recent'),
      };
    });

    expect(result.categories?.Basic).toMatchObject({ components: ['Text', 'RichText'] });
    expect(result.categories?.Layout).toMatchObject({ components: ['Container'] });
    expect(result.categories?.__electrocraftDiagnostics).toMatchObject({ visible: false });
    expect(result.leakedUi).toBe(false);
    expect(result.leakedOutline).toBe(false);
    expect(result.leakedFavorites).toBe(false);
    expect(result.leakedRecent).toBe(false);
  });
});
