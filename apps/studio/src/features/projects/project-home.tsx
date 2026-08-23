import type {
  ProjectBackupCollisionStrategy,
  ProjectBackupPackage,
  ProjectLifecycleStatus,
  ProjectListSort,
  ProjectSummary,
} from '@electrocraft/application';
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
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  getStudioIcon,
} from '@electrocraft/design-system';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { projectStorageRuntime } from './project-storage-runtime';
import './project-home.css';

const NewProjectWizard = lazy(() =>
  import('./new-project-wizard').then((module) => ({ default: module.NewProjectWizard })),
);

const SearchIcon = getStudioIcon('studio.sidebar.queries');
const GridIcon = getStudioIcon('studio.view.grid');
const ListIcon = getStudioIcon('studio.view.list');
const NewProjectIcon = getStudioIcon('studio.sidebar.aiGenerate');

function downloadProjectBackup(name: string, serialized: string) {
  const blob = new Blob([serialized], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ_-]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  link.href = url;
  link.download = `${safeName || 'proyecto'}.electrocraft.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function ProjectCollectionSkeleton({ view }: { readonly view: 'grid' | 'list' }) {
  return (
    <section
      className={`ec-project-collection ec-project-collection--${view} ec-project-collection-skeleton`}
      aria-label="Cargando proyectos guardados"
      aria-busy="true"
    >
      {Array.from({ length: view === 'grid' ? 6 : 4 }, (_, index) => (
        <article className="ec-project-card ec-project-card-skeleton" key={index} aria-hidden="true">
          <div className="ec-project-open">
            <Skeleton className="ec-project-skeleton-preview" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="ec-project-card-actions">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        </article>
      ))}
    </section>
  );
}

export function ProjectHome({ onOpen }: { readonly onOpen: (id: string) => void | Promise<void> }) {
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
  const [importOpen, setImportOpen] = useState(false);
  const [importSerialized, setImportSerialized] = useState('');
  const [importPreview, setImportPreview] = useState<ProjectBackupPackage | null>(null);
  const [importStrategy, setImportStrategy] = useState<ProjectBackupCollisionStrategy>('copy');
  const importInputRef = useRef<HTMLInputElement>(null);
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

  async function openProject(id: string) {
    setPendingProjectId(id);
    setActionError('');
    try {
      await onOpen(id);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo abrir el proyecto.');
    } finally {
      setPendingProjectId(null);
    }
  }

  async function change(id: string, next: ProjectLifecycleStatus) {
    await runProjectAction(id, () => projectStorageRuntime.setProjectStatus(id, next));
  }

  async function readImportFile(file: File) {
    setActionError('');
    try {
      const serialized = await file.text();
      const preview = projectStorageRuntime.previewImport(serialized);
      setImportSerialized(serialized);
      setImportPreview(preview);
      setImportStrategy('copy');
      setImportOpen(true);
    } catch (cause) {
      setImportSerialized('');
      setImportPreview(null);
      setActionError(cause instanceof Error ? cause.message : 'La copia seleccionada no es válida.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  }

  async function exportBackup(project: ProjectSummary) {
    await runProjectAction(project.id, async () => {
      const serialized = await projectStorageRuntime.backupProject(project.id);
      downloadProjectBackup(project.name, serialized);
    });
  }

  async function importBackup() {
    if (!importPreview || !importSerialized) return;
    const sourceId = importPreview.project.id;
    const succeeded = await runProjectAction(sourceId, () =>
      projectStorageRuntime.importBackup(importSerialized, importStrategy),
    );
    if (succeeded) {
      setImportOpen(false);
      setImportPreview(null);
      setImportSerialized('');
    }
  }

  const initialLoading = state === 'loading' && projects.length === 0;
  const refreshing = state === 'loading' && projects.length > 0;
  const canShowProjects = projects.length > 0 && (state === 'ready' || refreshing);

  return (
    <>
      <main className="ec-project-home" data-project-home data-state={state} aria-busy={state === 'loading'}>
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
          {state === 'loading' ? (
            <Loader
              className="ec-project-loading-indicator"
              label={initialLoading ? 'Cargando proyectos' : 'Actualizando proyectos'}
              showLabel={refreshing}
            />
          ) : null}
          <input
            ref={importInputRef}
            hidden
            type="file"
            accept="application/json,.json,.electrocraft.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readImportFile(file);
            }}
          />
          <Button variant="outline" disabled={initialLoading} onClick={() => importInputRef.current?.click()}>
            Importar copia
          </Button>
          <Button className="ec-project-new" disabled={initialLoading} onClick={() => setWizardOpen(true)}>
            <NewProjectIcon aria-hidden="true" />
            Nuevo proyecto
          </Button>
        </div>
        {state === 'error' ? (
          <div role="alert">
            <strong>No se pudo cargar Project Home.</strong>
            <p>{error}</p>
            <Button onClick={() => void reload()}>Reintentar</Button>
          </div>
        ) : null}
        {actionError ? <p role="alert">{actionError}</p> : null}
        {initialLoading ? <ProjectCollectionSkeleton view={view} /> : null}
        {state === 'ready' && projects.length === 0 ? (
          <section className="ec-project-empty">
            <h2>No hay proyectos en esta vista</h2>
            <p>Crea un proyecto o importa una copia existente.</p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => importInputRef.current?.click()}>
                Importar copia
              </Button>
              <Button onClick={() => setWizardOpen(true)}>Nuevo proyecto</Button>
            </div>
          </section>
        ) : null}
        {canShowProjects ? (
          <section
            className={`ec-project-collection ec-project-collection--${view}`}
            aria-label="Proyectos guardados"
            aria-busy={refreshing}
            data-refreshing={refreshing ? 'true' : 'false'}
          >
            {projects.map((p) => {
              const pending = pendingProjectId === p.id;
              return (
                <article className="ec-project-card" key={p.id} data-pending={pending ? 'true' : 'false'}>
                  <button className="ec-project-open" disabled={pending} onClick={() => void openProject(p.id)}>
                    <span aria-hidden={pending ? undefined : 'true'}>
                      {pending ? <Loader label={`Abriendo ${p.name}`} announce size="sm" /> : 'EC'}
                    </span>
                    <strong>{p.name}</strong>
                    <small>
                      {p.objectCount} objetos · {new Date(p.updatedAt).toLocaleDateString('es')}
                    </small>
                  </button>
                  <div className="ec-project-card-actions">
                    <Button
                      variant="ghost"
                      disabled={pending}
                      onClick={() => {
                        setRenameProject(p);
                        setRenameValue(p.name);
                      }}
                    >
                      Renombrar
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        void runProjectAction(p.id, () =>
                          projectStorageRuntime.duplicateProject(p.id, `${p.name} copia`),
                        )
                      }
                    >
                      Duplicar
                    </Button>
                    <Button variant="ghost" disabled={pending} onClick={() => void exportBackup(p)}>
                      Descargar copia
                    </Button>
                    {p.status === 'active' ? (
                      <Button variant="ghost" disabled={pending} onClick={() => void change(p.id, 'archived')}>
                        Archivar
                      </Button>
                    ) : (
                      <Button variant="ghost" disabled={pending} onClick={() => void change(p.id, 'active')}>
                        Restaurar
                      </Button>
                    )}
                    {p.status === 'trashed' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" disabled={pending}>
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
                                  void runProjectAction(p.id, () =>
                                    projectStorageRuntime.deleteProjectPermanently(p.id),
                                  )
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
                      <Button variant="ghost" disabled={pending} onClick={() => void change(p.id, 'trashed')}>
                        Mover a papelera
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
      </main>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg" aria-describedby="import-project-description">
          <DialogTitle>Importar copia de proyecto</DialogTitle>
          <DialogDescription id="import-project-description">
            La copia se valida por versión, objetos y checksum antes de escribir en el almacenamiento local.
          </DialogDescription>
          {importPreview ? (
            <div className="space-y-3">
              <div>
                <strong>{importPreview.project.name}</strong>
                <p className="text-sm text-muted-foreground">
                  {importPreview.objects.length} objetos · copia del {new Date(importPreview.exportedAt).toLocaleString('es')}
                </p>
              </div>
              <label htmlFor="import-project-strategy">Si el proyecto ya existe</label>
              <Select value={importStrategy} onValueChange={(value) => setImportStrategy(value as ProjectBackupCollisionStrategy)}>
                <SelectTrigger id="import-project-strategy" aria-label="Estrategia para proyecto existente">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copy">Importar como copia</SelectItem>
                  <SelectItem value="replace">Reemplazar después de crear copia de seguridad</SelectItem>
                  <SelectItem value="reject">Cancelar si ya existe</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Reemplazar crea primero un checkpoint local <code>pre-import-safety</code> para poder recuperar el estado anterior.
              </p>
            </div>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={!importPreview || pendingProjectId !== null} onClick={() => void importBackup()}>
              {pendingProjectId === importPreview?.project.id ? <Loader label="Importando copia" announce={false} size="xs" /> : null}
              Importar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
              {pendingProjectId === renameProject?.id ? (
                <Loader label="Guardando nombre" announce={false} size="xs" />
              ) : null}
              Guardar nombre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {wizardOpen ? (
        <Suspense
          fallback={
            <div className="ec-project-wizard-loading" role="status" aria-live="polite">
              <Loader label="Preparando nuevo proyecto" showLabel />
            </div>
          }
        >
          <NewProjectWizard open onClose={() => setWizardOpen(false)} onCreated={onOpen} />
        </Suspense>
      ) : null}
    </>
  );
}
