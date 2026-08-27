import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M05.6 Puck inline editing ownership boundary', () => {
  it('uses public Puck text/richtext contentEditable instead of a direct-edit engine', () => {
    const adapter = read('packages/editor-puck/src/puck-component-adapter.ts');
    const session = read('apps/studio/src/features/editor/puck-document-session.ts');

    expect(adapter).toContain("Text: Object.freeze({ mode: 'text' as const })");
    expect(adapter).toContain("RichText: Object.freeze({ mode: 'richtext' as const })");
    expect(adapter).toContain("type: 'richtext', contentEditable: true");
    expect(adapter).toContain("type: 'text'");
    expect(adapter).toContain('contentEditable: true');
    expect(session).toContain('inlineEditing: electroCraftCorePuckInlineEditing');
    expect(session).not.toContain("from '@tiptap/");
    expect(session).not.toContain('contentEditable=');
  });

  it('keeps the canonical component field model owner-neutral and string based', () => {
    const canonical = read('packages/domain/src/contracts/component-definition.ts');
    const adapter = read('packages/editor-puck/src/puck-component-adapter.ts');

    expect(canonical).toContain("z.enum(['text', 'number', 'boolean', 'select'])");
    expect(canonical).not.toContain("'richtext'");
    expect(canonical).not.toContain('contentEditable');
    expect(adapter).toContain("field.kind !== 'text'");
  });

  it('does not add Studio keyboard interception or unsafe HTML rendering for inline authoring', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const actionCss = read('apps/studio/src/features/editor/puck-action-sync.css');
    const runtime = read('apps/studio/src/features/editor/puck-editor-runtime.ts');

    expect(workspace).not.toContain("addEventListener('keydown'");
    expect(workspace).not.toContain('onKeyDown=');
    expect(runtime).not.toContain("addEventListener('keydown'");
    expect(runtime).not.toContain('dangerouslySetInnerHTML');
    expect(actionCss).toContain("[contenteditable='true']:focus-visible");
    expect(actionCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('continues to reuse M05.4 canonical action synchronization and M05.5 Puck history', () => {
    const runtime = read('apps/studio/src/features/editor/puck-editor-runtime.ts');
    const actionSync = read('packages/editor-puck/src/puck-action-sync.ts');
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(runtime).toContain('createStudioPuckActionSync');
    expect(actionSync).toContain('appState.data');
    expect(actionSync).toContain('prevAppState.data');
    expect(composition).toContain('api.history.back');
    expect(composition).toContain('api.history.forward');
    expect(runtime).not.toContain('queueAutosave');
  });
});
