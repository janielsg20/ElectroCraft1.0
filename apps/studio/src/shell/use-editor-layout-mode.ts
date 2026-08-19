import { useSyncExternalStore } from 'react';
import { resolveEditorLayoutMode, type EditorLayoutMode } from './editor-layout-model';

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback, { passive: true });
  return () => window.removeEventListener('resize', callback);
}

function getSnapshot(): EditorLayoutMode {
  return resolveEditorLayoutMode(window.innerWidth);
}

function getServerSnapshot(): EditorLayoutMode {
  return 'desktop';
}

export function useEditorLayoutMode(): EditorLayoutMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
