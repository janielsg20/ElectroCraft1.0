import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('M06.5 advanced selection boundary', () => {
  it('keeps the multi-selection overlay session-only instead of copying Puck state', () => {
    const controls = read('packages/editor-puck/src/puck-advanced-selection.ts');

    expect(controls).toContain('selectedIds');
    expect(controls).toContain('primaryId');
    expect(controls).not.toContain("from '@puckeditor/core'");
    expect(controls).not.toMatch(/\bData\b|\bAppState\b|history:/);
  });

  it('uses documented Puck actions for group and ungroup without replacing the editor engine', () => {
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(composition).toContain("type: 'insert'");
    expect(composition).toContain("type: 'move'");
    expect(composition).toContain("type: 'remove'");
    expect(composition).toContain('getSelectorForId');
    expect(composition).toContain('getItemById');
    expect(composition).not.toContain('componentOverlay');
    expect(composition).not.toContain('overrides:');
  });

  it('projects explicit resizable metadata and keeps Text non-resizable', () => {
    const adapter = read('packages/editor-puck/src/puck-component-adapter.ts');
    const core = read('apps/studio/src/features/editor/puck-core-components.tsx');

    expect(adapter).toContain('electrocraftResizable: definition.metadata.resizable === true');
    expect(core).toContain("resizable: key !== 'Text'");
    expect(core).toContain("'aria-keyshortcuts': 'Shift+Enter'");
    expect(core).toContain('puckAdvancedSelectionControls.toggle(nodeId)');
  });

  it('renders visible recovery diagnostics and a keyboard-accessible contextual toolbar', () => {
    const overlay = read('packages/editor-puck/src/puck-canvas-guide-overlay.tsx');

    expect(overlay).toContain('data-advanced-selection-toolbar');
    expect(overlay).toContain('role="toolbar"');
    expect(overlay).toContain('Agrupar');
    expect(overlay).toContain('Desagrupar');
    expect(overlay).toContain('Aplicar tamaño');
    expect(overlay).toContain('role="alert"');
  });
});
