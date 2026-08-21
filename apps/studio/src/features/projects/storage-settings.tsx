import { Button } from '@electrocraft/design-system';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from './project-storage-runtime';
import { RevisionHistoryPanel } from './revision-history-panel';
import { DEFAULT_STUDIO_WORKSPACE_PREFERENCES, type StudioWorkspacePreferences } from '@electrocraft/application';

type RecoveryState =
  | { readonly state: 'idle' }
  | { readonly state: 'checking' }
  | { readonly state: 'coherent' }
  | { readonly state: 'unavailable'; readonly message: string }
  | { readonly state: 'available'; readonly revisionId: string; readonly message: string }
  | { readonly state: 'restoring'; readonly revisionId: string; readonly message: string }
  | { readonly state: 'restored'; readonly message: string }
  | { readonly state: 'error'; readonly message: string };

function formatBytes(value: number | null) {
  if (value === null) return 'No disponible';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  return `${(value / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function backendLabel(backend: ReturnType<typeof projectStorageRuntime.getSnapshot>['backend']) {
  if (backend === 'opfs-ahp') return 'OPFS persistente';
  if (backend === 'indexeddb') return 'IndexedDB persistente';
  return 'Memoria temporal';
}

export function StorageSettings() {
  const diagnostics = useSyncExternalStore(
    projectStorageRuntime.subscribe,
    projectStorageRuntime.getSnapshot,
    projectStorageRuntime.getSnapshot,
  );
  const [repairing, setRepairing] = useState(false);
  const [recovery, setRecovery] = useState<RecoveryState>({ state: 'idle' });
  const [workspace, setWorkspace] = useState<StudioWorkspacePreferences>(DEFAULT_STUDIO_WORKSPACE_PREFERENCES);

  useEffect(() => {
    void projectStorageRuntime
      .initialize()
      .then(() => projectStorageRuntime.getWorkspacePreferences('device-default'))
      .then(setWorkspace);
  }, []);
  useEffect(
    () =>
      projectStorageRuntime.subscribeWorkspacePreferences(() => {
        void projectStorageRuntime.getWorkspacePreferences('device-default').then(setWorkspace);
      }),
    [],
  );

  const used = formatBytes(diagnostics.usageBytes);
  const quota = formatBytes(diagnostics.quotaBytes);

  return (
    <section
      className="ec-topbar-settings-section"
      aria-labelledby="storage-settings-title"
      data-information-level="primary"
      data-project-storage-settings
    >
      <div className="flex items-center gap-2">
        <h2 id="storage-settings-title">Almacenamiento</h2>
        <HelpTrigger helpId="help.projects" />
      </div>
      <div className="ec-topbar-setting-row">
        <div>
          <strong>Estado</strong>
          <p role="status" aria-live="polite">
            {diagnostics.message}
          </p>
        </div>
        <span className="ec-ia-setting-detail-value">{backendLabel(diagnostics.backend)}</span>
      </div>
      <section aria-labelledby="workspace-settings-heading">
        <h2 id="workspace-settings-heading">Espacio de trabajo</h2>
        <p>Sidebar, paneles y layouts guardados son preferencias Studio-only y no se exportan con el proyecto.</p>
        <div className="ec-topbar-setting-row">
          <label>
            Lado del Sidebar
            <select
              value={workspace.sidebarSide}
              onChange={(e) => setWorkspace({ ...workspace, sidebarSide: e.target.value as 'left' | 'right' })}
            >
              <option value="left">Izquierda</option>
              <option value="right">Derecha</option>
            </select>
          </label>
          <label>
            Visualización
            <select
              value={workspace.sidebarDisplay}
              onChange={(e) =>
                setWorkspace({
                  ...workspace,
                  sidebarDisplay: e.target.value as StudioWorkspacePreferences['sidebarDisplay'],
                })
              }
            >
              <option value="icons">Iconos</option>
              <option value="text">Texto</option>
              <option value="icons+text">Iconos y texto</option>
            </select>
          </label>
        </div>
        <div className="ec-topbar-setting-row">
          <label>
            Contexto{' '}
            <input
              type="number"
              min="240"
              max="380"
              value={workspace.contextWidth}
              onChange={(e) => setWorkspace({ ...workspace, contextWidth: Number(e.target.value) })}
            />
          </label>
          <label>
            Inspector{' '}
            <input
              type="number"
              min="280"
              max="440"
              value={workspace.inspectorWidth}
              onChange={(e) => setWorkspace({ ...workspace, inspectorWidth: Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              void projectStorageRuntime
                .saveWorkspacePreferences('device-default', workspace, window.innerWidth)
                .then(setWorkspace)
            }
          >
            Guardar layout
          </Button>
          <Button
            variant="outline"
            onClick={() => void projectStorageRuntime.resetWorkspacePreferences('device-default').then(setWorkspace)}
          >
            Restaurar predeterminado
          </Button>
        </div>
      </section>
      <div className="ec-topbar-setting-row" data-storage-recovery={recovery.state}>
        <div>
          <strong>Historial y recuperación</strong>
          <p role="status" aria-live="polite">
            {recovery.state === 'idle'
              ? 'Comprueba la integridad del proyecto actual y localiza el último checkpoint restaurable.'
              : recovery.state === 'checking'
                ? 'Comprobando integridad…'
                : recovery.state === 'coherent'
                  ? 'El proyecto actual es coherente; no necesita restauración.'
                  : recovery.message}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={
              projectStorageRuntime.currentProjectId() === null ||
              recovery.state === 'checking' ||
              recovery.state === 'restoring'
            }
            onClick={() => {
              const projectId = projectStorageRuntime.currentProjectId();
              if (!projectId) return;
              setRecovery({ state: 'checking' });
              void projectStorageRuntime
                .verifyWithRecovery(projectId)
                .then(({ integrity, recovery: candidate }) => {
                  if (integrity.coherent) return setRecovery({ state: 'coherent' });
                  if (!candidate) {
                    return setRecovery({
                      state: 'unavailable',
                      message: 'Se detectó una incoherencia, pero no existe un checkpoint válido para restaurar.',
                    });
                  }
                  return setRecovery({
                    state: 'available',
                    revisionId: candidate.revisionId,
                    message: `Checkpoint disponible del ${new Date(candidate.createdAt).toLocaleString('es')}.`,
                  });
                })
                .catch((error: unknown) =>
                  setRecovery({
                    state: 'error',
                    message: error instanceof Error ? error.message : 'No se pudo comprobar la integridad.',
                  }),
                );
            }}
          >
            Comprobar integridad
          </Button>
          {recovery.state === 'available' || recovery.state === 'restoring' ? (
            <Button
              variant="default"
              size="sm"
              disabled={recovery.state === 'restoring'}
              onClick={() => {
                const projectId = projectStorageRuntime.currentProjectId();
                if (!projectId) return;
                const revisionId = recovery.revisionId;
                setRecovery({ state: 'restoring', revisionId, message: 'Restaurando checkpoint…' });
                void projectStorageRuntime
                  .restoreRevision(projectId, revisionId)
                  .then(() => setRecovery({ state: 'restored', message: 'Checkpoint restaurado correctamente.' }))
                  .catch((error: unknown) =>
                    setRecovery({
                      state: 'error',
                      message: error instanceof Error ? error.message : 'No se pudo restaurar el checkpoint.',
                    }),
                  );
              }}
            >
              {recovery.state === 'restoring' ? 'Restaurando…' : 'Restaurar'}
            </Button>
          ) : null}
        </div>
      </div>
      <div className="ec-topbar-setting-row">
        <div>
          <strong>Uso local</strong>
          <p>
            {used} usados de {quota}
          </p>
        </div>
        <span className="ec-ia-setting-detail-value">
          {diagnostics.durable ? 'Persistencia protegida' : 'Persistencia estándar'}
        </span>
      </div>
      {diagnostics.fallbackReason ? (
        <div className="ec-ia-diagnostic-alert" role="status" data-information-level="diagnostic">
          <strong>Compatibilidad de almacenamiento</strong>
          <p>{diagnostics.fallbackReason}</p>
        </div>
      ) : null}
      <div className="ec-topbar-setting-row">
        <div>
          <strong>Reparar</strong>
          <p>Comprueba la base local y solicita persistencia reforzada cuando el navegador la permita.</p>
        </div>
        <Button
          className="max-md:min-h-11"
          variant="outline"
          size="sm"
          disabled={repairing || !diagnostics.repairSupported}
          onClick={() => {
            setRepairing(true);
            void projectStorageRuntime.repair().finally(() => setRepairing(false));
          }}
        >
          {repairing ? 'Revisando…' : 'Revisar'}
        </Button>
      </div>
      <RevisionHistoryPanel />
    </section>
  );
}
