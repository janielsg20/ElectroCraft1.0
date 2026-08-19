import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('M03.5 editor ownership contract', () => {
  it('keeps Puck imports inside the editor-puck owner', () => {
    const studio = read('apps/studio/src/shell/editor-workspace.tsx');
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(studio).not.toContain('@puckeditor/core');
    expect(studio).toContain("from '@electrocraft/editor-puck'");
    expect(adapter).toContain("from '@puckeditor/core'");
    expect(adapter).toContain('PuckEditorPreview = Puck.Preview');
    expect(adapter).toContain('PuckEditorFields = Puck.Fields');
  });

  it('does not invent publishing, persistence or demo widgets in the structural microphase', () => {
    const studio = read('apps/studio/src/shell/editor-workspace.tsx');
    const adapter = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(studio).not.toMatch(/onPublish|localStorage|indexedDB|PGlite|demoWidget/i);
    expect(adapter).toContain('components: {}');
    expect(adapter).toContain('content: []');
  });
});
