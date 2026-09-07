import {
  createProjectBackupService,
  createProjectRevisionService,
  createProjectStorageService,
  type IncrementalSaveProjectRequest,
  type OpenProjectResult,
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
let openProjectCache: OpenProjectResult | null = null;
let persistenceEpoch = 0;

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

function invalidateOpenProjectCache() {
  persistenceEpoch += 1;
  openProjectCache = null;
}

async function runPersistence<T>(operation: () => Promise<T>) {
  invalidateOpenProjectCache();
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
  } finally {
    // A read can start before or during the write and finish after it. Bump the
    // epoch again so that any such read is forbidden from caching an older
    // snapshot after the committed mutation.
    invalidateOpenProjectCache();
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
    rememberCurrentProjectId(request.project.id);
    autosave.noteCheckpointCommitted();
    return revision;
  },
  queueAutosave(request: IncrementalSaveProjectRequest) {
    invalidateOpenProjectCache();
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
    invalidateOpenProjectCache();
    try {
      return await service.setProjectStatus(projectId, status);
    } finally {
      invalidateOpenProjectCache();
    }
  },
  async renameProject(projectId: string, name: string) {
    invalidateOpenProjectCache();
    try {
      return await service.renameProject(projectId, name);
    } finally {
      invalidateOpenProjectCache();
    }
  },
  async duplicateProject(sourceProjectId: string, name: string) {
    invalidateOpenProjectCache();
    try {
      return await service.duplicateProject(sourceProjectId, name);
    } finally {
      invalidateOpenProjectCache();
    }
  },
  async deleteProjectPermanently(projectId: string) {
    invalidateOpenProjectCache();
    try {
      await service.deleteProjectPermanently(projectId);
    } finally {
      invalidateOpenProjectCache();
    }
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
    return revision;
  },
  async restoreRevisionFromHistory(projectId: string, revisionId: string) {
    await autosave.flush();
    invalidateOpenProjectCache();
    try {
      const result = await revisionService.restore(projectId, revisionId);
      rememberCurrentProjectId(projectId);
      autosave.noteCheckpointCommitted();
      return result;
    } finally {
      invalidateOpenProjectCache();
    }
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
    const readEpoch = persistenceEpoch;
    const canUseCache = snapshot.state !== 'saving';
    if (canUseCache && openProjectCache?.project.id === projectId) {
      rememberCurrentProjectId(projectId);
      return openProjectCache;
    }
    const opened = await service.openProject(projectId);
    if (opened) {
      // Only cache a read if no persistence invalidation happened while it was
      // in flight. This closes both read-before-write and read-during-write races.
      if (snapshot.state !== 'saving' && readEpoch === persistenceEpoch) openProjectCache = opened;
      rememberCurrentProjectId(opened.project.id);
    } else if (currentProjectId === projectId) {
      openProjectCache = null;
      rememberCurrentProjectId(null);
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
    invalidateOpenProjectCache();
    try {
      const result = await revisionService.restore(projectId, revisionId);
      rememberCurrentProjectId(projectId);
      autosave.noteCheckpointCommitted();
      return result.currentRevision;
    } finally {
      invalidateOpenProjectCache();
    }
  },
  async close() {
    await autosave.flush();
    autosave.dispose();
    invalidateOpenProjectCache();
    await service.close();
    initialized = false;
    initializePromise = null;
    openProjectCache = null;
    return publish(await service.diagnostics());
  },
});
