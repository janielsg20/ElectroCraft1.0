export const WORKSPACE_PREFERENCES_VERSION = 1 as const;
export const DEFAULT_WORKSPACE_ID = 'studio' as const;
export const WORKSPACE_PREFERENCES_STORAGE_KEY = 'workspace.preferences.v1' as const;
export const MAX_SAVED_WORKSPACE_LAYOUTS = 20;
export const MAX_WORKSPACE_LAYOUT_NAME_LENGTH = 64;

export type WorkspaceSidebarSide = 'left' | 'right';
export type WorkspaceSidebarDisplay = 'icons' | 'text' | 'icons+text';
export type WorkspacePanelId = 'context' | 'inspector' | 'status';

export interface WorkspaceLayoutSnapshot {
  readonly sidebarSide: WorkspaceSidebarSide;
  readonly sidebarCollapsed: boolean;
  readonly sidebarWidth: number;
  readonly sidebarDisplay: WorkspaceSidebarDisplay;
  readonly sidebarGroupOrder: readonly string[];
  readonly visiblePanels: readonly WorkspacePanelId[];
  readonly contextWidth: number;
  readonly inspectorWidth: number;
  readonly lastTabs: readonly string[];
  readonly lastDocumentId: string | null;
}

export interface SavedWorkspaceLayout {
  readonly id: string;
  readonly name: string;
  readonly layout: WorkspaceLayoutSnapshot;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkspacePreferences {
  readonly version: typeof WORKSPACE_PREFERENCES_VERSION;
  readonly layout: WorkspaceLayoutSnapshot;
  readonly savedLayouts: readonly SavedWorkspaceLayout[];
  readonly updatedAt: string;
}

export interface WorkspacePreferencesStoragePort {
  read(workspaceId: string, key: string): Promise<unknown | null>;
  write(workspaceId: string, key: string, value: WorkspacePreferences): Promise<void>;
}

export const WORKSPACE_LAYOUT_LIMITS = Object.freeze({
  sidebar: Object.freeze({ defaultSize: 240, collapsedSize: 64, minSize: 180, maxSize: 420 }),
  topbar: Object.freeze({ defaultSize: 52 }),
  context: Object.freeze({ defaultSize: 288, minSize: 240, maxSize: 420 }),
  inspector: Object.freeze({ defaultSize: 320, minSize: 272, maxSize: 460 }),
  status: Object.freeze({ defaultSize: 26 }),
});

export const DEFAULT_WORKSPACE_LAYOUT: WorkspaceLayoutSnapshot = Object.freeze({
  sidebarSide: 'left',
  sidebarCollapsed: false,
  sidebarWidth: WORKSPACE_LAYOUT_LIMITS.sidebar.defaultSize,
  sidebarDisplay: 'icons+text',
  sidebarGroupOrder: Object.freeze([]),
  visiblePanels: Object.freeze(['context', 'inspector', 'status'] as const),
  contextWidth: WORKSPACE_LAYOUT_LIMITS.context.defaultSize,
  inspectorWidth: WORKSPACE_LAYOUT_LIMITS.inspector.defaultSize,
  lastTabs: Object.freeze([]),
  lastDocumentId: null,
});

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const candidate = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, candidate));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function uniqueStrings(value: unknown, max = 100): readonly string[] {
  if (!Array.isArray(value)) return [];
  const items = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
  return Object.freeze([...new Set(items)]);
}

function normalizeVisiblePanels(value: unknown): readonly WorkspacePanelId[] {
  if (!Array.isArray(value)) return DEFAULT_WORKSPACE_LAYOUT.visiblePanels;
  const allowed = new Set<WorkspacePanelId>(['context', 'inspector', 'status']);
  const panels = value.filter(
    (item): item is WorkspacePanelId => typeof item === 'string' && allowed.has(item as WorkspacePanelId),
  );
  return Object.freeze([...new Set(panels)]);
}

