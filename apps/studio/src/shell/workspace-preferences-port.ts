export interface WorkspacePreferencesSnapshot {
  readonly sidebarCollapsed: boolean;
}

export interface WorkspacePreferencesPort {
  readonly getSnapshot: () => WorkspacePreferencesSnapshot;
  readonly subscribe: (listener: () => void) => () => void;
  readonly setSidebarCollapsed: (collapsed: boolean) => void;
}

export function createInMemoryWorkspacePreferencesPort(
  initial: Partial<WorkspacePreferencesSnapshot> = {},
): WorkspacePreferencesPort {
  let snapshot: WorkspacePreferencesSnapshot = Object.freeze({
    sidebarCollapsed: initial.sidebarCollapsed ?? false,
  });
  const listeners = new Set<() => void>();

  return Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSidebarCollapsed(collapsed) {
      if (typeof collapsed !== 'boolean') {
        throw new TypeError('WorkspacePreferencesPort sidebarCollapsed must be boolean');
      }
      if (snapshot.sidebarCollapsed === collapsed) return;
      snapshot = Object.freeze({ sidebarCollapsed: collapsed });
      for (const listener of listeners) listener();
    },
  });
}
