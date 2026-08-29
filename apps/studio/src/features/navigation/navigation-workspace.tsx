import { Button, Loader, getStudioIcon } from '@electrocraft/design-system';
import {
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationNode,
  type ElectroCraftRouteDefinition,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';
import './navigation-workspace.css';

const ScreensIcon = getStudioIcon('studio.sidebar.screens');
const NavigationIcon = getStudioIcon('studio.sidebar.navigation');
const AddIcon = getStudioIcon('action.add');
const RetryIcon = getStudioIcon('action.refresh');

export type NavigationWorkspaceMode = 'screens' | 'navigation';

const navigatorLabels = Object.freeze({
  stack: 'Pila',
  tabs: 'Pestañas',
  drawer: 'Menú lateral',
  modal: 'Modal',
});

function routeForScreen(routes: readonly ElectroCraftRouteDefinition[], screenId: string) {
  return routes.find(({ screenRef }) => screenRef === screenId) ?? null;
}

function ScreenList() {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const screens = navigationWorkspaceRuntime.screenDocuments();
  const routes = snapshot.graph?.routes ?? [];

  if (!snapshot.project) {
    return (
      <div className="ec-navigation-empty">
        <strong>Abre un proyecto para ver sus Pantallas.</strong>
        <p>Las rutas y la navegación pertenecen al proyecto local activo.</p>
        <Button asChild size="sm">
          <a href="/">Abrir Proyectos</a>
        </Button>
      </div>
    );
  }

  if (screens.length === 0) {
    return (
      <div className="ec-navigation-empty">
        <strong>Todavía no hay pantallas.</strong>
        <p>Abre el Editor visual para crear la primera pantalla canónica antes de configurar sus rutas.</p>
        <Button asChild size="sm">
          <a href="/editor">Abrir Editor visual</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="ec-screen-list" role="list" aria-label="Pantallas del proyecto">
      {screens.map((screen) => {
        const route = routeForScreen(routes, screen.id);
        return (
          <article className="ec-screen-row" role="listitem" key={screen.id}>
            <div className="ec-screen-row-icon" aria-hidden="true">
              <ScreensIcon />
            </div>
            <div className="ec-screen-row-main">
              <strong>{screen.name}</strong>
              <span>{route ? route.path : 'Sin ruta'}</span>
            </div>
            <div className="ec-screen-row-meta">
              {route?.path === '/' ? <span className="ec-navigation-chip">Pantalla inicial</span> : null}
              <span>v{screen.version}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function NavigationTreeNode({
  navigation,
  node,
  nodesById,
  routesById,
  active,
  onSelect,
}: {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly node: ElectroCraftNavigationNode;
  readonly nodesById: ReadonlyMap<string, ElectroCraftNavigationNode>;
  readonly routesById: ReadonlyMap<string, ElectroCraftRouteDefinition>;
  readonly active: string | null;
  readonly onSelect: (nodeId: string) => void;
}) {
  const isNavigator = node.kind !== 'screen';
  const route = node.kind === 'screen' ? routesById.get(node.routeRef) : null;
  return (
    <li
      className="ec-navigation-tree-item"
      role="treeitem"
      aria-expanded={isNavigator ? true : undefined}
      aria-selected={active === node.id}
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(node.id);
        }
      }}
    >
      <div className="ec-navigation-node" data-active={active === node.id ? 'true' : 'false'}>
        <span className="ec-navigation-node-type">
          {node.kind === 'screen' ? 'Pantalla' : navigatorLabels[node.kind]}
        </span>
        <strong>{node.label}</strong>
        {route ? <code>{route.path}</code> : null}
        {isNavigator && node.id === navigation.rootNodeRef ? (
          <span className="ec-navigation-chip">Raíz</span>
        ) : null}
      </div>
      {isNavigator && node.childRefs.length > 0 ? (
        <ul role="group">
          {node.childRefs.map((childRef) => {
            const child = nodesById.get(childRef);
            return child ? (
              <NavigationTreeNode
                key={child.id}
                navigation={navigation}
                node={child}
                nodesById={nodesById}
                routesById={routesById}
                active={active}
                onSelect={onSelect}
              />
            ) : null;
          })}
        </ul>
      ) : null}
    </li>
  );
}

function NavigationGraphView() {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graph = snapshot.graph;
  const navigation = graph?.navigations[0] ?? null;
  const nodesById = useMemo(
    () => new Map((navigation?.nodes ?? []).map((node) => [node.id, node] as const)),
    [navigation],
  );
  const routesById = useMemo(
    () => new Map((graph?.routes ?? []).map((route) => [route.id, route] as const)),
    [graph?.routes],
  );
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) ?? null : null;
  const selectedRoute = selectedNode?.kind === 'screen' ? routesById.get(selectedNode.routeRef) ?? null : null;

  if (!snapshot.project) {
    return (
      <div className="ec-navigation-empty">
        <strong>Abre un proyecto para configurar Navegación.</strong>
        <p>El Navigation Graph se guarda junto con los demás objetos canónicos del proyecto.</p>
        <Button asChild size="sm">
          <a href="/">Abrir Proyectos</a>
        </Button>
      </div>
    );
  }

  if (!graph || graph.navigations.length === 0 || graph.routes.length === 0) {
    const hasScreen = navigationWorkspaceRuntime.screenDocuments().length > 0;
    return (
      <div className="ec-navigation-empty">
        <strong>No hay una navegación configurada.</strong>
        <p>
          {hasScreen
            ? 'Crea la Ruta inicial y un Stack raíz portable. Después podrás añadir Pestañas, Menú lateral y Modal.'
            : 'Crea primero una pantalla desde el Editor visual.'}
        </p>
        <Button
          size="sm"
          disabled={!hasScreen || snapshot.state === 'saving'}
          title={!hasScreen ? 'Se requiere una pantalla antes de crear la navegación.' : undefined}
          onClick={() => void navigationWorkspaceRuntime.createInitialNavigation()}
        >
          <AddIcon aria-hidden="true" />
          Crear navegación inicial
        </Button>
        {!hasScreen ? <small>Deshabilitado: falta una pantalla canónica.</small> : null}
      </div>
    );
  }

  const root = nodesById.get(navigation?.rootNodeRef ?? '');
  return (
    <div className="ec-navigation-builder" data-navigation-builder>
      <section className="ec-navigation-tree-panel" aria-labelledby="navigation-tree-title">
        <div className="ec-navigation-panel-heading">
          <div>
            <p>Navigation Graph</p>
            <h3 id="navigation-tree-title">{navigation?.label ?? 'Navegación'}</h3>
          </div>
          <span>{navigation?.nodes.length ?? 0} nodos</span>
        </div>
        {navigation && root ? (
          <ul className="ec-navigation-tree" role="tree" aria-label="Árbol de navegación">
            <NavigationTreeNode
              navigation={navigation}
              node={root}
              nodesById={nodesById}
              routesById={routesById}
              active={selectedNodeId}
              onSelect={setSelectedNodeId}
            />
          </ul>
        ) : (
          <p role="alert">La navegación no tiene un nodo raíz válido.</p>
        )}
      </section>

      <aside className="ec-navigation-detail" aria-label="Detalle de navegación">
        <h3>{selectedNode ? selectedNode.label : 'Selecciona un nodo'}</h3>
        {!selectedNode ? <p>Elige un nodo del árbol para revisar su semántica portable.</p> : null}
        {selectedNode && selectedNode.kind !== 'screen' ? (
          <dl>
            <dt>Patrón</dt>
            <dd>{navigatorLabels[selectedNode.kind]}</dd>
            <dt>Pantalla inicial</dt>
            <dd>{selectedNode.initialNodeRef ? nodesById.get(selectedNode.initialNodeRef)?.label ?? 'Referencia inválida' : '—'}</dd>
            <dt>Hijos</dt>
            <dd>{selectedNode.childRefs.length}</dd>
          </dl>
        ) : null}
        {selectedRoute ? (
          <dl>
            <dt>Ruta</dt>
            <dd>{selectedRoute.name}</dd>
            <dt>Path</dt>
            <dd><code>{selectedRoute.path}</code></dd>
            <dt>Parámetros</dt>
            <dd>{selectedRoute.params.length}</dd>
            <dt>Guards</dt>
            <dd>{selectedRoute.guards.length}</dd>
            <dt>Deep link</dt>
            <dd>{selectedRoute.deepLink.enabled ? 'Activo' : 'Desactivado'}</dd>
          </dl>
        ) : null}
      </aside>
    </div>
  );
}

export function NavigationWorkspace({ mode }: { readonly mode: NavigationWorkspaceMode }) {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );

  useEffect(() => {
    void navigationWorkspaceRuntime.load();
  }, []);

  const isScreens = mode === 'screens';
  const Icon = isScreens ? ScreensIcon : NavigationIcon;
  const title = isScreens ? 'Pantallas' : 'Navegación';

  return (
    <section className="ec-navigation-workspace" data-navigation-workspace={mode} aria-labelledby={`ec-${mode}-title`}>
      <header className="ec-navigation-workspace-header">
        <div className="ec-navigation-workspace-title">
          <span aria-hidden="true"><Icon /></span>
          <div>
            <p>{isScreens ? 'Construir' : 'App'}</p>
            <div className="ec-navigation-title-row">
              <h2 id={`ec-${mode}-title`}>{title}</h2>
              <HelpTrigger helpId="help.navigation" />
            </div>
          </div>
        </div>
        {isScreens ? (
          <Button size="sm" disabled title="La creación múltiple de pantallas se habilita en M07.2.">
            <AddIcon aria-hidden="true" />
            Nueva pantalla
          </Button>
        ) : null}
      </header>

      <p className="ec-navigation-summary">
        {isScreens
          ? 'Cada pantalla es un ElectroCraftDocument kind=screen y conserva una referencia estable desde sus Rutas.'
          : 'Stack, Pestañas, Menú lateral y Modal comparten un único grafo portable para Web, Android e iOS.'}
      </p>

      {snapshot.state === 'loading' ? (
        <div className="ec-navigation-loading" role="status" aria-live="polite">
          <Loader label="Cargando Navigation Graph" size="sm" />
          <span>Cargando Pantallas, Rutas y Navegación…</span>
        </div>
      ) : null}

      {snapshot.state === 'error' ? (
        <div className="ec-navigation-error" role="alert">
          <strong>No se pudo abrir Navigation Graph.</strong>
          <p>{snapshot.message}</p>
          <Button size="sm" variant="outline" onClick={() => void navigationWorkspaceRuntime.load()}>
            <RetryIcon aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : null}

      {snapshot.state !== 'loading' && snapshot.state !== 'error' ? (isScreens ? <ScreenList /> : <NavigationGraphView />) : null}

      {snapshot.lastSavedMessage ? (
        <p className="ec-navigation-success" role="status" aria-live="polite">{snapshot.lastSavedMessage}</p>
      ) : null}

      {snapshot.graph && snapshot.graph.diagnostics.length > 0 ? (
        <section className="ec-navigation-diagnostics" aria-labelledby="navigation-diagnostics-title">
          <h3 id="navigation-diagnostics-title">Diagnósticos recuperables</h3>
          <ul>
            {snapshot.graph.diagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic.code}-${diagnostic.ref ?? index}`}>
                <code>{diagnostic.code}</code>{diagnostic.ref ? ` · ${diagnostic.ref}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
