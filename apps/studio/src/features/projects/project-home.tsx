import type { ProjectLifecycleStatus, ProjectListSort, ProjectSummary } from '@electrocraft/application';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  getStudioIcon,
} from '@electrocraft/design-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from './project-storage-runtime';
import { NewProjectWizard } from './new-project-wizard';

const SearchIcon = getStudioIcon('studio.sidebar.queries');
const GridIcon = getStudioIcon('studio.view.grid');
const ListIcon = getStudioIcon('studio.view.list');
const NewProjectIcon = getStudioIcon('studio.sidebar.aiGenerate');

export function ProjectHome({ onOpen }: { readonly onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<readonly ProjectSummary[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectLifecycleStatus | 'all'>('active');
  const [sort, setSort] = useState<ProjectListSort>('updated-desc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [renameProject, setRenameProject] = useState<ProjectSummary | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const reloadSequence = useRef(0);
  const reload = useCallback(async () => {
    const sequence = ++reloadSequence.current;
    setState('loading');
    setError('');
    try {
      await projectStorageRuntime.initialize();
      const nextProjects = await projectStorageRuntime.listProjects({ search, status, sort });
      if (sequence !== reloadSequence.current) return;
      setProjects(nextProjects);
      setState('ready');
    } catch (e) {
      if (sequence !== reloadSequence.current) return;
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los proyectos.');
      setState('error');
    }
  }, [search, status, sort]);
  useEffect(() => void reload(), [reload]);
  async function runProjectAction(id: string, action: () => Promise<unknown>) {
    setPendingProjectId(id);
    setActionError('');
    try {
      await action();
      await reload();
      return true;
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo completar la acción.');
      return false;
    } finally {
      setPendingProjectId(null);
    }
  }
  async function change(id: string, next: ProjectLifecycleStatus) {
    await runProjectAction(id, () => projectStorageRuntime.setProjectStatus(id, next));
  }
  return (
    <>
      <main className="ec-project-home" data-project-home data-state={state}>
        <header>
          <div className="ec-project-title">
            <span className="ec-project-title-icon" aria-hidden="true">
              <GridIcon />
            </span>
            <h1>Proyectos</h1>
            <HelpTrigger helpId="help.projects" />
          </div>
          <p>Abre y organiza los proyectos de este espacio de trabajo.</p>
        </header>
        <div className="ec-project-toolbar" aria-label="Herramientas de proyectos">
          <label className="ec-project-search">
            <SearchIcon aria-hidden="true" />
            <Input
              aria-label="Buscar proyectos"
              placeholder="Buscar proyectos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            <SelectTrigger aria-label="Estado de proyectos">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
              <SelectItem value="trashed">Papelera</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as ProjectListSort)}>
            <SelectTrigger aria-label="Ordenar proyectos">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated-desc">Recientes</SelectItem>
              <SelectItem value="updated-asc">Más antiguos</SelectItem>
              <SelectItem value="name-asc">Nombre A–Z</SelectItem>
              <SelectItem value="name-desc">Nombre Z–A</SelectItem>
            </SelectContent>
          </Select>
          <div className="ec-project-view" role="group" aria-label="Vista">
            <Button variant="ghost" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
              <GridIcon aria-hidden="true" />
              Cuadrícula
            </Button>
            <Button variant="ghost" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              <ListIcon aria-hidden="true" />
              Lista
            </Button>
          </div>
          <Button className="ec-project-new" disabled={state === 'loading'} onClick={() => setWizardOpen(true)}>
            <NewProjectIcon aria-hidden="true" />
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
        {actionError ? <p role="alert">{actionError}</p> : null}
        {state === 'ready' && projects.length === 0 ? (
          <section className="ec-project-empty">
            <h2>No hay proyectos en esta vista</h2>
            <p>Crea un proyecto o cambia los filtros.</p>
            <Button onClick={() => setWizardOpen(true)}>Nuevo proyecto</Button>
          </section>
        ) : null}
        {state === 'ready' && projects.length ? (
          <section className={`ec-project-collection ec-project-collection--${view}`} aria-label="Proyectos guardados">
            {projects.map((p) => (
              <article className="ec-project-card" key={p.id}>
                <button className="ec-project-open" disabled={pendingProjectId === p.id} onClick={() => onOpen(p.id)}>
                  <span aria-hidden="true">EC</span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.objectCount} objetos · {new Date(p.updatedAt).toLocaleDateString('es')}
                  </small>
                </button>
                <div className="ec-project-card-actions">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setRenameProject(p);
                      setRenameValue(p.name);
                    }}
                  >
                    Renombrar
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={pendingProjectId === p.id}
                    onClick={() =>
                      void runProjectAction(p.id, () => projectStorageRuntime.duplicateProject(p.id, `${p.name} copia`))
                    }
                  >
                    Duplicar
                  </Button>
                  {p.status === 'active' ? (
                    <Button
                      variant="ghost"
                      disabled={pendingProjectId === p.id}
                      onClick={() => void change(p.id, 'archived')}
                    >
                      Archivar
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      disabled={pendingProjectId === p.id}
                      onClick={() => void change(p.id, 'active')}
                    >
                      Restaurar
                    </Button>
                  )}
                  {p.status === 'trashed' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" disabled={pendingProjectId === p.id}>
                          Eliminar permanentemente
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogTitle>¿Eliminar “{p.name}” permanentemente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se borrarán el proyecto, sus objetos, índices e historial local. Esta acción no se puede
                          deshacer.
                        </AlertDialogDescription>
                        <div className="flex justify-end gap-2">
                          <AlertDialogCancel asChild>
                            <Button variant="outline">Cancelar</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                void runProjectAction(p.id, () => projectStorageRuntime.deleteProjectPermanently(p.id))
                              }
                            >
                              Eliminar definitivamente
                            </Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                  {p.status !== 'trashed' ? (
                    <Button
                      variant="ghost"
                      disabled={pendingProjectId === p.id}
                      onClick={() => void change(p.id, 'trashed')}
                    >
                      Mover a papelera
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>
      <Dialog open={renameProject !== null} onOpenChange={(open) => (open ? undefined : setRenameProject(null))}>
        <DialogContent className="max-w-md" aria-describedby="rename-project-description">
          <DialogTitle>Renombrar proyecto</DialogTitle>
          <DialogDescription id="rename-project-description">
            Cambia solo el nombre visible; el identificador y las referencias permanecen intactos.
          </DialogDescription>
          <label htmlFor="rename-project-name">Nuevo nombre</label>
          <Input
            id="rename-project-name"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRenameProject(null)}>
              Cancelar
            </Button>
            <Button
              disabled={!renameValue.trim() || pendingProjectId !== null}
              onClick={() => {
                if (!renameProject) return;
                const project = renameProject;
                void runProjectAction(project.id, () =>
                  projectStorageRuntime.renameProject(project.id, renameValue.trim()),
                ).then((succeeded) => {
                  if (succeeded) setRenameProject(null);
                });
              }}
            >
              Guardar nombre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <NewProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreated={onOpen} />
    </>
  );
}
