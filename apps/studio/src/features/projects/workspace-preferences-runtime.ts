import {
  createDefaultWorkspacePreferences,
  createWorkspacePreferencesService,
  normalizeWorkspaceLayout,
  type WorkspaceLayoutSnapshot,
  type WorkspacePreferences,
} from '@electrocraft/application';
import { workspacePreferencesStoragePort } from './project-storage-runtime';

const CHANNEL_NAME = 'electrocraft-workspace-preferences:studio';
const service = createWorkspacePreferencesService(workspacePreferencesStoragePort);
const listeners = new Set<() => void>();

export type WorkspacePreferencesPersistenceState = 'loading' | 'saving' | 'ready' | 'error';

let snapshot: WorkspacePreferences = createDefaultWorkspacePreferences();
let persistenceState: WorkspacePreferencesPersistenceState = 'loading';
let initializePromise: Promise<WorkspacePreferences> | null = null;
let initialized = false;
let mutationRevision = 0;
let pendingMutations = 0;
let pendingInitializationPatch: Partial<WorkspaceLayoutSnapshot> = {};
let deferredReload = false;
let channel: BroadcastChannel | null = null;
let visibilityListenerInstalled = false;

function notify() {
  for (const listener of listeners) listener();
}

function publish(next: WorkspacePreferences) {
  snapshot = next;
  notify();
  return snapshot;
}

function setPersistenceState(next: WorkspacePreferencesPersistenceState) {
  const changed = persistenceState !== next;
  persistenceState = next;
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.workspacePersistenceState = next;
  }
  if (changed) notify();
}

function hasPendingInitializationPatch() {
  return Object.keys(pendingInitializationPatch).length > 0;
}

async function loadInitialPreferences() {
  const loaded = await service.load();
  const next = hasPendingInitializationPatch()
    ? Object.freeze({
        ...loaded,
        layout: normalizeWorkspaceLayout({ ...loaded.layout, ...pendingInitializationPatch }),
        updatedAt: snapshot.updatedAt,
      })
    : loaded;
  pendingInitializationPatch = {};
  initialized = true;
  publish(next);
  if (pendingMutations > 0) return next;
  if (deferredReload) {
    deferredReload = false;
    return reload();
  }
  setPersistenceState('ready');
  return next;
}

async function reload() {
  ensureCrossTabSync();
  if (!initialized) {
    if (initializePromise || pendingMutations > 0) deferredReload = true;
    return initialize();
  }
  if (pendingMutations > 0) {
    deferredReload = true;
    return snapshot;
  }

  setPersistenceState('loading');
  try {
    const next = publish(await service.load());
    setPersistenceState('ready');
    return next;
  } catch (error) {
    setPersistenceState('error');
    throw error;
  }
}

function announceChange() {
  channel?.postMessage({ type: 'workspace-preferences-changed', updatedAt: snapshot.updatedAt });
}

function ensureCrossTabSync() {
  if (typeof BroadcastChannel !== 'undefined' && !channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener('message', (event) => {
      if (event.data?.type !== 'workspace-preferences-changed') return;
      void reload();
    });
  }

  if (typeof document !== 'undefined' && !visibilityListenerInstalled) {
    visibilityListenerInstalled = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void reload();
    });
  }
}

async function initialize() {
  ensureCrossTabSync();
  if (initialized) return snapshot;
  if (!initializePromise) {
    if (pendingMutations === 0) setPersistenceState('loading');
    initializePromise = loadInitialPreferences()
      .catch((error) => {
        setPersistenceState('error');
        throw error;
      })
      .finally(() => {
        initializePromise = null;
      });
  }
  return initializePromise;
}

function beginMutation() {
  pendingMutations += 1;
  setPersistenceState('saving');
}

function finishMutation(success: boolean) {
  pendingMutations = Math.max(0, pendingMutations - 1);
  if (!success) {
    if (pendingMutations === 0) setPersistenceState('error');
    return;
  }
  if (pendingMutations > 0) return;
  if (deferredReload) {
    deferredReload = false;
    void reload();
    return;
  }
  setPersistenceState('ready');
}

async function commit(operation: () => Promise<WorkspacePreferences>) {
  const revision = ++mutationRevision;
  beginMutation();
  try {
    if (!initialized) await initialize();
    const next = await operation();
    if (revision === mutationRevision) publish(next);
    announceChange();
    finishMutation(true);
    return next;
  } catch (error) {
    if (revision === mutationRevision && initialized) await reload().catch(() => undefined);
    finishMutation(false);
    throw error;
  }
}

async function patchLayout(patch: Partial<WorkspaceLayoutSnapshot>) {
  const revision = ++mutationRevision;
  if (!initialized) pendingInitializationPatch = { ...pendingInitializationPatch, ...patch };
  const optimisticLayout = normalizeWorkspaceLayout({ ...snapshot.layout, ...patch });
  beginMutation();
  publish(
    Object.freeze({
      ...snapshot,
      layout: optimisticLayout,
      updatedAt: new Date().toISOString(),
    }),
  );

  try {
    if (!initialized) await initialize();
    const next = await service.patchLayout(patch);
    if (revision === mutationRevision) publish(next);
    announceChange();
    finishMutation(true);
    return next;
  } catch (error) {
    if (revision === mutationRevision && initialized) await reload().catch(() => undefined);
    finishMutation(false);
    throw error;
  }
}

export const workspacePreferencesRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    void initialize();
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  getLayoutSnapshot: () => snapshot.layout,
  getPersistenceState: () => persistenceState,
  initialize,
  refresh: reload,
  saveLayout(layout: WorkspaceLayoutSnapshot) {
    return commit(() => service.saveLayout(normalizeWorkspaceLayout(layout)));
  },
  patchLayout,
  saveCurrentAs(name: string) {
    return commit(() => service.saveCurrentAs(name));
  },
  renameSavedLayout(layoutId: string, name: string) {
    return commit(() => service.renameSavedLayout(layoutId, name));
  },
  applySavedLayout(layoutId: string) {
    return commit(() => service.applySavedLayout(layoutId));
  },
  deleteSavedLayout(layoutId: string) {
    return commit(() => service.deleteSavedLayout(layoutId));
  },
  restoreDefaults() {
    return commit(() => service.restoreDefaults());
  },
  close() {
    channel?.close();
    channel = null;
  },
});

export const workspacePreferencesPort = Object.freeze({
  subscribe: workspacePreferencesRuntime.subscribe,
  getSnapshot: workspacePreferencesRuntime.getLayoutSnapshot,
  setSidebarCollapsed(collapsed: boolean) {
    return workspacePreferencesRuntime.patchLayout({ sidebarCollapsed: collapsed }).then(() => undefined);
  },
  toggleSidebar() {
    return workspacePreferencesRuntime
      .patchLayout({ sidebarCollapsed: !workspacePreferencesRuntime.getLayoutSnapshot().sidebarCollapsed })
      .then(() => undefined);
  },
});
