import {
  PROJECT_BACKUP_FORMAT_VERSION,
  type ProjectBackupPackage,
  type ProjectImportStrategy,
  type ProjectLifecycleStatus,
  type ProjectListSort,
  type ProjectSummary,
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

function backupFileName(name: string) {
  const safe = name.trim().replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '');
  return `${safe || 'proyecto'}.electrocraft.json`;
}

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
  const [importOpen, setImportOpen] = useState(false);
  const [importStrategy, setImportStrategy] = useState<ProjectImportStrategy>('copy');
  const [importPackage, setImportPackage] = useState<ProjectBackupPackage | null>(null);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
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

  async function downloadBackup(project: ProjectSummary) {
    setPendingProjectId(project.id);
    setActionError('');
    try {
      const data = await projectStorageRuntime.createBackup(project.id);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = backupFileName(project.name);
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : 'No se pudo crear la copia del proyecto.');
    } finally {
      setPendingProjectId(null);
    }
  }

  async function loadImportFile(file: File) {
    setImportError('');
    setImportPackage(null);
    try {
      const parsed = JSON.parse(await file.text()) as Partial<ProjectBackupPackage>;
      if (
        parsed.format !== 'electrocraft-project-backup' ||
        parsed.version !== PROJECT_BACKUP_FORMAT_VERSION ||
        !parsed.project ||
        typeof parsed.project.id !== 'string' ||
        typeof parsed.project.name !== 'string' ||
        !Array.isArray(parsed.objects) ||
        !Array.isArray(parsed.mediaRefs) ||
        typeof parsed.checksum !== 'string'
      ) {
        throw new TypeError('El archivo no es una copia compatible de ElectroCraft.');
      }
      setImportPackage(parsed as ProjectBackupPackage);
    } catch (cause) {
      setImportError(cause instanceof Error ? cause.message : 'No se pudo leer la copia seleccionada.');
    }
  }

  async function confirmImport() {
    if (!importPackage) return;
    setImporting(true);
    setImportError('');
    try {
      await projectStorageRuntime.importBackup(importPackage, importStrategy);
      await reload();
      setImportOpen(false);
      setImportPackage(null);
      setImportStrategy('copy');
    } catch (cause) {
      setImportError(cause instanceof Error ? cause.message : 'No se pudo importar la copia.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <main className="ec-project-home" data-project-home data-state={state}>
        <header>
          <div className="ec-project-title">
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
          <Button variant="outline" disabled={state === 'loading'} onClick={() => setImportOpen(true)}>
            Importar copia
          </Button>
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
            <p>Crea un proyecto, importa una copia o cambia los filtros.</p>
            <div className="ec-project-empty-actions">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                Importar copia
              </Button>
              <Button onClick={() => setWizardOpen(true)}>Nuevo proyecto</Button>
            </div>
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
                  <Button variant="ghost" disabled={pendingProjectId === p.id} onClick={() => void downloadBackup(p)}>
                    Crear copia
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

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            setImportPackage(null);
            setImportError('');
            setImportStrategy('copy');
          }
        }}
      >
        <DialogContent className="max-w-lg" aria-describedby="import-project-description">
          <DialogTitle>Importar copia de proyecto</DialogTitle>
          <DialogDescription id="import-project-description">
            Selecciona una copia de ElectroCraft. El checksum se valida antes de escribir en el almacenamiento local.
          </DialogDescription>
          <label className="ec-project-import-file">
            <span>Archivo de copia</span>
            <Input
              aria-label="Archivo de copia"
              type="file"
              accept="application/json,.json,.electrocraft.json"
              disabled={importing}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void loadImportFile(file);
              }}
            />
          </label>
          {importPackage ? (
            <section className="ec-project-import-summary" aria-label="Resumen de la copia">
              <strong>{importPackage.project.name}</strong>
              <span>{importPackage.objects.length} objetos</span>
              <span>{importPackage.mediaRefs.length} referencias multimedia</span>
              <span>Creada {new Date(importPackage.createdAt).toLocaleString('es')}</span>
            </section>
          ) : null}
          <label className="ec-project-import-strategy">
            <span>Cómo importar</span>
            <Select value={importStrategy} onValueChange={(value) => setImportStrategy(value as ProjectImportStrategy)}>
              <SelectTrigger aria-label="Estrategia de importación">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copy">Importar como copia</SelectItem>
                <SelectItem value="replace">Restaurar y reemplazar</SelectItem>
              </SelectContent>
            </Select>
          </label>
          {importStrategy === 'replace' ? (
            <p className="ec-project-import-warning">
              Si ya existe el proyecto con ese identificador, se crea un checkpoint de seguridad antes de reemplazarlo.
            </p>
          ) : null}
          {importError ? <p role="alert">{importError}</p> : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" disabled={importing} onClick={() => setImportOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant={importStrategy === 'replace' ? 'destructive' : 'default'}
              disabled={!importPackage || importing}
              onClick={() => void confirmImport()}
            >
              {importing ? 'Importando…' : importStrategy === 'replace' ? 'Restaurar copia' : 'Importar copia'}
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
              Guardar nombre
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <NewProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreated={onOpen} />
    </>
  );
}