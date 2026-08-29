import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  getStudioIcon,
} from '@electrocraft/design-system';
import type {
  ElectroCraftDocument,
  ElectroCraftNavigationDefinition,
  ElectroCraftRouteDefinition,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';
import './screens-workspace.css';

const ScreensIcon = getStudioIcon('studio.sidebar.screens');
const AddIcon = getStudioIcon('action.add');

function routeForScreen(routes: readonly ElectroCraftRouteDefinition[], screenId: string) {
  return routes.find(({ screenRef }) => screenRef === screenId) ?? null;
}

function navigatorForRoute(navigations: readonly ElectroCraftNavigationDefinition[], routeId: string | null) {
  if (!routeId) return null;
  for (const navigation of navigations) {
    const screenNode = navigation.nodes.find((node) => node.kind === 'screen' && node.routeRef === routeId);
    if (!screenNode) continue;
    const parent = navigation.nodes.find((node) => node.kind !== 'screen' && node.childRefs.includes(screenNode.id));
    if (parent && parent.kind !== 'screen') return parent;
  }
  return null;
}

function isInitialRoute(navigations: readonly ElectroCraftNavigationDefinition[], routeId: string | null) {
  if (!routeId) return false;
  return navigations.some((navigation) =>
    navigation.nodes.some((node) => {
      if (node.kind === 'screen' || !node.initialNodeRef) return false;
      const initialNode = navigation.nodes.find(({ id }) => id === node.initialNodeRef);
      return initialNode?.kind === 'screen' && initialNode.routeRef === routeId;
    }),
  );
}

function screenStatus(screen: ElectroCraftDocument) {
  const status = screen.metadata.status;
  if (status === 'published') return 'Publicada';
  if (status === 'archived') return 'Archivada';
  return 'Borrador';
}

function formatUpdatedAt(value: string | null) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function suggestedPath(name: string) {
  const slug = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `/${slug}` : '/';
}

function NewScreenSheet({ open, onOpenChange }: { readonly open: boolean; readonly onOpenChange: (open: boolean) => void }) {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const [name, setName] = useState('');
  const [path, setPath] = useState('/');
  const [template, setTemplate] = useState('blank');
  const [navigatorRef, setNavigatorRef] = useState('root');
  const [pathEdited, setPathEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = snapshot.graph?.navigations[0] ?? null;
  const navigators = navigation?.nodes.filter((node) => node.kind !== 'screen') ?? [];

  function reset() {
    setName('');
    setPath('/');
    setTemplate('blank');
    setNavigatorRef('root');
    setPathEdited(false);
    setError(null);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="ec-screen-wizard-sheet">
        <SheetHeader>
          <SheetTitle>Nueva pantalla</SheetTitle>
          <SheetDescription>
            Define la Pantalla, su Ruta portable y el Navigator donde aparecerá. ElectroCraft no separa Pantallas Web y Mobile.
          </SheetDescription>
        </SheetHeader>

        <form
          className="ec-screen-wizard"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            const selectedNavigator = navigatorRef === 'root' ? navigation?.rootNodeRef ?? null : navigatorRef;
            void navigationWorkspaceRuntime
              .createScreen({
                name,
                path,
                templateRef: template === 'blank' ? null : template,
                navigatorRef: selectedNavigator,
              })
              .then((screen) => {
                reset();
                onOpenChange(false);
                window.location.assign(`/editor?screen=${encodeURIComponent(screen.id)}`);
              })
              .catch((cause: unknown) => {
                setError(cause instanceof Error ? cause.message : 'No se pudo crear la Pantalla.');
              });
          }}
        >
          <label>
            <span>Nombre</span>
            <Input
              autoFocus
              value={name}
              required
              placeholder="Ej. Detalle de producto"
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                if (!pathEdited) setPath(suggestedPath(value));
              }}
            />
          </label>

          <label>
            <span>Tipo / Plantilla</span>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger aria-label="Tipo o plantilla de pantalla"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Pantalla en blanco</SelectItem>
                <SelectItem value="core.list-detail">Lista + detalle</SelectItem>
                <SelectItem value="core.dashboard">Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label>
            <span>Ruta</span>
            <Input
              value={path}
              required
              placeholder="/detalle-producto"
              onChange={(event) => {
                setPathEdited(true);
                setPath(event.target.value);
              }}
            />
            <small>La Ruta se compila después para cada target; no se persisten objetos de routers específicos.</small>
          </label>

          <label>
            <span>Navigator</span>
            <Select value={navigatorRef} onValueChange={setNavigatorRef}>
              <SelectTrigger aria-label="Navigator de la pantalla"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  {navigation ? 'Navigator raíz' : 'Principal · se creará automáticamente'}
                </SelectItem>
                {navigators
                  .filter(({ id }) => id !== navigation?.rootNodeRef)
                  .map((node) => <SelectItem key={node.id} value={node.id}>{node.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>

          {error ? <p className="ec-screen-wizard-error" role="alert">{error}</p> : null}
          <div className="ec-screen-wizard-actions">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!name.trim() || !path.trim() || snapshot.state === 'saving'}>
              Crear y abrir
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function ScreensWorkspace() {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState('updated-desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void navigationWorkspaceRuntime.load();
  }, []);

  const screens = navigationWorkspaceRuntime.screenDocuments();
  const filteredScreens = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('es');
    return [...screens]
      .filter((screen) => {
        const route = routeForScreen(snapshot.graph?.routes ?? [], screen.id);
        const matchesSearch = !normalized || `${screen.name} ${route?.path ?? ''}`.toLocaleLowerCase('es').includes(normalized);
        const matchesStatus = statusFilter === 'all' || screenStatus(screen).toLocaleLowerCase('es') === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => {
        if (sort === 'name-asc') return left.name.localeCompare(right.name, 'es');
        const leftTime = Date.parse(navigationWorkspaceRuntime.screenUpdatedAt(left.id) ?? '') || 0;
        const rightTime = Date.parse(navigationWorkspaceRuntime.screenUpdatedAt(right.id) ?? '') || 0;
        return sort === 'updated-asc' ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [screens, search, snapshot.graph?.routes, snapshot.lastSavedMessage, sort, statusFilter]);

  useEffect(() => {
    if (selectedId && screens.some(({ id }) => id === selectedId)) return;
    setSelectedId(screens[0]?.id ?? null);
    setDetailOpen(false);
  }, [screens, selectedId]);

  const selected = screens.find(({ id }) => id === selectedId) ?? null;
  const route = selected && snapshot.graph ? routeForScreen(snapshot.graph.routes, selected.id) : null;
  const navigator = snapshot.graph ? navigatorForRoute(snapshot.graph.navigations, route?.id ?? null) : null;
  const deleteAnalysis = selected ? navigationWorkspaceRuntime.analyzeDelete(selected.id) : null;

  if (snapshot.state === 'loading') {
    return <section className="ec-screens-workspace"><p role="status">Cargando Pantallas…</p></section>;
  }

  if (snapshot.state === 'error' && !snapshot.graph) {
    return (
      <section className="ec-screens-workspace">
        <div className="ec-screens-empty" role="alert">
          <strong>No se pudieron cargar las Pantallas.</strong>
          <p>{snapshot.message}</p>
          <Button size="sm" onClick={() => void navigationWorkspaceRuntime.load()}>Reintentar</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="ec-screens-workspace" data-screens-workspace aria-labelledby="ec-screens-title">
      <header className="ec-screens-header">
        <div className="ec-screens-title">
          <span aria-hidden="true"><ScreensIcon /></span>
          <div>
            <p>Construir</p>
            <div><h2 id="ec-screens-title">Pantallas</h2><HelpTrigger helpId="help.screens" /></div>
          </div>
        </div>
        <Button size="sm" onClick={() => setWizardOpen(true)} disabled={!snapshot.project || snapshot.state === 'saving'}>
          <AddIcon aria-hidden="true" />Nueva pantalla
        </Button>
      </header>

      <div className="ec-screens-toolbar" role="search" aria-label="Buscar y filtrar pantallas">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar Pantallas…" aria-label="Buscar Pantallas" />
        <Select value="screen" disabled>
          <SelectTrigger aria-label="Tipo"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="screen">Tipo: Pantalla</SelectItem></SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger aria-label="Estado"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="publicada">Publicada</SelectItem>
            <SelectItem value="archivada">Archivada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger aria-label="Ordenar"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="updated-desc">Más recientes</SelectItem>
            <SelectItem value="updated-asc">Más antiguas</SelectItem>
            <SelectItem value="name-asc">Nombre A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!snapshot.project ? (
        <div className="ec-screens-empty">
          <strong>Abre un proyecto para gestionar Pantallas.</strong>
          <p>Las Pantallas, Rutas y Navigators se guardan dentro del proyecto local activo.</p>
          <Button asChild size="sm"><a href="/">Abrir Proyectos</a></Button>
        </div>
      ) : screens.length === 0 ? (
        <div className="ec-screens-empty">
          <strong>Todavía no hay Pantallas.</strong>
          <p>Crea la primera Pantalla y ElectroCraft conectará su Ruta al Navigation Graph.</p>
          <Button size="sm" onClick={() => setWizardOpen(true)}><AddIcon aria-hidden="true" />Nueva pantalla</Button>
        </div>
      ) : (
        <div className="ec-screens-layout" data-mobile-detail={detailOpen ? 'true' : 'false'}>
          <div className="ec-screens-list-panel" aria-label="Lista de Pantallas">
            {filteredScreens.length === 0 ? <p className="ec-screens-no-results">No hay Pantallas que coincidan con los filtros.</p> : null}
            <div role="listbox" aria-label="Pantallas del proyecto">
              {filteredScreens.map((screen) => {
                const screenRoute = routeForScreen(snapshot.graph?.routes ?? [], screen.id);
                const screenNavigator = navigatorForRoute(snapshot.graph?.navigations ?? [], screenRoute?.id ?? null);
                const initial = isInitialRoute(snapshot.graph?.navigations ?? [], screenRoute?.id ?? null);
                return (
                  <button
                    type="button"
                    className="ec-screen-list-item"
                    role="option"
                    aria-selected={selectedId === screen.id}
                    data-selected={selectedId === screen.id ? 'true' : 'false'}
                    key={screen.id}
                    onClick={() => {
                      setSelectedId(screen.id);
                      setDetailOpen(true);
                      setActionError(null);
                    }}
                  >
                    <span className="ec-screen-list-icon" aria-hidden="true"><ScreensIcon /></span>
                    <span className="ec-screen-list-copy">
                      <strong>{screen.name}</strong>
                      <span>{screenRoute?.path ?? 'Sin Ruta'} · {screenNavigator?.label ?? 'Sin Navigator'}</span>
                    </span>
                    <span className="ec-screen-list-state">
                      {initial ? <em>Pantalla inicial</em> : null}
                      <small>{screenStatus(screen)}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <article className="ec-screen-detail" aria-live="polite">
            {selected ? (
              <>
                <Button className="ec-screen-mobile-back" size="sm" variant="outline" onClick={() => setDetailOpen(false)}>
                  ← Pantallas
                </Button>
                <div className="ec-screen-detail-heading">
                  <div><p>Pantalla</p><h3>{selected.name}</h3></div>
                  <span>{screenStatus(selected)}</span>
                </div>
                <dl>
                  <dt>Ruta</dt><dd><code>{route?.path ?? 'Sin Ruta'}</code></dd>
                  <dt>Navigator</dt><dd>{navigator?.label ?? 'Sin Navigator'}</dd>
                  <dt>Plantilla</dt><dd>{typeof selected.metadata.templateRef === 'string' ? selected.metadata.templateRef : 'En blanco'}</dd>
                  <dt>Estado</dt><dd>{screenStatus(selected)}</dd>
                  <dt>Última edición</dt><dd>{formatUpdatedAt(navigationWorkspaceRuntime.screenUpdatedAt(selected.id))}</dd>
                  <dt>Versión</dt><dd>v{selected.version}</dd>
                </dl>

                {deleteAnalysis && !deleteAnalysis.allowed ? (
                  <div className="ec-screen-usage-warning">
                    <strong>Esta Pantalla está en uso.</strong>
                    <p>{deleteAnalysis.usages.length} referencia(s) activas impiden eliminarla sin romper el proyecto.</p>
                  </div>
                ) : null}
                {actionError ? <p className="ec-screen-action-error" role="alert">{actionError}</p> : null}

                <div className="ec-screen-detail-actions">
                  <Button size="sm" onClick={() => window.location.assign(`/editor?screen=${encodeURIComponent(selected.id)}`)}>
                    Abrir en Editor
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={snapshot.state === 'saving'}
                    onClick={() => {
                      setActionError(null);
                      void navigationWorkspaceRuntime.duplicateScreen(selected.id).catch((cause: unknown) =>
                        setActionError(cause instanceof Error ? cause.message : 'No se pudo duplicar la Pantalla.'),
                      );
                    }}
                  >
                    Duplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!deleteAnalysis?.allowed || snapshot.state === 'saving'}
                    title={!deleteAnalysis?.allowed ? 'Elimina primero las referencias de Ruta, Navegación, Acciones o documentos.' : undefined}
                    onClick={() => {
                      setActionError(null);
                      void navigationWorkspaceRuntime.deleteScreen(selected.id).then(() => setDetailOpen(false)).catch((cause: unknown) =>
                        setActionError(cause instanceof Error ? cause.message : 'No se pudo eliminar la Pantalla.'),
                      );
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </>
            ) : <p>Selecciona una Pantalla para revisar sus propiedades.</p>}
          </article>
        </div>
      )}

      {snapshot.lastSavedMessage ? <p className="ec-screen-save-status" role="status">{snapshot.lastSavedMessage}</p> : null}
      <NewScreenSheet open={wizardOpen} onOpenChange={setWizardOpen} />
    </section>
  );
}
