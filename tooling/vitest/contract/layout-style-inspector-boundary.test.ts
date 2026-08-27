import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('M06.1 Layout/Style inspector ownership boundary', () => {
  it('keeps Puck selection and replace dispatch inside editor-puck', () => {
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');
    const studio = read('apps/studio/src/features/editor/advanced/layout-style-inspector.tsx');
    expect(adapter).toContain('api.selectedItem');
    expect(adapter).toContain("type: 'replace'");
    expect(adapter).toContain('getSelectorForId');
    expect(studio).not.toMatch(/@puckeditor\/core|itemSelector|AppState|useState\(/);
  });

  it('replaces the placeholder with Spanish, accessible, persistent-help controls', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const studio = read('apps/studio/src/features/editor/advanced/layout-style-inspector.tsx');
    const css = read('apps/studio/src/features/editor/advanced/layout-style-inspector.css');
    expect(workspace).toContain('<LayoutStyleInspector />');
    expect(workspace).not.toContain('data-inspector-advanced-placeholder');
    for (const copy of ['Diseño', 'Estilo', 'Restablecer', 'Heredado de', 'Fila', 'Columna', 'Cuadrícula']) {
      expect(studio).toContain(copy);
    }
    expect(studio).toContain('data-help-id="help.editor.advanced"');
    expect(studio).toContain('aria-label="Regla de disposición"');
    expect(css).toContain('min-height: 44px');
  });

  it('keeps raw CSS and responsive authoring out of the M06.1 inspector', () => {
    const studio = read('apps/studio/src/features/editor/advanced/layout-style-inspector.tsx');
    expect(studio).not.toMatch(/className.*onChange|cssText|mediaQuery|breakpoint/);
    expect(studio).toContain("kind: 'token'");
  });
});
