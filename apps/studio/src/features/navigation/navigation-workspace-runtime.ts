import {
  addNavigationNavigator,
  addScreenRouteToNavigation,
  analyzeScreenDelete,
  createNavigationForScreenRoute,
  createRouteForScreen,
  createScreenDocument,
  duplicateScreenDocument,
  navigationGraphStoredObjects,
  parseNavigationWorkspaceGraph,
  reorderNavigationChild,
  setNavigationInitialChild,
  updateNavigationNodeLabel,
  updateNavigationNodePresentation,
  type NavigationWorkspaceGraph,
  type ScreenDeleteAnalysis,
  type StoredProjectDefinition,
} from '@electrocraft/application';
import {
  electroCraftActionGraphSchema,
  type ElectroCraftActionGraph,
  type ElectroCraftDocument,
  type ElectroCraftNavigationBuilderPresentation,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigatorKind,
  type JsonValue,
} from '@electrocraft/domain';
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

export interface CreateScreenWorkspaceInput {
  readonly name: string;
  readonly path: string;
  readonly templateRef?: string | null;
  readonly navigatorRef?: string | null;
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
let actionGraphs: readonly ElectroCraftActionGraph[] = Object.freeze([]);
let screenUpdatedAt = new Map<string, string>();

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

function cyclicNavigationDiagnostic(graph: NavigationWorkspaceGraph) {
  return graph.diagnostics.find(({ code }) => code === 'navigation-cycle') ?? null;
}

function documentStoredObject(document: ElectroCraftDocument) {
  return {
    objectId: document.id,
    kind: 'document',
    schemaVersion: document.schemaVersion,
    payload: structuredClone(document) as unknown as JsonValue,
  } as const;
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
  publish({
    ...snapshot,
    state: 'loading',
    message: 'Cargando Pantallas, Rutas y Navegación…',
    lastSavedMessage: null,
  });
  await projectStorageRuntime.initialize();
  await workspacePreferencesRuntime.initialize();
  const projectId = activeProjectId();
  if (!projectId) {
    actionGraphs = Object.freeze([]);
    screenUpdatedAt = new Map();
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
    actionGraphs = Object.freeze(
      opened.objects
        .filter(({ kind }) => kind === 'action-graph')
        .map(({ payload }) => electroCraftActionGraphSchema.safeParse(payload))
        .filter((result) => result.success)
        .map((result) => result.data),
    );
    screenUpdatedAt = new Map(
      opened.objects
        .filter(({ kind }) => kind === 'document')
        .map((object) => [object.objectId, object.updatedAt] as const),
    );

    const cycle = cyclicNavigationDiagnostic(graph);
    if (cycle) {
      return publish({
        state: 'error',
        graph,
        project: opened.project,
        message: `Navigation Graph contiene un ciclo y no se renderizará hasta repararlo${cycle.ref ? `: ${cycle.ref}` : '.'}`,
        lastSavedMessage: null,
      });
    }
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

async function reloadAfterSave(message: string) {
  await loadWorkspace();
  return publish({ ...snapshot, lastSavedMessage: message });
}

async function persistNavigationMutation(
  message: string,
  mutate: (navigation: ElectroCraftNavigationDefinition) => ElectroCraftNavigationDefinition,
) {
  const current = snapshot;
  if (!current.project || !current.graph) throw new Error('Abre un proyecto antes de editar Navegación.');
  const navigation = current.graph.navigations[0];
  if (!navigation) throw new Error('Crea primero la Navegación principal.');
  publish({ ...current, state: 'saving', message: 'Aplicando cambios de Navegación…', lastSavedMessage: null });
  try {
    const next = mutate(navigation);
    if (next === navigation)
      return publish({ ...current, state: 'ready', message: 'Sin cambios.', lastSavedMessage: null });
    projectStorageRuntime.queueAutosave({
      project: current.project,
      dirtyObjects: navigationGraphStoredObjects({ navigations: [next] }),
    });
    await projectStorageRuntime.flushAutosave();
    await reloadAfterSave(message);
    return next;
  } catch (error) {
    publish({
      ...current,
      state: 'error',
      message: error instanceof Error ? error.message : 'No se pudo actualizar Navegación.',
      lastSavedMessage: null,
    });
    throw error;
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
  screenUpdatedAt(screenId: string) {
    return screenUpdatedAt.get(screenId) ?? null;
  },
  load() {
    const projectId = activeProjectId();
    if (
      snapshot.state === 'ready' &&
      ((!projectId && !snapshot.project) || (projectId !== null && snapshot.project?.id === projectId))
    ) {
      return Promise.resolve(snapshot);
    }
    if (!loadPromise) {
      loadPromise = loadWorkspace().finally(() => {
        loadPromise = null;
      });
    }
    return loadPromise;
  },
  async createScreen(input: CreateScreenWorkspaceInput) {
    const current = snapshot;
    if (!current.project || !current.graph) throw new Error('Abre un proyecto antes de crear una pantalla.');
    const path = input.path.trim();
    if (current.graph.routes.some((route) => route.path === path)) throw new Error(`La Ruta ${path} ya existe.`);

    publish({ ...current, state: 'saving', message: 'Creando Pantalla…', lastSavedMessage: null });
    try {
      const seed = globalThis.crypto.randomUUID();
      const screen = createScreenDocument({ name: input.name, idSeed: seed, templateRef: input.templateRef });
      const route = createRouteForScreen({ screen, path, idSeed: seed });
      const currentNavigation = current.graph.navigations[0] ?? null;
      const navigation = currentNavigation
        ? addScreenRouteToNavigation({
            navigation: currentNavigation,
            route,
            screenName: screen.name,
            navigatorRef: input.navigatorRef,
          })
        : createNavigationForScreenRoute({ screen, route, idSeed: seed });

      projectStorageRuntime.queueAutosave({
        project: current.project,
        dirtyObjects: [
          documentStoredObject(screen),
          ...navigationGraphStoredObjects({ routes: [route], navigations: [navigation] }),
        ],
      });
      await projectStorageRuntime.flushAutosave();
      await reloadAfterSave(`Pantalla “${screen.name}” creada y conectada a Navegación.`);
      return screen;
    } catch (error) {
      publish({
        ...current,
        state: 'error',
        message: error instanceof Error ? error.message : 'No se pudo crear la Pantalla.',
        lastSavedMessage: null,
      });
      throw error;
    }
  },
  async duplicateScreen(screenId: string) {
    const current = snapshot;
    if (!current.project || !current.graph) throw new Error('Abre un proyecto antes de duplicar una pantalla.');
    const source = screenDocuments(current.graph).find(({ id }) => id === screenId);
    if (!source) throw new Error('La Pantalla seleccionada ya no existe.');

    publish({ ...current, state: 'saving', message: 'Duplicando Pantalla…', lastSavedMessage: null });
    try {
      const result = duplicateScreenDocument({ source, idSeed: globalThis.crypto.randomUUID() });
      projectStorageRuntime.queueAutosave({
        project: current.project,
        dirtyObjects: [documentStoredObject(result.screen)],
      });
      await projectStorageRuntime.flushAutosave();
      await reloadAfterSave(`Pantalla duplicada. Ruta sugerida: ${result.routeSuggestion}`);
      return result;
    } catch (error) {
      publish({
        ...current,
        state: 'error',
        message: error instanceof Error ? error.message : 'No se pudo duplicar la Pantalla.',
        lastSavedMessage: null,
      });
      throw error;
    }
  },
  analyzeDelete(screenId: string): ScreenDeleteAnalysis {
    if (!snapshot.graph) return { allowed: false, usages: [] };
    return analyzeScreenDelete({
      screenId,
      documents: snapshot.graph.documents,
      routes: snapshot.graph.routes,
      navigations: snapshot.graph.navigations,
      actionGraphs,
    });
  },
  async deleteScreen(screenId: string) {
    const current = snapshot;
    if (!current.project || !current.graph) throw new Error('Abre un proyecto antes de eliminar una pantalla.');
    const analysis = navigationWorkspaceRuntime.analyzeDelete(screenId);
    if (!analysis.allowed) {
      throw new Error(`No se puede eliminar: la Pantalla tiene ${analysis.usages.length} referencia(s) activas.`);
    }
    const screen = screenDocuments(current.graph).find(({ id }) => id === screenId);
    if (!screen) throw new Error('La Pantalla seleccionada ya no existe.');

    publish({ ...current, state: 'saving', message: 'Eliminando Pantalla…', lastSavedMessage: null });
    try {
      projectStorageRuntime.queueAutosave({ project: current.project, dirtyObjects: [], deletedObjectIds: [screenId] });
      await projectStorageRuntime.flushAutosave();
      await reloadAfterSave(`Pantalla “${screen.name}” eliminada.`);
    } catch (error) {
      publish({
        ...current,
        state: 'error',
        message: error instanceof Error ? error.message : 'No se pudo eliminar la Pantalla.',
        lastSavedMessage: null,
      });
      throw error;
    }
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
      const seed = globalThis.crypto.randomUUID();
      const route = createRouteForScreen({ screen, path: '/', idSeed: `${seed}:initial`, name: 'Inicio' });
      const navigation = createNavigationForScreenRoute({ screen, route, idSeed: seed });
      projectStorageRuntime.queueAutosave({
        project: current.project,
        dirtyObjects: navigationGraphStoredObjects({ routes: [route], navigations: [navigation] }),
      });
      await projectStorageRuntime.flushAutosave();
      return reloadAfterSave('Ruta inicial y navegación principal guardadas.');
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
  addNavigator(parentNavigatorRef: string, kind: ElectroCraftNavigatorKind, label: string) {
    return persistNavigationMutation(`Navigator “${label.trim()}” agregado.`, (navigation) =>
      addNavigationNavigator({
        navigation,
        parentNavigatorRef,
        kind,
        label,
        idSeed: globalThis.crypto.randomUUID(),
      }),
    );
  },
  reorderNode(parentNavigatorRef: string, childRef: string, direction: 'up' | 'down') {
    return persistNavigationMutation('Orden de Navegación actualizado.', (navigation) =>
      reorderNavigationChild({ navigation, parentNavigatorRef, childRef, direction }),
    );
  },
  setInitialNode(navigatorRef: string, childRef: string) {
    return persistNavigationMutation('Pantalla inicial actualizada.', (navigation) =>
      setNavigationInitialChild({ navigation, navigatorRef, childRef }),
    );
  },
  updateNodeLabel(nodeRef: string, label: string) {
    return persistNavigationMutation(`Nodo “${label.trim()}” actualizado.`, (navigation) =>
      updateNavigationNodeLabel({ navigation, nodeRef, label }),
    );
  },
  updateNodePresentation(nodeRef: string, presentation: ElectroCraftNavigationBuilderPresentation) {
    return persistNavigationMutation('Presentación de Navegación actualizada.', (navigation) =>
      updateNavigationNodePresentation({ navigation, nodeRef, presentation }),
    );
  },
});
