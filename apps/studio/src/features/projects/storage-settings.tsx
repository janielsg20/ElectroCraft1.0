import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Loader,
} from '@electrocraft/design-system';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import {
  downloadProjectBackup,
  ProjectBackupDialog,
  type ProjectBackupIdentity,
} from './project-backup-dialog';
import { projectStorageRuntime } from './project-storage-runtime';

type RecoveryState =
  | { readonly state: 'idle' }
  | { readonly state: 'checking' }
  | { readonly state: 'coherent' }
  | { readonly state: 'unavailable'; readonly message: string }
  | { readonly state: 'available'; readonly revisionId: string; readonly message: string }
  | { readonly state: 'restoring'; readonly revisionId: string; readonly message: string }
  | { readonly state: 'restored'; readonly message: string }
  | { readonly state: 'error'; readonly message: string };

type BackupState =
  | { readonly state: 'idle'; readonly message: string }
  | { readonly state: 'preparing'; readonly message: string }
  | { readonly state: 'downloaded'; readonly message: string }
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

async function currentProjectIdentity(): Promise<ProjectBackupIdentity> {
  const projectId = projectStorageRuntime.currentProjectId();
  if (!projectId) throw new Error('Abre un proyecto antes de crear o restaurar una copia de seguridad.');
  const opened = await projectStorageRuntime.openProject(projectId);
  if (!opened) throw new Error('No se pudo localizar el proyecto actual.');
  return Object.freeze({ id: opened.project.id, name: opened.project.name });
}

export function StorageSettings() {
  const diagnostics = useSyncExternalStore(
    projectStorageRuntime.subscribe,
    projectStorageRuntime.getSnapshot,
    projectStorageRuntime.getSnapshot,
  );
  const [repairing, setRepairing] = useState(false);
  const [recovery, setRecovery] = useState<RecoveryState>({ state: 'idle' });
  const [backup, setBackup] = useState<BackupState>({
    state: 'idle',
    message: 'Crea una copia portable o importa una existente después de validar su integridad.',
  });
  const [importOpen, setImportOpen] = useState(false);
  const [restoreProject, setRestoreProject] = useState<ProjectBackupIdentity | null>(null);

  useEffect(() => {
    void projectStorageRuntime.initialize();
  }, []);

  const used = formatBytes(diagnostics.usageBytes);
  const quota = formatBytes(diagnostics.quotaBytes);
  const projectOpen = projectStorageRuntime.currentProjectId() !== null;

  return (
    <>
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
        <div className="ec-topbar-setting-row" data-storage-backup-state={backup.state}>
          <div>
            <strong>Copias de seguridad</strong>
            <p role="status" aria-live="polite">
              {backup.message}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!projectOpen || backup.state === 'preparing'}
              onClick={() => {
                setBackup({ state: 'preparing', message: 'Preparando copia portable…' });
                void currentProjectIdentity()
                  .then((project) => downloadProjectBackup(project))
                  .then(() =>
                    setBackup({ state: 'downloaded', message: 'Copia de seguridad creada y descargada.' }),
                  )
                  .catch((error: unknown) =>
                    setBackup({
                      state: 'error',
                      message: error instanceof Error ? error.message : 'No se pudo crear la copia de seguridad.',
                    }),
                  );
              }}
            >
              {backup.state === 'preparing' ? <Loader label="Preparando copia" announce={false} size="xs" /> : null}
              Crear copia
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              Importar copia
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!projectOpen || backup.state === 'preparing'}
              onClick={() => {
                setBackup({ state: 'preparing', message: 'Preparando restauración…' });
                void currentProjectIdentity()
                  .then((project) => {
                    setRestoreProject(project);
                    setBackup({
                      state: 'idle',
                      message: 'Selecciona una copia del mismo proyecto para revisar su impacto antes de reemplazarlo.',
                    });
                  })
                  .catch((error: unknown) =>
                    setBackup({
                      state: 'error',
                      message: error instanceof Error ? error.message : 'No se pudo preparar la restauración.',
                    }),
                  );
              }}
            >
              Restaurar desde copia
            </Button>
          </div>
        </div>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" size="sm" disabled={recovery.state === 'restoring'}>
                    {recovery.state === 'restoring' ? 'Restaurando…' : 'Restaurar'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogTitle>¿Restaurar este checkpoint?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se guardarán primero los cambios pendientes y una copia de seguridad del estado actual. Después, el
                    contenido del proyecto se reemplazará por el checkpoint seleccionado.
                  </AlertDialogDescription>
                  <div className="flex justify-end gap-2">
                    <AlertDialogCancel asChild>
                      <Button variant="outline">Cancelar</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          const projectId = projectStorageRuntime.currentProjectId();
                          if (!projectId) return;
                          const revisionId = recovery.revisionId;
                          setRecovery({ state: 'restoring', revisionId, message: 'Restaurando checkpoint…' });
                          void projectStorageRuntime
                            .restoreRevision(projectId, revisionId)
                            .then(() =>
                              setRecovery({ state: 'restored', message: 'Checkpoint restaurado correctamente.' }),
                            )
                            .catch((error: unknown) =>
                              setRecovery({
                                state: 'error',
                                message: error instanceof Error ? error.message : 'No se pudo restaurar el checkpoint.',
                              }),
                            );
                        }}
                      >
                        Restaurar y reemplazar
                      </Button>
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
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
              void projectStorageRuntime
                .repair()
                .catch(() => undefined)
                .finally(() => setRepairing(false));
            }}
          >
            {repairing ? 'Revisando…' : 'Revisar'}
          </Button>
        </div>
      </section>
      <ProjectBackupDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={() =>
          setBackup({ state: 'downloaded', message: 'Copia importada. El proyecto ya está disponible en Project Home.' })
        }
      />
      <ProjectBackupDialog
        open={restoreProject !== null}
        onOpenChange={(open) => {
          if (!open) setRestoreProject(null);
        }}
        mode="restore"
        restoreProject={restoreProject}
        onImported={() =>
          setBackup({
            state: 'downloaded',
            message: 'Proyecto restaurado desde la copia; se conservó una revisión de seguridad del estado anterior.',
          })
        }
      />
    </>
  );
}
