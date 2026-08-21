import type { ProjectRevisionSummary } from '@electrocraft/application';
import { Button } from '@electrocraft/design-system';
import { useEffect, useState } from 'react';
import { projectStorageRuntime } from './project-storage-runtime';
export function RevisionHistoryPanel() {
  const [items, setItems] = useState<readonly ProjectRevisionSummary[]>([]);
  const [selected, setSelected] = useState<ProjectRevisionSummary | null>(null);
  const [state, setState] = useState<'empty' | 'loading' | 'ready' | 'error'>('loading');
  async function reload() {
    const id = projectStorageRuntime.currentProjectId();
    if (!id) {
      setState('empty');
      return;
    }
    try {
      const rows = await projectStorageRuntime.listRevisions(id);
      setItems(rows);
      setSelected(rows[0] ?? null);
      setState(rows.length ? 'ready' : 'empty');
    } catch {
      setState('error');
    }
  }
  useEffect(() => {
    void reload();
  }, []);
  return (
    <section aria-labelledby="revision-history-title">
      <h2 id="revision-history-title">Historial de versiones</h2>
      {state === 'loading' ? <p role="status">Cargando historial…</p> : null}
      {state === 'empty' ? <p>No hay revisiones guardadas.</p> : null}
      {state === 'error' ? <p role="alert">No se pudo cargar el historial.</p> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,300px) 1fr', gap: 12 }}>
        <ol aria-label="Revisiones">
          {items.map((item) => (
            <li key={item.id}>
              <button onClick={() => setSelected(item)}>
                <strong>{item.reason}</strong>
                <br />
                <span>{new Date(item.createdAt).toLocaleString('es')}</span>
              </button>
            </li>
          ))}
        </ol>
        {selected ? (
          <div>
            <h3>Resumen de cambios</h3>
            <p>{selected.objectCount} objetos</p>
            <ul>
              {Object.entries(selected.objectsByKind).map(([kind, count]) => (
                <li key={kind}>
                  {kind}: {count}
                </li>
              ))}
            </ul>
            <Button
              variant="destructive"
              onClick={() => {
                const id = projectStorageRuntime.currentProjectId();
                if (id && confirm('¿Restaurar esta revisión? Se creará un nuevo checkpoint.'))
                  void projectStorageRuntime.restoreRevisionAsCheckpoint(id, selected.id).then(reload);
              }}
            >
              Restaurar revisión
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
