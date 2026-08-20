import { Button } from '@electrocraft/design-system';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from './project-storage-runtime';

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

  useEffect(() => {
    void projectStorageRuntime.initialize();
  }, []);

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
    </section>
  );
}
