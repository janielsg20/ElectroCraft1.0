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

let snapshot: WorkspacePreferences = createDefaultWorkspacePreferences();
let initializePromise: Promise<WorkspacePreferences> | null = null;
let initialized = false;
let mutationRevision = 0;
let channel: BroadcastChannel | null = null;
let visibilityListenerInstalled = false;

function publish(next: WorkspacePreferences) {
  snapshot = next;
  for (const listener of listeners) listener();
  return snapshot;
}

async function reload() {
  const next = publish(await service.load());
  initialized = true;
  return next;
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
    initializePromise = reload().finally(() => {
      initializePromise = null;
    });
  }
  return initializePromise;
}

async function commit(operation: () => Promise<WorkspacePreferences>) {
  if (!initialized) await initialize();
  const revision = ++mutationRevision;
  try {
    const next = await operation();
    if (revision === mutationRevision) publish(next);
    announceChange();
    return next;
  } catch (error) {
    if (revision === mutationRevision) await reload().catch(() => undefined);
    throw error;
  }
}

async function patchLayout(patch: Partial<WorkspaceLayoutSnapshot>) {
  if (!initialized) await initialize();
  const revision = ++mutationRevision;
  const optimisticLayout = normalizeWorkspaceLayout({ ...snapshot.layout, ...patch });
  publish(
    Object.freeze({
      ...snapshot,
      layout: optimisticLayout,
      updatedAt: new Date().toISOString(),
    }),
  );

  try {
    const next = await service.patchLayout(patch);
    if (revision === mutationRevision) publish(next);
    announceChange();
    return next;
  } catch (error) {
    if (revision === mutationRevision) await reload().catch(() => undefined);
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
