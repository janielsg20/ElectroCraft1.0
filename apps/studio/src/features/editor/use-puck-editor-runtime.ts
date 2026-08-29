import {
  structuralPuckConfig,
  structuralPuckData,
  type PuckEditorConfig,
  type PuckEditorData,
  type PuckEditorOnAction,
} from '@electrocraft/editor-puck';
import { useEffect, useState, useSyncExternalStore } from 'react';
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

function selectedScreenId() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('screen');
}

export function useStudioPuckEditorRuntime() {
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const projectId = activeProjectId(preferences.layout.lastDocumentId);
  const screenId = selectedScreenId();
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(() =>
    projectId
      ? Object.freeze({ state: 'loading', runtime: null, message: 'Cargando documento del editor…' })
      : emptySnapshot,
  );

  useEffect(() => {
    let active = true;
    let loadedRuntime: StudioPuckEditorRuntime | null = null;
    if (!projectId) {
      setSnapshot(emptySnapshot);
      return () => {
        active = false;
      };
    }

    setSnapshot(Object.freeze({ state: 'loading', runtime: null, message: 'Cargando documento del editor…' }));
    void loadStudioPuckEditor({
      projectId,
      documentId: screenId ?? undefined,
      onSynchronized: () => {
        if (!active) return;
        setSnapshot((current) =>
          current.runtime
            ? Object.freeze({ state: 'ready', runtime: current.runtime, message: 'Documento sincronizado.' })
            : current,
        );
      },
      onError: (error) => {
        if (!active) return;
        setSnapshot((current) =>
          Object.freeze({
            state: 'blocked',
            runtime: current.runtime,
            message: error.message || 'No se pudo sincronizar el documento.',
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
        setSnapshot(Object.freeze({ state: 'ready', runtime, message: 'Documento listo.' }));
      })
      .catch((error: unknown) => {
        if (!active) return;
        setSnapshot(
          Object.freeze({
            state: 'blocked',
            runtime: null,
            message: error instanceof Error ? error.message : 'No se pudo abrir el documento del editor.',
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
    sessionKey: runtime?.document.id ?? `structural:${projectId ?? 'none'}`,
    config: (runtime?.session.config ?? structuralPuckConfig) as PuckEditorConfig,
    data: (runtime?.session.data ?? structuralPuckData) as PuckEditorData,
    onAction: runtime?.actionSync.onAction as PuckEditorOnAction | undefined,
  });
}
