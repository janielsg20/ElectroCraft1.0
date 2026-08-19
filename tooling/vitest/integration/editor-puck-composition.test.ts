import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('M03.5 Studio/Puck structural composition', () => {
  it('maps Context, Canvas and Inspector to public Puck composition surfaces', () => {
    const source = read('apps/studio/src/shell/editor-workspace.tsx');

    expect(source).toContain('<PuckEditorComponents />');
    expect(source).toContain('<PuckEditorOutline />');
    expect(source).toContain('<PuckEditorPreview id="electrocraft-editor-preview" />');
    expect(source).toContain('<PuckEditorFields wrapFields={false} />');
  });

  it('uses Sheet for secondary tools instead of compressing the desktop editor', () => {
    const source = read('apps/studio/src/shell/editor-workspace.tsx');
    const css = read('apps/studio/src/shell/editor-workspace.css');

    expect(source).toContain('<ToolSheet');
    expect(source).toContain("mode === 'desktop'");
    expect(css).toContain('grid-template-columns: 240px minmax(0, 1fr)');
    expect(css).toContain('@media (max-width: 1023px)');
    expect(css).toContain('@media (max-width: 767px)');
  });
});
