export interface WorkspacePreferences {
  readonly sidebarCollapsed: boolean;
}

export interface WorkspacePreferencesPort {
  getSnapshot(): WorkspacePreferences;
  subscribe(listener: () => void): () => void;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebar(): void;
}

export const defaultWorkspacePreferences = Object.freeze({
  sidebarCollapsed: false,
} satisfies WorkspacePreferences);

export function createMemoryWorkspacePreferencesPort(
  initial: WorkspacePreferences = defaultWorkspacePreferences,
): WorkspacePreferencesPort {
  let snapshot = Object.freeze({ sidebarCollapsed: initial.sidebarCollapsed });
  const listeners = new Set<() => void>();

  function publish(sidebarCollapsed: boolean) {
    if (snapshot.sidebarCollapsed === sidebarCollapsed) return;
    snapshot = Object.freeze({ sidebarCollapsed });
    for (const listener of listeners) listener();
  }

  return Object.freeze({
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setSidebarCollapsed: publish,
    toggleSidebar: () => publish(!snapshot.sidebarCollapsed),
  });
}