function normalizeIsoDate(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

export function normalizeWorkspaceLayout(value: unknown): WorkspaceLayoutSnapshot {
  const record = asRecord(value) ?? {};
  const sidebarSide: WorkspaceSidebarSide = record.sidebarSide === 'right' ? 'right' : 'left';
  const sidebarDisplay: WorkspaceSidebarDisplay =
    record.sidebarDisplay === 'icons' || record.sidebarDisplay === 'text' ? record.sidebarDisplay : 'icons+text';

  return Object.freeze({
    sidebarSide,
    sidebarCollapsed: typeof record.sidebarCollapsed === 'boolean' ? record.sidebarCollapsed : false,
    sidebarWidth: clampNumber(
      record.sidebarWidth,
      WORKSPACE_LAYOUT_LIMITS.sidebar.defaultSize,
      WORKSPACE_LAYOUT_LIMITS.sidebar.minSize,
      WORKSPACE_LAYOUT_LIMITS.sidebar.maxSize,
    ),
    sidebarDisplay,
    sidebarGroupOrder: uniqueStrings(record.sidebarGroupOrder),
    visiblePanels: normalizeVisiblePanels(record.visiblePanels),
    contextWidth: clampNumber(
      record.contextWidth,
      WORKSPACE_LAYOUT_LIMITS.context.defaultSize,
      WORKSPACE_LAYOUT_LIMITS.context.minSize,
      WORKSPACE_LAYOUT_LIMITS.context.maxSize,
    ),
    inspectorWidth: clampNumber(
      record.inspectorWidth,
      WORKSPACE_LAYOUT_LIMITS.inspector.defaultSize,
      WORKSPACE_LAYOUT_LIMITS.inspector.minSize,
      WORKSPACE_LAYOUT_LIMITS.inspector.maxSize,
    ),
    lastTabs: uniqueStrings(record.lastTabs, 24),
    lastDocumentId:
      typeof record.lastDocumentId === 'string' && record.lastDocumentId.trim() ? record.lastDocumentId.trim() : null,
  });
}

function normalizeLayoutName(name: string): string {
  const normalized = name.trim().replace(/\s+/g, ' ');
  if (!normalized) throw new Error('workspace layout name is required');
  if (normalized.length > MAX_WORKSPACE_LAYOUT_NAME_LENGTH) {
    throw new Error(`workspace layout name exceeds ${MAX_WORKSPACE_LAYOUT_NAME_LENGTH} characters`);
  }
  return normalized;
}

function normalizeSavedLayout(value: unknown, fallbackNow: string): SavedWorkspaceLayout | null {
  const record = asRecord(value);
  if (!record || typeof record.id !== 'string' || !record.id.trim() || typeof record.name !== 'string') return null;
  let name: string;
  try {
    name = normalizeLayoutName(record.name);
  } catch {
    return null;
  }
  return Object.freeze({
    id: record.id.trim(),
    name,
    layout: normalizeWorkspaceLayout(record.layout),
    createdAt: normalizeIsoDate(record.createdAt, fallbackNow),
    updatedAt: normalizeIsoDate(record.updatedAt, fallbackNow),
  });
}

export function createDefaultWorkspacePreferences(now = new Date().toISOString()): WorkspacePreferences {
  return Object.freeze({
    version: WORKSPACE_PREFERENCES_VERSION,
    layout: DEFAULT_WORKSPACE_LAYOUT,
    savedLayouts: Object.freeze([]),
    updatedAt: new Date(now).toISOString(),
  });
}

export function normalizeWorkspacePreferences(value: unknown, now = new Date().toISOString()): WorkspacePreferences {
  const fallbackNow = new Date(now).toISOString();
  const record = asRecord(value);
  if (!record || record.version !== WORKSPACE_PREFERENCES_VERSION)
    return createDefaultWorkspacePreferences(fallbackNow);

  const savedLayouts = Array.isArray(record.savedLayouts)
    ? record.savedLayouts
        .map((item) => normalizeSavedLayout(item, fallbackNow))
        .filter((item): item is SavedWorkspaceLayout => item !== null)
        .slice(0, MAX_SAVED_WORKSPACE_LAYOUTS)
    : [];
  const uniqueLayouts = new Map<string, SavedWorkspaceLayout>();
  for (const layout of savedLayouts) uniqueLayouts.set(layout.id, layout);

  return Object.freeze({
    version: WORKSPACE_PREFERENCES_VERSION,
    layout: normalizeWorkspaceLayout(record.layout),
    savedLayouts: Object.freeze([...uniqueLayouts.values()]),
    updatedAt: normalizeIsoDate(record.updatedAt, fallbackNow),
  });
}

export function resolveResponsiveWorkspaceLayout(
  layout: WorkspaceLayoutSnapshot,
  viewportWidth: number,
): WorkspaceLayoutSnapshot {
  const normalized = normalizeWorkspaceLayout(layout);
  if (!Number.isFinite(viewportWidth) || viewportWidth >= 768) return normalized;

  const usableWidth = Math.max(320, Math.round(viewportWidth));
  const paneMax = Math.max(240, Math.floor(usableWidth * 0.82));
  return Object.freeze({
    ...normalized,
    sidebarCollapsed: true,
    contextWidth: Math.min(normalized.contextWidth, paneMax),
    inspectorWidth: Math.min(normalized.inspectorWidth, paneMax),
  });
}

export interface WorkspacePreferencesService {
  load(): Promise<WorkspacePreferences>;
  saveLayout(layout: WorkspaceLayoutSnapshot): Promise<WorkspacePreferences>;
  patchLayout(patch: Partial<WorkspaceLayoutSnapshot>): Promise<WorkspacePreferences>;
  saveCurrentAs(name: string): Promise<WorkspacePreferences>;
  renameSavedLayout(layoutId: string, name: string): Promise<WorkspacePreferences>;
  applySavedLayout(layoutId: string): Promise<WorkspacePreferences>;
  deleteSavedLayout(layoutId: string): Promise<WorkspacePreferences>;
  restoreDefaults(): Promise<WorkspacePreferences>;
}

export function createWorkspacePreferencesService(
  storage: WorkspacePreferencesStoragePort,
  options: { readonly workspaceId?: string; readonly now?: () => string; readonly randomId?: () => string } = {},
): WorkspacePreferencesService {
  const workspaceId = options.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const now = options.now ?? (() => new Date().toISOString());
  const randomId = options.randomId ?? (() => globalThis.crypto.randomUUID());
  let mutationQueue = Promise.resolve();

  async function read(): Promise<WorkspacePreferences> {
    const value = await storage.read(workspaceId, WORKSPACE_PREFERENCES_STORAGE_KEY);
    return normalizeWorkspacePreferences(value, now());
  }

  async function write(next: WorkspacePreferences): Promise<WorkspacePreferences> {
    const normalized = normalizeWorkspacePreferences(next, now());
    await storage.write(workspaceId, WORKSPACE_PREFERENCES_STORAGE_KEY, normalized);
    return normalized;
  }

  async function replaceLayout(layout: WorkspaceLayoutSnapshot): Promise<WorkspacePreferences> {
    const current = await read();
    return write({
      ...current,
      layout: normalizeWorkspaceLayout(layout),
      updatedAt: now(),
    });
  }

  function enqueue(operation: () => Promise<WorkspacePreferences>): Promise<WorkspacePreferences> {
    const task = mutationQueue.then(operation);
    mutationQueue = task.then(
      () => undefined,
      () => undefined,
    );
    return task;
  }

  return Object.freeze({
    async load() {
      await mutationQueue;
      return read();
    },
    saveLayout(layout: WorkspaceLayoutSnapshot) {
      return enqueue(() => replaceLayout(layout));
    },
    patchLayout(patch: Partial<WorkspaceLayoutSnapshot>) {
      return enqueue(async () => {
        const current = await read();
        return replaceLayout({ ...current.layout, ...patch });
      });
    },
    saveCurrentAs(name: string) {
      return enqueue(async () => {
        const current = await read();
        if (current.savedLayouts.length >= MAX_SAVED_WORKSPACE_LAYOUTS) {
          throw new Error(`workspace layout limit reached (${MAX_SAVED_WORKSPACE_LAYOUTS})`);
        }
        const timestamp = now();
        const saved: SavedWorkspaceLayout = Object.freeze({
          id: randomId(),
          name: normalizeLayoutName(name),
          layout: current.layout,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        return write({
          ...current,
          savedLayouts: Object.freeze([...current.savedLayouts, saved]),
          updatedAt: timestamp,
        });
      });
    },
    renameSavedLayout(layoutId: string, name: string) {
      return enqueue(async () => {
        const current = await read();
        const timestamp = now();
        let found = false;
        const savedLayouts = current.savedLayouts.map((item) => {
          if (item.id !== layoutId) return item;
          found = true;
          return Object.freeze({ ...item, name: normalizeLayoutName(name), updatedAt: timestamp });
        });
        if (!found) throw new Error(`workspace layout not found: ${layoutId}`);
        return write({ ...current, savedLayouts: Object.freeze(savedLayouts), updatedAt: timestamp });
      });
    },
    applySavedLayout(layoutId: string) {
      return enqueue(async () => {
        const current = await read();
        const saved = current.savedLayouts.find((item) => item.id === layoutId);
        if (!saved) throw new Error(`workspace layout not found: ${layoutId}`);
        return write({ ...current, layout: saved.layout, updatedAt: now() });
      });
    },
    deleteSavedLayout(layoutId: string) {
      return enqueue(async () => {
        const current = await read();
        const savedLayouts = current.savedLayouts.filter((item) => item.id !== layoutId);
        if (savedLayouts.length === current.savedLayouts.length)
          throw new Error(`workspace layout not found: ${layoutId}`);
        return write({ ...current, savedLayouts: Object.freeze(savedLayouts), updatedAt: now() });
      });
    },
    restoreDefaults() {
      return enqueue(async () => {
        const current = await read();
        return write({ ...current, layout: DEFAULT_WORKSPACE_LAYOUT, updatedAt: now() });
      });
    },
  });
}
