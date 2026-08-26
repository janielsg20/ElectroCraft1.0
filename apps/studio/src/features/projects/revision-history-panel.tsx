import type { ProjectRevisionHistoryEntry } from '@electrocraft/application';
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
  getStudioIcon,
} from '@electrocraft/design-system';
import { useCallback, useEffect, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from './project-storage-runtime';
import './revision-history-panel.css';

const HistoryIcon = getStudioIcon('studio.history');
const SaveIcon = getStudioIcon('action.confirm');
const RefreshIcon = getStudioIcon('action.refresh');
const RestoreIcon = getStudioIcon('action.restore');

function sourceLabel(source: ProjectRevisionHistoryEntry['source']) {
  if (source === 'manual') return 'Guardado manual';
  if (source === 'automatic') return 'Automática';
  if (source === 'pre-import') return 'Antes de importar';
  if (source === 'pre-migration') return 'Antes de migrar';
  if (source === 'publish') return 'Publicación';
  if (source === 'export') return 'Exportación';
  if (source === 'restore') return 'Restauración';
  if (source === 'recovery') return 'Seguridad / recuperación';
  return 'Inicial';
}

function reasonLabel(entry: ProjectRevisionHistoryEntry) {
  if (entry.reason.startsWith('restore:')) return 'Restauración de una versión anterior';
  if (entry.reason === 'pre-restore-safety') return 'Punto de seguridad antes de restaurar';
  return sourceLabel(entry.source);
}

export function RevisionHistoryPanel({
  projectId,
  onRestored,
}: {
  readonly projectId: string;
  readonly onRestored?: () => void | Promise<void>;
}) {
  const [entries, setEntries] = useState<readonly ProjectRevisionHistoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [action, setAction] = useState<'idle' | 'saving' | 'restoring'>('idle');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const next = await projectStorageRuntime.listRevisionHistory(projectId);
      setEntries(next);
      setSelectedId((current) =>
        current && next.some((entry) => entry.revisionId === current) ? current : (next[0]?.revisionId ?? null),
      );
      setState('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el historial de versiones.');
      setState('error');
    }
  }, [projectId]);

  useEffect(() => void reload(), [reload]);

  const selected = entries.find((entry) => entry.revisionId === selectedId) ?? null;

  async function saveRevision() {
    setAction('saving');
    setError('');
    try {
      await projectStorageRuntime.saveRevision(projectId);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la revisión.');
    } finally {
      setAction('idle');
    }
  }

  async function restoreRevision() {
    if (!selected) return;
    setAction('restoring');
    setError('');
    try {
      await projectStorageRuntime.restoreRevisionFromHistory(projectId, selected.revisionId);
      await reload();
      await onRestored?.();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo restaurar la revisión.');
    } finally {
      setAction('idle');
    }
  }

  return (
    <section className="ec-revision-history" data-revision-history data-state={state} aria-busy={state === 'loading'}>
      <header className="ec-revision-history-header">
        <div>
          <div className="ec-revision-history-title">
            <HistoryIcon aria-hidden="true" />
            <h2>Historial de versiones</h2>
            <HelpTrigger helpId="help.projects" />
          </div>
          <p>Las revisiones son puntos persistentes entre sesiones y son independientes del Undo del editor.</p>
        </div>
        <Button disabled={action !== 'idle'} onClick={() => void saveRevision()}>
          <SaveIcon aria-hidden="true" />
          {action === 'saving' ? 'Guardando…' : 'Guardar revisión'}
        </Button>
      </header>

      {error ? (
        <div className="ec-revision-history-error" role="alert">
          <strong>No se pudo completar la operación.</strong>
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            <RefreshIcon aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : null}

      {state === 'loading' && entries.length === 0 ? (
        <div className="ec-revision-history-loading">
          <Loader label="Cargando historial" announce />
        </div>
      ) : null}

      {state === 'ready' && entries.length === 0 ? (
        <div className="ec-revision-history-empty">
          <h3>Aún no hay revisiones</h3>
          <p>Guarda una revisión para crear el primer punto de restauración persistente.</p>
          <Button disabled={action !== 'idle'} onClick={() => void saveRevision()}>
            <SaveIcon aria-hidden="true" />
            Guardar primera revisión
          </Button>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <div className="ec-revision-history-layout">
          <div className="ec-revision-list" role="listbox" aria-label="Versiones del proyecto">
            {entries.map((entry) => {
              const selectedEntry = entry.revisionId === selectedId;
              return (
                <button
                  key={entry.revisionId}
                  type="button"
                  role="option"
                  aria-selected={selectedEntry}
                  className="ec-revision-list-item"
                  data-selected={selectedEntry ? 'true' : 'false'}
                  onClick={() => setSelectedId(entry.revisionId)}
                >
                  <strong>{reasonLabel(entry)}</strong>
                  <span>{new Date(entry.timestamp).toLocaleString('es')}</span>
                  <small>
                    {entry.objectCount} objetos · {entry.actor === 'user' ? 'Usuario' : 'Sistema'}
                  </small>
                </button>
              );
            })}
          </div>

          <div className="ec-revision-detail" aria-live="polite">
            {selected ? (
              <>
                <div className="ec-revision-detail-heading">
                  <div>
                    <span className="ec-revision-source">{sourceLabel(selected.source)}</span>
                    <h3>{new Date(selected.timestamp).toLocaleString('es')}</h3>
                    <p>Revisión {selected.revisionId.slice(0, 8)}</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={action !== 'idle'}>
                        <RestoreIcon aria-hidden="true" />
                        {action === 'restoring' ? 'Restaurando…' : 'Restaurar'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Restaurar esta versión</AlertDialogTitle>
                      <AlertDialogDescription>
                        El estado actual se guardará primero como punto de seguridad. La restauración crea una nueva
                        revisión y no borra el historial existente.
                      </AlertDialogDescription>
                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void restoreRevision()}>
                          <RestoreIcon aria-hidden="true" />
                          Restaurar versión
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="ec-revision-diff-summary" aria-label="Resumen de cambios">
                  <div>
                    <strong>{selected.diff.added}</strong>
                    <span>Añadidos</span>
                  </div>
                  <div>
                    <strong>{selected.diff.changed}</strong>
                    <span>Modificados</span>
                  </div>
                  <div>
                    <strong>{selected.diff.removed}</strong>
                    <span>Eliminados</span>
                  </div>
                  <div>
                    <strong>{selected.diff.unchanged}</strong>
                    <span>Sin cambios</span>
                  </div>
                </div>

                <div className="ec-revision-kind-diff">
                  <h4>Cambios por tipo de objeto</h4>
                  {selected.diff.byKind.length === 0 ? (
                    <p>No hay objetos en esta revisión.</p>
                  ) : (
                    <ul>
                      {selected.diff.byKind.map((kind) => (
                        <li key={kind.kind}>
                          <strong>{kind.kind}</strong>
                          <span>
                            +{kind.added} · ~{kind.changed} · −{kind.removed} · ={kind.unchanged}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
