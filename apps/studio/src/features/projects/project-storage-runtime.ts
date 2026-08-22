import {
  createProjectBackupService,
  createProjectStorageService,
  type ImportProjectBackupOptions,
  type IncrementalSaveProjectRequest,
  type ProjectBackupPackage,
  type ProjectStorageDiagnostics,
  type SaveProjectRequest,
} from '@electrocraft/application';
import { createBrowserProjectStoragePort } from '@electrocraft/data-web';
import { createProjectAutosaveController } from './project-storage-autosave';

const port = createBrowserProjectStoragePort();
const service = createProjectStorageService(port);
const backupService = createProjectBackupService(port);
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
let currentProjectId: string | null = null;

function publish(next: ProjectStorageDiagnostics) {
  snapshot = next;
  for (const listener of listeners) listener();
  return snapshot;
}

async function runPersistence<T>(operation: () => Promise<T>) {
  publish(Object.freeze({ ...snapshot, state: 'saving', message: 'Guardando proyecto…' }));
  try {
    const result = await operation();
    publish(await service.diagnostics());
    return result;
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
}

const autosave = createProjectAutosaveController({
  saveProjectIncremental: (request) => runPersistence(() => service.saveProjectIncremental(request)),
  createCheckpoint: (projectId, reason) => runPersistence(() => service.createCheckpoint(projectId, reason)),
});

export const projectStorageRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  async initialize() {
    if (!initializePromise) {
      publish(Object.freeze({ ...snapshot, state: 'loading', message: 'Inicializando almacenamiento local…' }));
      initializePromise = service
        .initialize()
        .then(publish)
        .finally(() => {
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
    try {
      return publish(await service.repair());
    } catch (error) {
      publish(
        Object.freeze({
          ...snapshot,
          state: 'error',
          message: error instanceof Error ? error.message : 'No se pudo revisar el almacenamiento local.',
        }),
      );
      throw error;
    }
  },
  async saveProject(request: SaveProjectRequest) {
    const revision = await runPersistence(() => service.saveProject(request));
    currentProjectId = request.project.id;
    autosave.noteCheckpointCommitted();
    return revision;
  },
  queueAutosave(request: IncrementalSaveProjectRequest) {
    currentProjectId = request.project.id;
    return autosave.queue(request);
  },
  flushAutosave: () => autosave.flush(),
  createCheckpoint: (projectId: string, reason = 'manual') => autosave.checkpoint(projectId, reason),
  checkpointBeforeImport: (projectId: string) => autosave.checkpoint(projectId, 'pre-import'),
  checkpointBeforeMigration: (projectId: string) => autosave.checkpoint(projectId, 'pre-migration'),
  checkpointBeforePublish: (projectId: string) => autosave.checkpoint(projectId, 'pre-publish'),
  checkpointBeforeExport: (projectId: string) => autosave.checkpoint(projectId, 'pre-export'),
  pendingAutosaveObjectIds: () => autosave.pendingObjectIds(),
  currentProjectId: () => currentProjectId,
  listProjects: service.listProjects,
  setProjectStatus: service.setProjectStatus,
  renameProject: service.renameProject,
  duplicateProject: service.duplicateProject,
  deleteProjectPermanently: service.deleteProjectPermanently,
  async openProject(projectId: string) {
    const opened = await service.openProject(projectId);
    if (opened) currentProjectId = opened.project.id;
    return opened;
  },
  verifyProject: service.verifyProject,
  async verifyWithRecovery(projectId: string) {
    const integrity = await service.verifyProject(projectId);
    return Object.freeze({
      integrity,
      recovery: integrity.coherent ? null : await service.recoveryCandidate(projectId),
    });
  },
  recoveryCandidate: service.recoveryCandidate,
  async restoreRevision(projectId: string, revisionId: string) {
    await autosave.flush();
    const revision = await runPersistence(() => service.restoreRevision(projectId, revisionId));
    currentProjectId = projectId;
    return revision;
  },
  async exportProjectBackup(projectId: string) {
    if (currentProjectId === projectId) await autosave.flush();
    return backupService.exportProject(projectId);
  },
  async importProjectBackup(backup: ProjectBackupPackage, options: ImportProjectBackupOptions = {}) {
    await autosave.flush();
    const result = await runPersistence(() => backupService.importProject(backup, options));
    currentProjectId = result.projectId;
    return result;
  },
  async close() {
    await autosave.flush();
    autosave.dispose();
    await service.close();
    return publish(await service.diagnostics());
  },
});
