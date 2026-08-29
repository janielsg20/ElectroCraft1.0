import {
  puckContextControls,
  structuralPuckConfig,
  structuralPuckData,
  type PuckEditorConfig,
  type PuckEditorData,
  type PuckEditorOnAction,
} from '@electrocraft/editor-puck';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { editorScreenSelectionRuntime } from '../navigation/editor-screen-selection-runtime';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { workspacePreferencesRuntime } from '../projects/workspace-preferences-runtime';
import { loadStudioPuckEditor, type StudioPuckEditorRuntime } from './puck-editor-runtime';

export type StudioPuckEditorRuntimeState = 'empty' | 'loading' | 'ready' | 'blocked';

interface RuntimeSnapshot {
  readonly state: StudioPuckEditorRuntimeState;
  readonly runtime: StudioPuckEditorRuntime | null;
  readonly message: string;
}

const emptySnapshot: RuntimeSnapshot = Object.freeze({
  state: 'empty',
  runtime: null,
  message: 'Abre un proyecto para sincronizar el editor visual.',
});

function activeProjectId(lastProjectId: string | null) {
  return projectStorageRuntime.currentProjectId() ?? lastProjectId;
}

export function useStudioPuckEditorRuntime() {
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const screenSelection = useSyncExternalStore(
    editorScreenSelectionRuntime.subscribe,
    editorScreenSelectionRuntime.getSnapshot,
    editorScreenSelectionRuntime.getSnapshot,
  );
  const projectId = activeProjectId(preferences.layout.lastDocumentId);
  const screenId = screenSelection.screenId;
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(() =>
    projectId
      ? Object.freeze({ state: 'loading', runtime: null, message: 'Cargando Pantalla del editor…' })
      : emptySnapshot,
  );

  useEffect(() => {
    let active = true;
    let loadedRuntime: StudioPuckEditorRuntime | null = null;
    puckContextControls.clearSessionLocks();
    if (!projectId) {
      setSnapshot(emptySnapshot);
      return () => {
        active = false;
      };
    }

    setSnapshot(Object.freeze({ state: 'loading', runtime: null, message: 'Cargando Pantalla del editor…' }));
    void loadStudioPuckEditor({
      projectId,
      documentId: screenId ?? undefined,
      onSynchronized: () => {
        if (!active) return;
        setSnapshot((current) =>
          current.runtime
            ? Object.freeze({ state: 'ready', runtime: current.runtime, message: 'Pantalla sincronizada.' })
            : current,
        );
      },
      onError: (error) => {
        if (!active) return;
        setSnapshot((current) =>
          Object.freeze({
            state: 'blocked',
            runtime: current.runtime,
            message: error.message || 'No se pudo sincronizar la Pantalla.',
          }),
        );
      },
    })
      .then((runtime) => {
        loadedRuntime = runtime;
        if (!active) {
          runtime.dispose();
          return;
        }
        setSnapshot(Object.freeze({ state: 'ready', runtime, message: 'Pantalla lista.' }));
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSnapshot(
          Object.freeze({
            state: 'blocked',
            runtime: null,
            message: error instanceof Error ? error.message : 'No se pudo abrir la Pantalla del editor.',
          }),
        );
      });

    return () => {
      active = false;
      loadedRuntime?.dispose();
    };
  }, [projectId, screenId]);

  const runtime = snapshot.runtime;
  return Object.freeze({
    state: snapshot.state,
    message: snapshot.message,
    projectId,
    screenId: runtime?.document.id ?? screenId,
    screenName: runtime?.document.name ?? null,
    sessionKey: runtime?.document.id ?? `structural:${projectId ?? 'none'}:${screenId ?? 'default'}`,
    config: (runtime?.session.config ?? structuralPuckConfig) as PuckEditorConfig,
    data: (runtime?.session.data ?? structuralPuckData) as PuckEditorData,
    onAction: runtime?.actionSync.onAction as PuckEditorOnAction | undefined,
  });
}
