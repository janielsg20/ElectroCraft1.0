import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('M05.8 editor core ownership boundary', () => {
  it('loads one canonical core kit into the existing Studio Puck runtime', () => {
    const runtime = read('apps/studio/src/features/editor/puck-editor-runtime.ts');
    const kit = read('apps/studio/src/features/editor/puck-core-components.tsx');

    expect(runtime).toContain('studioCoreEditorDefinitions');
    expect(runtime).toContain('studioCoreEditorRenderers');
    expect(runtime).toContain('options.definitions ?? studioCoreEditorDefinitions');
    expect(runtime).toContain('options.renderers ?? studioCoreEditorRenderers');
    expect(kit).toContain('electroCraftComponentDefinitionSchema.parse');
    for (const component of ['Container', 'Text', 'Image', 'Button']) {
      expect(kit).toContain(`'${component}'`);
    }
    expect(kit).not.toContain("from '@puckeditor/core'");
    expect(kit).not.toContain('dangerouslySetInnerHTML');
  });

  it('keeps public Puck composition, command, history and autosave bridges as owners', () => {
    const workspace = read('apps/studio/src/shell/editor-workspace.tsx');
    const runtime = read('apps/studio/src/features/editor/puck-editor-runtime.ts');
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');
    const commands = read('packages/editor-puck/src/puck-command-controls.ts');

    expect(workspace).toContain('<PuckEditorOutline />');
    expect(workspace).toContain('<PuckEditorPreview id="electrocraft-editor-preview" />');
    expect(workspace).toContain('<PuckEditorFields wrapFields={false} />');
    expect(runtime).toContain('createStudioPuckActionSync');
    expect(runtime).toContain('createStudioPuckDocumentPersistenceBridge');
    expect(composition).toContain('puckEditorHistoryControls');
    expect(composition).toContain('puckEditorCommandControls.connect(dispatch)');
    expect(commands).toContain('let activeDispatch');
    expect(commands).not.toContain('activeData');
    expect(commands).not.toContain('activeState');
    expect(commands).not.toContain('histories');
  });

  it('requires the repository E2E to cover insert/edit/history/save-reopen plus canonical nesting', () => {
    const e2e = read('tooling/playwright/m05-8-editor-core.spec.ts');

    expect(e2e).toContain('palette.layout.container');
    expect(e2e).toContain('palette.basic.text');
    expect(e2e).toContain('palette.basic.image');
    expect(e2e).toContain('palette.basic.button');
    expect(e2e).toContain('data-puck-history-action');
    expect(e2e).toContain('runtime.persistence.apply(data)');
    expect(e2e).toContain('flushAutosave');
    expect(e2e).toContain('page.reload()');
    expect(e2e).toContain("componentRef: 'Container'");
    expect(e2e).toContain("componentRef: 'Text'");
    expect(e2e).not.toContain('localStorage.setItem("puck');
  });
});
