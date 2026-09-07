import {
  createProjectBackupService,
  createProjectRevisionService,
  createProjectStorageService,
  type IncrementalSaveProjectRequest,
  type ProjectBackupCollisionStrategy,
  type ProjectStorageDiagnostics,
  type SaveProjectRequest,
} from '@electrocraft/application';
import { createBrowserProjectStoragePort } from '@electrocraft/data-web';
import { createProjectAutosaveController } from './project-storage-autosave';

const port = createBrowserProjectStoragePort();
const service = createProjectStorageService(port);
const revisionService = createProjectRevisionService(port.revisions);
const backupService = createProjectBackupService(service);
const listeners = new Set<() => void>();
const CURRENT_PROJECT_SESSION_KEY = 'electrocraft.studio.currentProjectId.v1';

type OpenedProjectSnapshot = Awaited<ReturnType<typeof service.openProject>>;

export const workspacePreferencesStoragePort = port.workspacePreferences;

function readCurrentProjectId() {
  try {
    const value = globalThis.sessionStorage?.getItem(CURRENT_PROJECT_SESSION_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

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
let initialized = false;
let currentProjectId: string | null = readCurrentProjectId();
let openedProjectCache: OpenedProjectSnapshot = null;

function rememberCurrentProjectId(projectId: string | null) {
  currentProjectId = projectId;
  try {
    if (projectId) {
      globalThis.sessionStorage?.setItem(CURRENT_PROJECT_SESSION_KEY, projectId);
    } else {
      globalThis.sessionStorage?.removeItem(CURRENT_PROJECT_SESSION_KEY);
    }
  } catch {
    // Session persistence is best-effort; storage APIs may be unavailable or blocked.
  }
}

function publish(next: ProjectStorageDiagnostics) {
  snapshot = next;
  for (const listener of listeners) listener();
  return snapshot;
}

function invalidateOpenedProject() {
  openedProjectCache = null;
}

async function runPersistence<T>(operation: () => Promise<T>) {
  publish(Object.freeze({ ...snapshot, state: 'saving', message: 'Guardando proyecto…' }));
  invalidateOpenedProject();
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
  createCheckpoint: (projectId, reason) =>
    runPersistence(() => revisionService.checkpoint(projectId, reason ?? 'manual')),
});

async function recoveryCandidate(projectId: string) {
  const latest = (await revisionService.list(projectId))[0];
  if (!latest) return service.recoveryCandidate(projectId);
  return Object.freeze({
    projectId,
    revisionId: latest.revisionId,
    reason: latest.reason,
    createdAt: latest.timestamp,
    objectCount: latest.objectCount,
  });
}

export const projectStorageRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  async initialize() {
    if (initialized) return snapshot;
    if (!initializePromise) {
      publish(Object.freeze({ ...snapshot, state: 'loading', message: 'Inicializando almacenamiento local…' }));
      initializePromise = service
        .initialize()
        .then((next) => {
          initialized = true;
          return publish(next);
        })
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
    invalidateOpenedProject();
    try {
      const next = await service.repair();
      initialized = true;
      return publish(next);
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
    rememberCurrentProjectId(request.project.id);
    autosave.noteCheckpointCommitted();
    return revision;
  },
  queueAutosave(request: IncrementalSaveProjectRequest) {
    rememberCurrentProjectId(request.project.id);
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
  async setProjectStatus(projectId: string, status: Parameters<typeof service.setProjectStatus>[1]) {
    invalidateOpenedProject();
    return service.setProjectStatus(projectId, status);
  },
  async renameProject(projectId: string, name: string) {
    invalidateOpenedProject();
    return service.renameProject(projectId, name);
  },
  async duplicateProject(projectId: string, name?: string) {
    invalidateOpenedProject();
    return service.duplicateProject(projectId, name);
  },
  async deleteProjectPermanently(projectId: string) {
    invalidateOpenedProject();
    return service.deleteProjectPermanently(projectId);
  },
  async listRevisionHistory(projectId: string) {
    await autosave.flush();
    return revisionService.list(projectId);
  },
  async saveRevision(projectId: string) {
    await autosave.flush();
    const revision = await revisionService.saveRevision(projectId);
    rememberCurrentProjectId(projectId);
    autosave.noteCheckpointCommitted();
    invalidateOpenedProject();
    return revision;
  },
  async restoreRevisionFromHistory(projectId: string, revisionId: string) {
    await autosave.flush();
    const result = await revisionService.restore(projectId, revisionId);
    rememberCurrentProjectId(projectId);
    autosave.noteCheckpointCommitted();
    invalidateOpenedProject();
    return result;
  },
  async backupProject(projectId: string) {
    await autosave.flush();
    return backupService.backupProject(projectId);
  },
  previewImport: backupService.previewImport,
  async importBackup(serialized: string, collisionStrategy: ProjectBackupCollisionStrategy = 'copy') {
    await autosave.flush();
    const result = await runPersistence(() => backupService.importBackup(serialized, collisionStrategy));
    rememberCurrentProjectId(result.projectId);
    autosave.noteCheckpointCommitted();
    return result;
  },
  async openProject(projectId: string) {
    if (currentProjectId === projectId && openedProjectCache) return openedProjectCache;
    const opened = await service.openProject(projectId);
    if (opened) {
      rememberCurrentProjectId(opened.project.id);
      openedProjectCache = opened;
    } else if (currentProjectId === projectId) {
      rememberCurrentProjectId(null);
      invalidateOpenedProject();
    }
    return opened;
  },
  verifyProject: service.verifyProject,
  async verifyWithRecovery(projectId: string) {
    const integrity = await service.verifyProject(projectId);
    return Object.freeze({
      integrity,
      recovery: integrity.coherent ? null : await recoveryCandidate(projectId),
    });
  },
  recoveryCandidate,
  async restoreRevision(projectId: string, revisionId: string) {
    await autosave.flush();
    const result = await revisionService.restore(projectId, revisionId);
    rememberCurrentProjectId(projectId);
    autosave.noteCheckpointCommitted();
    invalidateOpenedProject();
    return result.currentRevision;
  },
  async close() {
    await autosave.flush();
    autosave.dispose();
    await service.close();
    initialized = false;
    invalidateOpenedProject();
    return publish(await service.diagnostics());
  },
});