import type { ThemePreference } from '@electrocraft/design-system';

export const STUDIO_THEME_STORAGE_KEY = 'electrocraft.studio.theme.v2' as const;
export const LEGACY_STUDIO_APPEARANCE_STORAGE_KEY = 'electrocraft.studio.appearance.v1' as const;
export const LEGACY_STUDIO_PRESETS_STORAGE_KEY = 'electrocraft.studio.appearance-presets.v1' as const;

export type StudioTheme = Exclude<ThemePreference, 'system'>;

export interface StudioThemeStorage {
  readonly read: () => string | null;
  readonly write: (serialized: string) => void;
  readonly remove: () => void;
}

export const DEFAULT_STUDIO_THEME: StudioTheme = 'dark';

export function normalizeStudioTheme(value: unknown): StudioTheme {
  if (value === 'dark') return 'dark';
  if (value === 'light') return 'light';

  if (typeof value === 'object' && value !== null && 'tone' in value) {
    return (value as { readonly tone?: unknown }).tone === 'dark' ? 'dark' : 'light';
  }

  return DEFAULT_STUDIO_THEME;
}

export function serializeStudioTheme(theme: StudioTheme) {
  return JSON.stringify(normalizeStudioTheme(theme));
}

export function deserializeStudioTheme(serialized: string): StudioTheme {
  try {
    return normalizeStudioTheme(JSON.parse(serialized) as unknown);
  } catch {
    return DEFAULT_STUDIO_THEME;
  }
}

export function createBrowserStudioThemeStorage(): StudioThemeStorage {
  return Object.freeze({
    read: () => {
      try {
        return window.localStorage.getItem(STUDIO_THEME_STORAGE_KEY);
      } catch {
        return null;
      }
    },
    write: (serialized: string) => {
      try {
        window.localStorage.setItem(STUDIO_THEME_STORAGE_KEY, serialized);
        window.localStorage.removeItem(LEGACY_STUDIO_APPEARANCE_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STUDIO_PRESETS_STORAGE_KEY);
      } catch {
        // Theme persistence is optional; the current session remains usable in memory.
      }
    },
    remove: () => {
      try {
        window.localStorage.removeItem(STUDIO_THEME_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STUDIO_APPEARANCE_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STUDIO_PRESETS_STORAGE_KEY);
      } catch {
        // Reset still succeeds in memory when storage is unavailable.
      }
    },
  });
}

export function loadStudioTheme(storage: StudioThemeStorage): StudioTheme {
  try {
    const serialized = storage.read();
    return serialized ? deserializeStudioTheme(serialized) : DEFAULT_STUDIO_THEME;
  } catch {
    return DEFAULT_STUDIO_THEME;
  }
}

export function persistStudioTheme(storage: StudioThemeStorage, theme: StudioTheme): StudioTheme {
  const normalized = normalizeStudioTheme(theme);
  try {
    storage.write(serializeStudioTheme(normalized));
  } catch {
    // Storage failures never block theme changes.
  }
  return normalized;
}

export function resetStudioTheme(storage: StudioThemeStorage): StudioTheme {
  try {
    storage.remove();
  } catch {
    // Reset remains deterministic even if storage is denied.
  }
  return DEFAULT_STUDIO_THEME;
}
