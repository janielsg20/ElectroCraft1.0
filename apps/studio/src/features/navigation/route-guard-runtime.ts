import { applyRouteAccessConfig, navigationGraphStoredObjects } from '@electrocraft/application';
import { electroCraftRouteAccessConfigSchema, type ElectroCraftRouteAccessConfig } from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';

export const routeGuardRuntime = Object.freeze({
  async save(routeId: string, configInput: ElectroCraftRouteAccessConfig) {
    const snapshot = navigationWorkspaceRuntime.getSnapshot();
    if (!snapshot.project || !snapshot.graph) throw new Error('Abre un proyecto antes de editar Acceso.');
    const route = snapshot.graph.routes.find(({ id }) => id === routeId);
    if (!route) throw new Error('La Ruta seleccionada ya no existe.');
    const config = electroCraftRouteAccessConfigSchema.parse(configInput);
    const nextRoute = applyRouteAccessConfig({ route, config, routes: snapshot.graph.routes });
    projectStorageRuntime.queueAutosave({
      project: snapshot.project,
      dirtyObjects: navigationGraphStoredObjects({ routes: [nextRoute] }),
    });
    await projectStorageRuntime.flushAutosave();
    await navigationWorkspaceRuntime.load();
    return Object.freeze({ route: nextRoute, message: 'Acceso de Ruta actualizado.' });
  },
});
