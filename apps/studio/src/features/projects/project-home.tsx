import type { ProjectLifecycleStatus, ProjectListSort, ProjectSummary } from '@electrocraft/application';
import { Button, Input } from '@electrocraft/design-system';
import { useCallback, useEffect, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from './project-storage-runtime';

export function ProjectHome({ onOpen }: { readonly onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<readonly ProjectSummary[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectLifecycleStatus | 'all'>('active');
  const [sort, setSort] = useState<ProjectListSort>('updated-desc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const reload = useCallback(async () => {
    setState('loading');
    try {
      await projectStorageRuntime.initialize();
      setProjects(await projectStorageRuntime.listProjects({ search, status, sort }));
      setState('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos.');
      setState('error');
    }
  }, [search, status, sort]);
  useEffect(() => void reload(), [reload]);
  async function create() {
    const id = crypto.randomUUID();
    await projectStorageRuntime.saveProject({
      project: { id, name: 'Proyecto sin título', metadata: {} },
      objects: [],
      reason: 'project-created',
    });
    onOpen(id);
  }
  async function change(id: string, next: ProjectLifecycleStatus) {
    await projectStorageRuntime.setProjectStatus(id, next);
    await reload();
  }
  return (
    <main className="ec-project-home" data-project-home data-state={state}>
      <header>
        <div className="ec-project-title">
          <h1>Proyectos</h1>
          <HelpTrigger helpId="help.projects" />
        </div>
        <p>Abre y organiza los proyectos de este espacio de trabajo.</p>
      </header>
      <div className="ec-project-toolbar" aria-label="Herramientas de proyectos">
        <Input
          aria-label="Buscar proyectos"
          placeholder="Buscar proyectos"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Estado de proyectos"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="active">Activos</option>
          <option value="archived">Archivados</option>
          <option value="trashed">Papelera</option>
          <option value="all">Todos</option>
        </select>
        <select
          aria-label="Ordenar proyectos"
          value={sort}
          onChange={(e) => setSort(e.target.value as ProjectListSort)}
        >
          <option value="updated-desc">Recientes</option>
          <option value="updated-asc">Más antiguos</option>
          <option value="name-asc">Nombre A–Z</option>
          <option value="name-desc">Nombre Z–A</option>
        </select>
        <div className="ec-project-view" role="group" aria-label="Vista">
          <Button variant="ghost" onClick={() => setView('grid')}>
            Cuadrícula
          </Button>
          <Button variant="ghost" onClick={() => setView('list')}>
            Lista
          </Button>
        </div>
        <Button className="ec-project-new" disabled={state === 'loading'} onClick={() => void create()}>
          Nuevo proyecto
        </Button>
      </div>
      {state === 'loading' ? <p role="status">Cargando proyectos…</p> : null}
      {state === 'error' ? (
        <div role="alert">
          <strong>No se pudo cargar Project Home.</strong>
          <p>{error}</p>
          <Button onClick={() => void reload()}>Reintentar</Button>
        </div>
      ) : null}
      {state === 'ready' && projects.length === 0 ? (
        <section className="ec-project-empty">
          <h2>No hay proyectos en esta vista</h2>
          <p>Crea un proyecto o cambia los filtros.</p>
          <Button onClick={() => void create()}>Nuevo proyecto</Button>
        </section>
      ) : null}
      {state === 'ready' && projects.length ? (
        <section className={`ec-project-collection ec-project-collection--${view}`} aria-label="Proyectos guardados">
          {projects.map((p) => (
            <article className="ec-project-card" key={p.id}>
              <button className="ec-project-open" onClick={() => onOpen(p.id)}>
                <span aria-hidden="true">EC</span>
                <strong>{p.name}</strong>
                <small>
                  {p.objectCount} objetos · {new Date(p.updatedAt).toLocaleDateString('es')}
                </small>
              </button>
              <div>
                {p.status === 'active' ? (
                  <Button variant="ghost" onClick={() => void change(p.id, 'archived')}>
                    Archivar
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={() => void change(p.id, 'active')}>
                    Restaurar
                  </Button>
                )}
                {p.status !== 'trashed' ? (
                  <Button variant="ghost" onClick={() => void change(p.id, 'trashed')}>
                    Mover a papelera
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
