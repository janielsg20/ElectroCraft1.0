import { Button } from '@electrocraft/design-system';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import { DataSourcesWorkspace } from './data-sources-workspace';
import './data-sources-feature-workspace.css';

interface InternalSummaryState {
  readonly state: 'idle' | 'loading' | 'ready' | 'error';
  readonly modelCount: number;
  readonly recordCount: number;
  readonly message: string;
}

const initialSummary: InternalSummaryState = Object.freeze({
  state: 'idle',
  modelCount: 0,
  recordCount: 0,
  message: 'ElectroCraft Data pendiente de lectura.',
});

function formatBytes(value: number | null) {
  if (value === null || !Number.isFinite(value)) return 'Tamaño no disponible';
  if (value < 1024) return `${value} B aprox.`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB aprox.`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB aprox.`;
}

function saveBackup(serialized: string, projectName: string) {
  const safeName = projectName.trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'electrocraft';
  const blob = new Blob([serialized], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}-backup.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function DataSourcesFeatureWorkspace() {
  const snapshot = useSyncExternalStore(
    dataSourceWorkspaceRuntime.subscribe,
    dataSourceWorkspaceRuntime.getSnapshot,
    dataSourceWorkspaceRuntime.getSnapshot,
  );
  const storage = useSyncExternalStore(
    projectStorageRuntime.subscribe,
    projectStorageRuntime.getSnapshot,
    projectStorageRuntime.getSnapshot,
  );
  const internalSource = useMemo(
    () => snapshot.sources.find(({ kind, adapterId }) => kind === 'internal' && adapterId === 'internal.pglite') ?? null,
    [snapshot.sources],
  );
  const [summary, setSummary] = useState<InternalSummaryState>(initialSummary);
  const [internalActionMessage, setInternalActionMessage] = useState<string | null>(null);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  useEffect(() => {
    void dataSourceWorkspaceRuntime.load();
  }, []);

  useEffect(() => {
    if (!internalSource || !snapshot.project) {
      setSummary(initialSummary);
      return;
    }
    let cancelled = false;
    setSummary((current) => ({ ...current, state: 'loading', message: 'Leyendo ElectroCraft Data…' }));
    void dataSourceWorkspaceRuntime
      .internalStats(internalSource)
      .then((stats) => {
        if (cancelled) return;
        setSummary(
          stats
            ? {
                state: 'ready',
                modelCount: stats.modelCount,
                recordCount: stats.recordCount,
                message: 'ElectroCraft Data local lista.',
              }
            : initialSummary,
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSummary({
          state: 'error',
          modelCount: 0,
          recordCount: 0,
          message: error instanceof Error ? error.message : 'No se pudo leer ElectroCraft Data.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [internalSource, snapshot.project]);

  return (
    <div className="ec-data-sources-feature-workspace">
      {!internalSource && snapshot.project ? (
        <section className="ec-internal-data-overview" aria-labelledby="ec-internal-data-setup-title">
          <div className="ec-internal-data-heading">
            <div>
              <p>Datos · Fuente interna</p>
              <div className="ec-internal-data-title-row">
                <h2 id="ec-internal-data-setup-title">ElectroCraft Data</h2>
                <HelpTrigger helpId="help.data.internal" />
              </div>
            </div>
            <div className="ec-internal-data-badges" aria-label="Capacidades de ElectroCraft Data">
              <span>Local</span>
              <span>Disponible sin conexión</span>
            </div>
          </div>
          <p className="ec-internal-data-status">
            Usa el almacenamiento PGlite/Drizzle del proyecto y la tabla genérica de registros existente. No crea una base paralela.
          </p>
          <div className="ec-internal-data-actions">
            <Button
              size="sm"
              disabled={snapshot.state === 'saving'}
              onClick={() => {
                setInternalActionMessage('Creando ElectroCraft Data…');
                void dataSourceWorkspaceRuntime
                  .createSource({
                    name: 'ElectroCraft Data',
                    key: 'electroCraftData',
                    type: 'internal',
                    adapter: 'internal.pglite',
                  })
                  .then(() => setInternalActionMessage('ElectroCraft Data creada.'))
                  .catch((error: unknown) =>
                    setInternalActionMessage(error instanceof Error ? error.message : 'No se pudo crear ElectroCraft Data.'),
                  );
              }}
            >
              Crear ElectroCraft Data
            </Button>
          </div>
          {internalActionMessage ? <p className="ec-internal-data-status" role="status">{internalActionMessage}</p> : null}
        </section>
      ) : null}

      {internalSource && snapshot.project ? (
        <section className="ec-internal-data-overview" aria-labelledby="ec-internal-data-title">
          <div className="ec-internal-data-heading">
            <div>
              <p>Datos · Fuente interna</p>
              <div className="ec-internal-data-title-row">
                <h2 id="ec-internal-data-title">ElectroCraft Data</h2>
                <HelpTrigger helpId="help.data.internal" />
              </div>
            </div>
            <div className="ec-internal-data-badges" aria-label="Estado de ElectroCraft Data">
              <span>Local</span>
              <span>Disponible sin conexión</span>
            </div>
          </div>

          <div className="ec-internal-data-metrics" aria-live="polite">
            <section>
              <span>Modelos</span>
              <strong>{summary.state === 'loading' ? '…' : summary.modelCount}</strong>
            </section>
            <section>
              <span>Registros</span>
              <strong>{summary.state === 'loading' ? '…' : summary.recordCount}</strong>
            </section>
            <section>
              <span>Almacenamiento</span>
              <strong>{formatBytes(storage.usageBytes)}</strong>
            </section>
            <section>
              <span>Motor</span>
              <strong>PGlite + Drizzle</strong>
            </section>
          </div>

          <div className="ec-internal-data-actions">
            <Button asChild size="sm" variant="outline">
              <a href="/models">Modelos</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/content">Registros</a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBackupMessage('Preparando copia de seguridad…');
                void projectStorageRuntime
                  .backupProject(snapshot.project!.id)
                  .then((serialized) => {
                    saveBackup(serialized, snapshot.project!.name);
                    setBackupMessage('Copia de seguridad preparada.');
                  })
                  .catch((error: unknown) =>
                    setBackupMessage(error instanceof Error ? error.message : 'No se pudo crear la copia de seguridad.'),
                  );
              }}
            >
              Copia de seguridad
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={summary.state === 'loading'}
              onClick={() => {
                setSummary((current) => ({ ...current, state: 'loading', message: 'Actualizando…' }));
                void dataSourceWorkspaceRuntime
                  .internalStats(internalSource)
                  .then((stats) =>
                    setSummary(
                      stats
                        ? {
                            state: 'ready',
                            modelCount: stats.modelCount,
                            recordCount: stats.recordCount,
                            message: 'ElectroCraft Data actualizada.',
                          }
                        : initialSummary,
                    ),
                  )
                  .catch((error: unknown) =>
                    setSummary({
                      state: 'error',
                      modelCount: 0,
                      recordCount: 0,
                      message: error instanceof Error ? error.message : 'No se pudo actualizar ElectroCraft Data.',
                    }),
                  );
              }}
            >
              Actualizar
            </Button>
          </div>

          <p className="ec-internal-data-status" role={summary.state === 'error' ? 'alert' : 'status'}>
            {backupMessage ?? summary.message}
          </p>
        </section>
      ) : null}

      <div className="ec-data-sources-feature-base">
        <DataSourcesWorkspace />
      </div>
    </div>
  );
}
