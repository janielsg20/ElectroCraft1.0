import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('M06.7 mobile/tablet editor tools boundary', () => {
  it('mounts one PuckEditorRoot and reuses the same composition surfaces for every layout', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');

    expect(workspace.match(/<PuckEditorRoot/g)).toHaveLength(1);
    expect(workspace).toContain('<PuckEditorPreview');
    expect(workspace).toContain('<ComponentsContent />');
    expect(workspace).toContain('<OutlineContent />');
    expect(workspace).toContain('<InspectorContent />');
    expect(workspace).not.toMatch(/MobilePuck|TabletPuck|mobileEditorStore|tabletEditorStore/);
  });

  it('preserves the exact mobile dock destinations and sheet ownership', () => {
    const model = read('apps/studio/src/shell/editor-layout-model.ts');
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');

    for (const destination of ['components', 'screens', 'canvas', 'properties', 'more']) {
      expect(model).toContain(`'${destination}'`);
      expect(workspace).toContain(`data-mobile-destination="${destination}"`);
    }
    expect(workspace).toContain('side="bottom"');
    expect(workspace).toContain('data-editor-mobile-sheet="properties"');
    expect(workspace).toContain('data-editor-mobile-sheet="outline"');
  });

  it('keeps the click-to-insert keyboard alternative and advanced overlays inside the same adapter boundary', () => {
    const palette = read('apps/studio/src/shell/palette-panel.tsx');
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');
    const css = read('apps/studio/src/features/editor/puck-composition.css');

    expect(palette).toContain('usePuckPaletteInsert');
    expect(composition).toContain('usePuckPaletteInsert');
    expect(composition).toContain('Puck.Preview');
    expect(css).toContain('.ec-puck-preview-with-guides');
    expect(css).toContain('@media (max-width: 767px)');
    expect(css).toContain('min-height: 44px');
  });
});
