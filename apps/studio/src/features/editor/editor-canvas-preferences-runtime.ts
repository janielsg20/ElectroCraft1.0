import {
  DEFAULT_EDITOR_CANVAS_PREFERENCES,
  EDITOR_CANVAS_PREFERENCES_STORAGE_KEY,
  normalizeEditorCanvasPreferences,
  type EditorCanvasPreferences,
} from '@electrocraft/application';

const listeners = new Set<() => void>();
let initialized = false;
let storageListenerInstalled = false;
let snapshot: EditorCanvasPreferences = DEFAULT_EDITOR_CANVAS_PREFERENCES;

function publish(value: unknown) {
  const next = normalizeEditorCanvasPreferences(value);
  if (
    snapshot.rulersVisible === next.rulersVisible &&
    snapshot.guidesVisible === next.guidesVisible &&
    snapshot.snappingEnabled === next.snappingEnabled &&
    snapshot.snapGridSize === next.snapGridSize
  ) {
    return snapshot;
  }
  snapshot = next;
  for (const listener of listeners) listener();
  return snapshot;
}

function readStoredPreferences() {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_CANVAS_PREFERENCES;
  const raw = window.localStorage.getItem(EDITOR_CANVAS_PREFERENCES_STORAGE_KEY);
  if (!raw) return DEFAULT_EDITOR_CANVAS_PREFERENCES;
  try {
    return normalizeEditorCanvasPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_EDITOR_CANVAS_PREFERENCES;
  }
}

function ensureInitialized() {
  if (!initialized) {
    initialized = true;
    publish(readStoredPreferences());
  }
  if (typeof window !== 'undefined' && !storageListenerInstalled) {
    storageListenerInstalled = true;
    window.addEventListener('storage', (event) => {
      if (event.key !== EDITOR_CANVAS_PREFERENCES_STORAGE_KEY) return;
      if (!event.newValue) {
        publish(DEFAULT_EDITOR_CANVAS_PREFERENCES);
        return;
      }
      try {
        publish(JSON.parse(event.newValue));
      } catch {
        publish(DEFAULT_EDITOR_CANVAS_PREFERENCES);
      }
    });
  }
}

function patch(patchValue: Partial<EditorCanvasPreferences>) {
  ensureInitialized();
  const next = publish({ ...snapshot, ...patchValue });
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EDITOR_CANVAS_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export const editorCanvasPreferencesRuntime = Object.freeze({
  subscribe(listener: () => void) {
    ensureInitialized();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureInitialized();
    return snapshot;
  },
  patch,
  restoreDefault() {
    return patch(DEFAULT_EDITOR_CANVAS_PREFERENCES);
  },
});
