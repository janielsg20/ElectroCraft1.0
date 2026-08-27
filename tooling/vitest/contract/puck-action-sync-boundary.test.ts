import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(resolve(path), 'utf8');
}

describe('M05.4 Puck action synchronization boundary', () => {
  it('observes the public Puck onAction snapshots behind editor-puck', () => {
    const adapter = source('packages/editor-puck/src/puck-action-sync.ts');
    const composition = source('packages/editor-puck/src/puck-editor-composition.ts');
    const studio = source('apps/studio/src/features/editor/puck-action-sync.ts');

    expect(adapter).toContain("ComponentProps<typeof Puck>['onAction']");
    expect(adapter).toContain('appState.data');
    expect(adapter).toContain('prevAppState.data');
    expect(studio).toContain('resolvePuckDocumentActionChange');
    expect(studio).toContain('options.persistence.apply(change.data)');
    expect(composition).toContain('api.appState.data.content.length > 0');
  });

  it('reuses F04 autosave without adding a second debounce or Project Revision path', () => {
    const runtime = source('apps/studio/src/features/editor/puck-editor-runtime.ts');
    const persistence = source('apps/studio/src/features/editor/puck-document-persistence.ts');
    const autosave = source('apps/studio/src/features/projects/project-storage-autosave.ts');

    expect(runtime).toContain('createStudioPuckDocumentPersistenceBridge');
    expect(persistence).toContain('autosave.queueAutosave');
    expect(autosave).toContain('DEFAULT_PROJECT_AUTOSAVE_DEBOUNCE_MS = 650');
    expect(runtime).not.toContain('setTimeout(');
    expect(runtime).not.toContain('saveRevision');
    expect(persistence).not.toContain('saveRevision');
  });

  it('mounts the visible current editor shell with canonical runtime data and action sync', () => {
    const workspace = source('apps/studio/src/shell/editor-workspace.tsx');

    expect(workspace).toContain('useStudioPuckEditorRuntime');
    expect(workspace).toContain('config={runtime.config}');
    expect(workspace).toContain('data={runtime.data}');
    expect(workspace).toContain('onAction={runtime.onAction}');
    expect(workspace).toContain('data-editor-sync-state={runtime.state}');
    expect(workspace).not.toContain('config={structuralPuckConfig}');
    expect(workspace).not.toContain('data={structuralPuckData}');
  });
});
