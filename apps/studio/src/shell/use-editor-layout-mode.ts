import { useSyncExternalStore } from 'react';
import { resolveEditorLayoutMode, type EditorLayoutMode } from './editor-layout-model';

function subscribe(callback: () => void) {
  window.addEventListener('resize', callback, { passive: true });
  return () => window.removeEventListener('resize', callback);
}

function getWidthSnapshot(): number {
  return window.innerWidth;
}

function getServerWidthSnapshot(): number {
  return 1280;
}

export function useEditorViewportWidth(): number {
  return useSyncExternalStore(subscribe, getWidthSnapshot, getServerWidthSnapshot);
}

export function useEditorLayoutMode(): EditorLayoutMode {
  return resolveEditorLayoutMode(useEditorViewportWidth());
}
