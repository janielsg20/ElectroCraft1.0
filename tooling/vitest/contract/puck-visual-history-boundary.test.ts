import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M05.5 Puck visual history ownership boundary', () => {
  it('keeps Puck as history owner and uses only its public history API', () => {
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');
    const policy = read('packages/editor-puck/src/puck-history-policy.ts');
    const controls = read('packages/editor-puck/src/puck-history-controls.ts');

    expect(composition).toContain('api.history.hasPast');
    expect(composition).toContain('api.history.hasFuture');
    expect(composition).toContain('api.history.back');
    expect(composition).toContain('api.history.forward');
    expect(composition).toContain('api.history.setHistories');
    expect(composition).toContain('api.history.setHistoryIndex');
    expect(composition).toContain('PuckHistoryBridge');
    expect(policy).toContain('index !== histories.length - 1');
    expect(controls).not.toContain('histories:');
    expect(controls).not.toContain('AppState');
  });

  it('connects Topbar undo/redo without importing Puck into Studio', () => {
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');

    expect(topbar).toContain("from '@electrocraft/editor-puck'");
    expect(topbar).not.toContain("from '@puckeditor/core'");
    expect(topbar).toContain('data-puck-history-action="undo"');
    expect(topbar).toContain('data-puck-history-action="redo"');
    expect(topbar).toContain('disabled={!visualHistory.canUndo}');
    expect(topbar).toContain('disabled={!visualHistory.canRedo}');
    expect(topbar).toContain('<a href="/history">');
  });

  it('keeps visual history preference local to Studio and separate from Project Revisions', () => {
    const preference = read('packages/application/src/editor-visual-history-preferences.ts');
    const runtime = read('apps/studio/src/features/editor/editor-history-preferences-runtime.ts');
    const settings = read('apps/studio/src/features/editor/editor-settings.tsx');
    const persistence = read('apps/studio/src/features/editor/puck-document-persistence.ts');

    expect(preference).toContain("EDITOR_VISUAL_HISTORY_STORAGE_KEY = 'electrocraft.editor.visualHistoryLimit.v1'");
    expect(preference).toContain('defaultValue: 50');
    expect(preference).toContain('min: 1');
    expect(preference).toContain('max: 100');
    expect(runtime).toContain('window.localStorage');
    expect(settings).toContain('Historial visual');
    expect(settings).toContain('No modifica el Historial de versiones del proyecto.');
    expect(settings).toContain('help.section.editor');
    expect(persistence).not.toContain('visualHistoryLimit');
    expect(persistence).not.toContain('setHistories');
    expect(persistence).not.toContain('setHistoryIndex');
  });

  it('reuses M05.4 onAction synchronization instead of adding a second autosave path', () => {
    const actionSync = read('packages/editor-puck/src/puck-action-sync.ts');
    const composition = read('packages/editor-puck/src/puck-editor-composition.ts');
    const topbar = read('apps/studio/src/shell/studio-topbar.tsx');

    expect(actionSync).toContain('appState.data');
    expect(actionSync).toContain('prevAppState.data');
    expect(composition).not.toContain('queueAutosave');
    expect(topbar).not.toContain('queueAutosave');
    expect(topbar).not.toContain('setTimeout(');
    expect(topbar).not.toContain('setInterval(');
  });
});
