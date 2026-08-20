import {
  createProjectStorageService,
  type ProjectStorageDiagnostics,
  type SaveProjectRequest,
} from '@electrocraft/application';
import { createBrowserProjectStoragePort } from '@electrocraft/data-web';

const port = createBrowserProjectStoragePort();
const service = createProjectStorageService(port);
const listeners = new Set<() => void>();

let snapshot: ProjectStorageDiagnostics = Object.freeze({
  state: 'initial',
  backend: 'indexeddb',
  persistent: true,
  durable: false,
  usageBytes: null,
  quotaBytes: null,
  migrationVersion: 0,
  repairSupported: true,
  message: 'Almacenamiento local pendiente de inicialización.',
});
let initializePromise: Promise<ProjectStorageDiagnostics> | null = null;

function publish(next: ProjectStorageDiagnostics) {
  snapshot = next;
  for (const listener of listeners) listener();
  return snapshot;
}

export const projectStorageRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  async initialize() {
    if (!initializePromise) {
      publish(Object.freeze({ ...snapshot, state: 'loading', message: 'Inicializando almacenamiento local…' }));
      initializePromise = service.initialize().then(publish).finally(() => {
        initializePromise = null;
      });
    }
    return initializePromise;
  },
  async refresh() {
    return publish(await service.diagnostics());
  },
  async repair() {
    publish(Object.freeze({ ...snapshot, state: 'loading', message: 'Revisando almacenamiento local…' }));
    return publish(await service.repair());
  },
  async saveProject(request: SaveProjectRequest) {
    publish(Object.freeze({ ...snapshot, state: 'saving', message: 'Guardando proyecto…' }));
    try {
      const revision = await service.saveProject(request);
      publish(await service.diagnostics());
      return revision;
    } catch (error) {
      publish(
        Object.freeze({
          ...snapshot,
          state: 'error',
          message: error instanceof Error ? error.message : 'No se pudo guardar el proyecto.',
        }),
      );
      throw error;
    }
  },
  openProject: service.openProject,
  verifyProject: service.verifyProject,
});
