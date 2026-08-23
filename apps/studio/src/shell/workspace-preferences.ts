import type { WorkspaceSidebarDisplay, WorkspaceSidebarSide, WorkspacePanelId } from '@electrocraft/application';

export interface WorkspacePreferences {
  readonly sidebarCollapsed: boolean;
  readonly sidebarSide?: WorkspaceSidebarSide;
  readonly sidebarWidth?: number;
  readonly sidebarDisplay?: WorkspaceSidebarDisplay;
  readonly sidebarGroupOrder?: readonly string[];
  readonly visiblePanels?: readonly WorkspacePanelId[];
  readonly contextWidth?: number;
  readonly inspectorWidth?: number;
  readonly lastTabs?: readonly string[];
  readonly lastDocumentId?: string | null;
}

export interface WorkspacePreferencesPort {
  getSnapshot(): WorkspacePreferences;
  subscribe(listener: () => void): () => void;
  setSidebarCollapsed(collapsed: boolean): void | Promise<void>;
  toggleSidebar(): void | Promise<void>;
}

export const defaultWorkspacePreferences = Object.freeze({
  sidebarCollapsed: false,
} satisfies WorkspacePreferences);

export function createMemoryWorkspacePreferencesPort(
  initial: WorkspacePreferences = defaultWorkspacePreferences,
): WorkspacePreferencesPort {
  let snapshot = Object.freeze({ ...initial });
  const listeners = new Set<() => void>();

  function publish(sidebarCollapsed: boolean) {
    if (snapshot.sidebarCollapsed === sidebarCollapsed) return;
    snapshot = Object.freeze({ ...snapshot, sidebarCollapsed });
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
