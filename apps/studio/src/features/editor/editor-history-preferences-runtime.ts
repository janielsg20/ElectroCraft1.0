import {
  EDITOR_VISUAL_HISTORY_STORAGE_KEY,
  VISUAL_HISTORY_LIMITS,
  normalizeVisualHistoryLimit,
} from '@electrocraft/application';

export interface EditorHistoryPreferencesSnapshot {
  readonly visualHistoryLimit: number;
}

const listeners = new Set<() => void>();
let initialized = false;
let storageListenerInstalled = false;
let snapshot: EditorHistoryPreferencesSnapshot = Object.freeze({
  visualHistoryLimit: VISUAL_HISTORY_LIMITS.defaultValue,
});

function publish(limit: unknown) {
  const visualHistoryLimit = normalizeVisualHistoryLimit(limit);
  if (snapshot.visualHistoryLimit === visualHistoryLimit) return snapshot;
  snapshot = Object.freeze({ visualHistoryLimit });
  for (const listener of listeners) listener();
  return snapshot;
}

function readStoredLimit() {
  if (typeof window === 'undefined') return VISUAL_HISTORY_LIMITS.defaultValue;
  const raw = window.localStorage.getItem(EDITOR_VISUAL_HISTORY_STORAGE_KEY);
  if (raw === null) return VISUAL_HISTORY_LIMITS.defaultValue;
  return normalizeVisualHistoryLimit(Number(raw));
}

function ensureInitialized() {
  if (!initialized) {
    initialized = true;
    publish(readStoredLimit());
  }

  if (typeof window !== 'undefined' && !storageListenerInstalled) {
    storageListenerInstalled = true;
    window.addEventListener('storage', (event) => {
      if (event.key !== EDITOR_VISUAL_HISTORY_STORAGE_KEY) return;
      publish(event.newValue === null ? VISUAL_HISTORY_LIMITS.defaultValue : Number(event.newValue));
    });
  }
}

function setVisualHistoryLimit(value: unknown) {
  ensureInitialized();
  const next = publish(value);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(EDITOR_VISUAL_HISTORY_STORAGE_KEY, String(next.visualHistoryLimit));
  }
  return next;
}

export const editorHistoryPreferencesRuntime = Object.freeze({
  subscribe(listener: () => void) {
    ensureInitialized();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    ensureInitialized();
    return snapshot;
  },
  setVisualHistoryLimit,
  restoreDefault() {
    return setVisualHistoryLimit(VISUAL_HISTORY_LIMITS.defaultValue);
  },
});
