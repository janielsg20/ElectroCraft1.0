import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('M05.2 Puck composition boundary', () => {
  it('keeps Components, Outline, Preview and Fields behind the editor-puck adapter', () => {
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const palette = read('apps/studio/src/shell/palette-panel.tsx');

    expect(adapter).toContain('Puck.Components');
    expect(adapter).toContain('Puck.Outline');
    expect(adapter).toContain('Puck.Preview');
    expect(adapter).toContain('Puck.Fields');
    expect(workspace).not.toContain("from '@puckeditor/core'");
    expect(palette).not.toContain("from '@puckeditor/core'");
  });

  it('uses public Composition surfaces in the canonical Studio regions', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');

    for (const surface of ['components', 'outline', 'preview', 'fields']) {
      expect(workspace).toContain(`data-puck-composition="${surface}"`);
    }
    expect(workspace).toContain('<PuckEditorOutline />');
    expect(workspace).toContain('<PuckEditorPreview');
    expect(workspace).toContain('<PuckEditorFields wrapFields={false} />');
  });

  it('maps Studio design tokens to documented Puck custom properties', () => {
    const theme = read('apps/studio/src/features/editor/puck-composition.css');

    expect(theme).toContain('--puck-color-surface: var(--surface)');
    expect(theme).toContain('--puck-color-border: var(--border)');
    expect(theme).toContain('--puck-color-text: var(--foreground)');
    expect(theme).toContain('--puck-color-interactive: var(--primary)');
    expect(theme).toContain('--puck-color-focus-ring: var(--ring)');
  });

  it('isolates the project preview iframe from host Studio styles', () => {
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(adapter).toContain('enabled: true');
    expect(adapter).toContain('waitForStyles: true');
    expect(adapter).toContain('syncHostStyles: false');
    expect(adapter).not.toContain('overrides:');
    expect(adapter).not.toContain('Puck AI');
  });

  it('derives click insertion availability from the active Puck config without a second registry', () => {
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');
    const palette = read('apps/studio/src/shell/palette-panel.tsx');

    expect(adapter).toContain('usePuckEditorConfig');
    expect(adapter).toContain('api.config');
    expect(palette).toContain('usePuckEditorConfig');
    expect(palette).toContain('Object.keys(activePuckConfig.components)');
    expect(palette).not.toContain('structuralPuckConfig');
  });
});
