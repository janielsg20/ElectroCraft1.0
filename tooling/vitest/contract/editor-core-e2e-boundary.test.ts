import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('M05.8 editor core ownership boundary', () => {
  it('loads one canonical core registry into the existing Studio Puck runtime', () => {
    const hook = read('apps/studio/src/features/editor/use-puck-editor-runtime.ts');
    const registry = read('apps/studio/src/features/editor/studio-core-components.ts');

    expect(hook).toContain('definitions: studioCoreComponentDefinitions');
    expect(hook).toContain('renderers: studioCorePuckRenderers');
    expect(registry).toContain('electroCraftComponentDefinitionSchema.parse');
    for (const component of ['Container', 'Text', 'Image', 'Button']) {
      expect(registry).toContain(`'${component}'`);
    }
    expect(registry).not.toContain("from '@puckeditor/core'");
    expect(registry).not.toContain('AppState');
    expect(registry).not.toContain('ProjectRevision');
  });

  it('keeps public Puck composition and existing history/autosave bridges as owners', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const runtime = read('apps/studio/src/features/editor/puck-editor-runtime.ts');
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');

    expect(workspace).toContain('<PuckEditorOutline />');
    expect(workspace).toContain('<PuckEditorPreview id="electrocraft-editor-preview" />');
    expect(workspace).toContain('<PuckEditorFields wrapFields={false} />');
    expect(runtime).toContain('createStudioPuckActionSync');
    expect(runtime).toContain('createStudioPuckDocumentPersistenceBridge');
    expect(composition).toContain('puckEditorHistoryControls');
    expect(composition).toContain('api.history.back');
    expect(composition).toContain('api.history.forward');
  });

  it('requires the repository E2E to cover insert/edit/history/save-reopen plus canonical nesting', () => {
    const e2e = read('tooling/playwright/m05-8-editor-core.spec.ts');

    expect(e2e).toContain('palette.layout.container');
    expect(e2e).toContain('palette.basic.text');
    expect(e2e).toContain('palette.basic.image');
    expect(e2e).toContain('palette.basic.button');
    expect(e2e).toContain('data-puck-history-action');
    expect(e2e).toContain('flushAutosave');
    expect(e2e).toContain('page.reload()');
    expect(e2e).toContain("componentRef: 'Container'");
    expect(e2e).toContain("componentRef: 'Text'");
    expect(e2e).not.toContain('localStorage.setItem("puck');
  });
});
