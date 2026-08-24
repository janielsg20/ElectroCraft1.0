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
let channel: BroadcastChannel | null = null;
let visibilityListenerInstalled = false;

function publish(next: WorkspacePreferences) {
  snapshot = next;
  for (const listener of listeners) listener();
  return snapshot;
}

async function reload() {
  return publish(await service.load());
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
  if (!initializePromise) {
    initializePromise = reload().finally(() => {
      initializePromise = null;
    });
  }
  return initializePromise;
}

async function commit(operation: () => Promise<WorkspacePreferences>) {
  await initialize();
  const next = publish(await operation());
  announceChange();
  return next;
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
  patchLayout(patch: Partial<WorkspaceLayoutSnapshot>) {
    return commit(() => service.patchLayout(patch));
  },
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
  async close() {
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
