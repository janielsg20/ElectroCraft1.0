import type {
  IncrementalSaveProjectRequest,
  ProjectIncrementalSaveResult,
  ProjectStorageRevision,
  ProjectStorageService,
} from '@electrocraft/application';

export const DEFAULT_PROJECT_AUTOSAVE_DEBOUNCE_MS = 650;
export const DEFAULT_PROJECT_CHECKPOINT_INTERVAL_MS = 5 * 60 * 1000;

export interface ProjectAutosaveOptions {
  readonly debounceMs?: number;
  readonly checkpointIntervalMs?: number;
  readonly now?: () => number;
  readonly setTimer?: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
  readonly clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
}

type AutosaveStorageService = Pick<ProjectStorageService, 'saveProjectIncremental' | 'createCheckpoint'>;

export function createProjectAutosaveController(service: AutosaveStorageService, options: ProjectAutosaveOptions = {}) {
  const debounceMs = options.debounceMs ?? DEFAULT_PROJECT_AUTOSAVE_DEBOUNCE_MS;
  const checkpointIntervalMs = options.checkpointIntervalMs ?? DEFAULT_PROJECT_CHECKPOINT_INTERVAL_MS;
  const now = options.now ?? Date.now;
  const setTimer = options.setTimer ?? ((callback, delayMs) => setTimeout(callback, delayMs));
  const clearTimer = options.clearTimer ?? clearTimeout;

  if (!Number.isFinite(debounceMs) || debounceMs < 0) throw new TypeError('debounceMs must be a non-negative number');
  if (!Number.isFinite(checkpointIntervalMs) || checkpointIntervalMs <= 0) {
    throw new TypeError('checkpointIntervalMs must be a positive number');
  }

  const dirtyObjects = new Map<string, IncrementalSaveProjectRequest['dirtyObjects'][number]>();
  const deletedObjectIds = new Set<string>();
  let project: IncrementalSaveProjectRequest['project'] | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let activeFlush: Promise<ProjectIncrementalSaveResult> | null = null;
  let lastCheckpointAt = now();

  function hasPendingChanges() {
    return dirtyObjects.size > 0 || deletedObjectIds.size > 0;
  }

  function clearScheduledFlush() {
    if (timer === null) return;
    clearTimer(timer);
    timer = null;
  }

  function scheduleFlush() {
    clearScheduledFlush();
    timer = setTimer(() => {
      timer = null;
      void flush().catch(() => undefined);
    }, debounceMs);
  }

  function queue(request: IncrementalSaveProjectRequest) {
    if (project && project.id !== request.project.id && hasPendingChanges()) {
      throw new Error('cannot switch project while autosave changes are pending');
    }
    project = request.project;

    for (const object of request.dirtyObjects) {
      deletedObjectIds.delete(object.objectId);
      dirtyObjects.set(object.objectId, object);
    }
    for (const objectId of request.deletedObjectIds ?? []) {
      dirtyObjects.delete(objectId);
      deletedObjectIds.add(objectId);
    }

    if (hasPendingChanges()) scheduleFlush();
    return Object.freeze({
      dirtyObjectIds: Object.freeze([...dirtyObjects.keys()].sort()),
      deletedObjectIds: Object.freeze([...deletedObjectIds].sort()),
    });
  }

  async function flush(): Promise<ProjectIncrementalSaveResult | null> {
    clearScheduledFlush();
    if (activeFlush) {
      await activeFlush;
      return hasPendingChanges() ? flush() : null;
    }
    if (!project || !hasPendingChanges()) return null;

    const batchProject = project;
    const batchDirty = [...dirtyObjects.values()];
    const batchDeleted = [...deletedObjectIds];
    dirtyObjects.clear();
    deletedObjectIds.clear();

    const run = service
      .saveProjectIncremental({
        project: batchProject,
        dirtyObjects: batchDirty,
        deletedObjectIds: batchDeleted,
      })
      .then(async (result) => {
        if (now() - lastCheckpointAt >= checkpointIntervalMs) {
          await service.createCheckpoint(result.projectId, 'autosave-interval');
          lastCheckpointAt = now();
        }
        return result;
      })
      .catch((error: unknown) => {
        for (const object of batchDirty) {
          if (!dirtyObjects.has(object.objectId) && !deletedObjectIds.has(object.objectId)) {
            dirtyObjects.set(object.objectId, object);
          }
        }
        for (const objectId of batchDeleted) {
          if (!dirtyObjects.has(objectId)) deletedObjectIds.add(objectId);
        }
        throw error;
      });

    activeFlush = run;
    try {
      return await run;
    } finally {
      activeFlush = null;
      if (hasPendingChanges()) scheduleFlush();
    }
  }

  async function checkpoint(projectId: string, reason = 'manual'): Promise<ProjectStorageRevision> {
    await flush();
    const revision = await service.createCheckpoint(projectId, reason);
    lastCheckpointAt = now();
    return revision;
  }

  return Object.freeze({
    queue,
    flush,
    checkpoint,
    noteCheckpointCommitted() {
      lastCheckpointAt = now();
    },
    pendingObjectIds() {
      return Object.freeze({
        dirtyObjectIds: Object.freeze([...dirtyObjects.keys()].sort()),
        deletedObjectIds: Object.freeze([...deletedObjectIds].sort()),
      });
    },
    discardPending() {
      clearScheduledFlush();
      dirtyObjects.clear();
      deletedObjectIds.clear();
      project = null;
    },
    dispose() {
      clearScheduledFlush();
    },
  });
}

export type ProjectAutosaveController = ReturnType<typeof createProjectAutosaveController>;
