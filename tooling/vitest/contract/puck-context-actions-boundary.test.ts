import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('M06.6 context actions boundary', () => {
  it('keeps clipboard and locks session-only and canonical', () => {
    const controls = read('packages/editor-puck/src/puck-context-controls.ts');

    expect(controls).toContain('ElectroCraftDocumentNode');
    expect(controls).toContain('clipboard: ElectroCraftDocumentNode | null');
    expect(controls).toContain('lockedIds = new Set<string>()');
    expect(controls).not.toContain("from '@puckeditor/core'");
    expect(controls).not.toMatch(/\bAppState\b|\bData\b|history:/);
  });

  it('derives breadcrumbs and materializes clipboard content through public Puck APIs', () => {
    const bridge = read('packages/editor-puck/src/puck-context-bridge.tsx');

    expect(bridge).toContain("{ id: 'root', label: 'Página' }");
    expect(bridge).toContain('getItemById');
    expect(bridge).toContain('getSelectorForId');
    expect(bridge).toContain("type: 'insert'");
    expect(bridge).toContain("type: 'replace'");
    expect(bridge).toContain("type: 'duplicate'");
    expect(bridge).toContain("type: 'remove'");
    expect(bridge).not.toContain('appState');
  });

  it('maps per-instance lock to stable Puck dynamic permissions', () => {
    const adapter = read('packages/editor-puck/src/puck-component-adapter.ts');
    const bridge = read('packages/editor-puck/src/puck-context-bridge.tsx');

    expect(adapter).toContain('resolvePermissions(data, { permissions: inheritedPermissions })');
    expect(adapter).toContain('puckContextControls.isLocked(id)');
    expect(adapter).toContain('drag: false');
    expect(adapter).toContain('delete: false');
    expect(adapter).toContain('duplicate: false');
    expect(adapter).toContain('edit: false');
    expect(bridge).toContain('refreshPermissions');
  });

  it('persists visibility in canonical Style instead of editor UI state', () => {
    const model = read('packages/domain/src/contracts/component-definition.ts');
    const bridge = read('packages/editor-puck/src/puck-context-bridge.tsx');
    const presentation = read('apps/studio/src/features/editor/advanced/presentation-style.ts');

    expect(model).toContain("visibility: z.enum(['visible', 'hidden'])");
    expect(bridge).toContain("visibility: hidden ? 'hidden' : 'visible'");
    expect(presentation).toContain("if (declaration.visibility === 'hidden') resolved.display = 'none'");
    expect(presentation).not.toContain("declaration.visibility === 'hidden' ? 'none' : undefined");
  });

  it('exposes persistent Spanish breadcrumbs and context actions without experimental Puck overrides', () => {
    const overlay = read('packages/editor-puck/src/puck-canvas-guide-overlay.tsx');

    expect(overlay).toContain('data-canvas-context-bar');
    expect(overlay).toContain('Jerarquía del componente seleccionado');
    for (const action of ['Copiar', 'Pegar', 'Duplicar', 'Ocultar', 'Bloquear', 'Eliminar']) {
      expect(overlay).toContain(action);
    }
    expect(overlay).not.toContain('componentOverlay');
    expect(overlay).not.toContain('overrides:');
  });
});
