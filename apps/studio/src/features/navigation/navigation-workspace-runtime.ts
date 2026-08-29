import {
  createInitialNavigationGraph,
  navigationGraphStoredObjects,
  parseNavigationWorkspaceGraph,
  type NavigationWorkspaceGraph,
  type StoredProjectDefinition,
} from '@electrocraft/application';
import { type ElectroCraftDocument } from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { workspacePreferencesRuntime } from '../projects/workspace-preferences-runtime';

export type NavigationWorkspaceState = 'initial' | 'loading' | 'ready' | 'saving' | 'error';

export interface NavigationWorkspaceSnapshot {
  readonly state: NavigationWorkspaceState;
  readonly graph: NavigationWorkspaceGraph | null;
  readonly project: StoredProjectDefinition | null;
  readonly message: string;
  readonly lastSavedMessage: string | null;
}

const listeners = new Set<() => void>();
let snapshot: NavigationWorkspaceSnapshot = Object.freeze({
  state: 'initial',
  graph: null,
  project: null,
  message: 'Navegación pendiente de carga.',
  lastSavedMessage: null,
});
let loadPromise: Promise<NavigationWorkspaceSnapshot> | null = null;

function publish(next: NavigationWorkspaceSnapshot) {
  snapshot = Object.freeze(next);
  for (const listener of listeners) listener();
  return snapshot;
}

function activeProjectId() {
  return projectStorageRuntime.currentProjectId() ?? workspacePreferencesRuntime.getSnapshot().layout.lastDocumentId;
}

function screenDocuments(graph: NavigationWorkspaceGraph): readonly ElectroCraftDocument[] {
  return graph.documents.filter((document) => document.kind === 'screen');
}

async function persistCanonicalMigrations(project: StoredProjectDefinition, graph: NavigationWorkspaceGraph) {
  if (graph.migratedRouteIds.length === 0 && graph.migratedNavigationIds.length === 0) return false;
  const routeIds = new Set(graph.migratedRouteIds);
  const navigationIds = new Set(graph.migratedNavigationIds);
  const objects = navigationGraphStoredObjects({
    routes: graph.routes.filter(({ id }) => routeIds.has(id)),
    navigations: graph.navigations.filter(({ id }) => navigationIds.has(id)),
  });
  if (objects.length === 0) return false;
  projectStorageRuntime.queueAutosave({ project, dirtyObjects: objects });
  await projectStorageRuntime.flushAutosave();
  return true;
}

async function loadWorkspace(): Promise<NavigationWorkspaceSnapshot> {
  publish({ ...snapshot, state: 'loading', message: 'Cargando Pantallas, Rutas y Navegación…', lastSavedMessage: null });
  await projectStorageRuntime.initialize();
  const projectId = activeProjectId();
  if (!projectId) {
    return publish({
      state: 'ready',
      graph: null,
      project: null,
      message: 'Abre un proyecto para configurar sus pantallas y navegación.',
      lastSavedMessage: null,
    });
  }

  const opened = await projectStorageRuntime.openProject(projectId);
  if (!opened) {
    return publish({
      state: 'error',
      graph: null,
      project: null,
      message: 'El proyecto seleccionado ya no está disponible.',
      lastSavedMessage: null,
    });
  }

  try {
    const graph = parseNavigationWorkspaceGraph({
      documents: opened.objects.filter(({ kind }) => kind === 'document').map(({ payload }) => payload),
      routes: opened.objects.filter(({ kind }) => kind === 'route').map(({ payload }) => payload),
      navigations: opened.objects.filter(({ kind }) => kind === 'navigation').map(({ payload }) => payload),
    });
    const migrated = await persistCanonicalMigrations(opened.project, graph);
    return publish({
      state: 'ready',
      graph,
      project: opened.project,
      message:
        graph.diagnostics.length === 0
          ? 'Navigation Graph listo.'
          : `Navigation Graph cargado con ${graph.diagnostics.length} diagnóstico(s).`,
      lastSavedMessage: migrated ? 'Rutas y navegación legacy migradas al modelo canónico v2.' : null,
    });
  } catch (error) {
    return publish({
      state: 'error',
      graph: null,
      project: opened.project,
      message: error instanceof Error ? error.message : 'No se pudo cargar Navigation Graph.',
      lastSavedMessage: null,
    });
  }
}

export const navigationWorkspaceRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  screenDocuments() {
    return snapshot.graph ? screenDocuments(snapshot.graph) : [];
  },
  load() {
    if (!loadPromise) {
      loadPromise = loadWorkspace().finally(() => {
        loadPromise = null;
      });
    }
    return loadPromise;
  },
  async createInitialNavigation() {
    const current = snapshot;
    if (!current.project || !current.graph) throw new Error('Abre un proyecto antes de crear la navegación.');
    if (current.graph.routes.length > 0 || current.graph.navigations.length > 0) {
      throw new Error('El proyecto ya contiene rutas o navegación; no se reemplazará automáticamente.');
    }
    const screen = screenDocuments(current.graph)[0];
    if (!screen) throw new Error('Crea primero una pantalla desde el Editor visual.');

    publish({ ...current, state: 'saving', message: 'Guardando navegación inicial…', lastSavedMessage: null });
    try {
      const created = createInitialNavigationGraph(screen);
      const objects = navigationGraphStoredObjects({ routes: [created.route], navigations: [created.navigation] });
      projectStorageRuntime.queueAutosave({ project: current.project, dirtyObjects: objects });
      await projectStorageRuntime.flushAutosave();
      const graph = parseNavigationWorkspaceGraph({
        documents: current.graph.documents,
        routes: [created.route],
        navigations: [created.navigation],
      });
      return publish({
        state: 'ready',
        graph,
        project: current.project,
        message: 'Navigation Graph listo.',
        lastSavedMessage: 'Ruta inicial y navegación principal guardadas.',
      });
    } catch (error) {
      publish({
        ...current,
        state: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar la navegación inicial.',
        lastSavedMessage: null,
      });
      throw error;
    }
  },
});
