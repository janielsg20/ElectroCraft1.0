import {
  attachActionGraphToRoute,
  createExternalUrlActionGraph,
  createRouteNavigateActionGraph,
  navigationGraphStoredObjects,
  validateNavigateActionConfig,
} from '@electrocraft/application';
import {
  electroCraftExternalUrlActionConfigSchema,
  electroCraftNavigateActionConfigSchema,
  type ElectroCraftExternalUrlActionConfig,
  type ElectroCraftNavigateActionConfig,
  type JsonValue,
} from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';

function actionGraphStoredObject(graph: ReturnType<typeof createRouteNavigateActionGraph>) {
  return {
    objectId: graph.id,
    kind: 'action-graph',
    schemaVersion: graph.schemaVersion,
    payload: structuredClone(graph) as unknown as JsonValue,
  } as const;
}

async function persistAction(
  routeId: string,
  build: (sourceRoute: NonNullable<ReturnType<typeof sourceRouteById>>) => ReturnType<typeof createRouteNavigateActionGraph>,
  successMessage: string,
) {
  const snapshot = navigationWorkspaceRuntime.getSnapshot();
  if (!snapshot.project || !snapshot.graph) throw new Error('Abre un proyecto antes de crear una Acción.');
  const route = sourceRouteById(routeId);
  if (!route) throw new Error('La Ruta seleccionada ya no existe.');
  const graph = build(route);
  const nextRoute = attachActionGraphToRoute(route, graph);
  projectStorageRuntime.queueAutosave({
    project: snapshot.project,
    dirtyObjects: [
      ...navigationGraphStoredObjects({ routes: [nextRoute] }),
      actionGraphStoredObject(graph),
    ],
  });
  await projectStorageRuntime.flushAutosave();
  await navigationWorkspaceRuntime.load();
  return Object.freeze({ graph, route: nextRoute, message: successMessage });
}

function sourceRouteById(routeId: string) {
  return navigationWorkspaceRuntime.getSnapshot().graph?.routes.find(({ id }) => id === routeId) ?? null;
}

export const routeNavigationActionRuntime = Object.freeze({
  validateNavigate(routeId: string, configInput: unknown) {
    const snapshot = navigationWorkspaceRuntime.getSnapshot();
    if (!snapshot.graph) return Object.freeze([{ code: 'destination-route-missing' as const, ref: routeId }]);
    return validateNavigateActionConfig({
      config: configInput,
      routes: snapshot.graph.routes,
      documents: snapshot.graph.documents,
    });
  },
  createNavigateAction(routeId: string, configInput: ElectroCraftNavigateActionConfig) {
    const config = electroCraftNavigateActionConfigSchema.parse(configInput);
    const diagnostics = this.validateNavigate(routeId, config);
    if (diagnostics.length > 0) {
      throw new TypeError(`Acción Navegar inválida: ${diagnostics.map(({ code }) => code).join(', ')}`);
    }
    return persistAction(
      routeId,
      (sourceRoute) => createRouteNavigateActionGraph({ sourceRoute, config, idSeed: globalThis.crypto.randomUUID() }),
      'Acción Navegar guardada.',
    );
  },
  createExternalUrlAction(routeId: string, configInput: ElectroCraftExternalUrlActionConfig) {
    const config = electroCraftExternalUrlActionConfigSchema.parse(configInput);
    return persistAction(
      routeId,
      (sourceRoute) => createExternalUrlActionGraph({ sourceRoute, config, idSeed: globalThis.crypto.randomUUID() }),
      'Acción Abrir enlace externo guardada.',
    );
  },
});
