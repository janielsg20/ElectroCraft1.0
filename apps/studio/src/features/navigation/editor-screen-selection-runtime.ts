export interface EditorScreenSelectionSnapshot {
  readonly screenId: string | null;
}

const listeners = new Set<() => void>();
let snapshot: EditorScreenSelectionSnapshot = Object.freeze({
  screenId: typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('screen'),
});
let browserListenerBound = false;

function publish(screenId: string | null) {
  if (snapshot.screenId === screenId) return snapshot;
  snapshot = Object.freeze({ screenId });
  for (const listener of listeners) listener();
  return snapshot;
}

function readLocationScreenId() {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('screen');
}

function bindBrowserListener() {
  if (browserListenerBound || typeof window === 'undefined') return;
  browserListenerBound = true;
  window.addEventListener('popstate', () => publish(readLocationScreenId()));
}

function writeLocation(screenId: string | null, replace: boolean) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.pathname !== '/editor') url.pathname = '/editor';
  if (screenId) url.searchParams.set('screen', screenId);
  else url.searchParams.delete('screen');
  if (replace) window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  else window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export const editorScreenSelectionRuntime = Object.freeze({
  subscribe(listener: () => void) {
    bindBrowserListener();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  syncFromLocation() {
    bindBrowserListener();
    return publish(readLocationScreenId());
  },
  select(screenIdInput: string, options: { readonly replace?: boolean } = {}) {
    const screenId = screenIdInput.trim();
    if (!screenId) throw new TypeError('La Pantalla seleccionada debe tener un ID válido.');
    writeLocation(screenId, options.replace === true);
    return publish(screenId);
  },
  clear(options: { readonly replace?: boolean } = {}) {
    writeLocation(null, options.replace === true);
    return publish(null);
  },
});
