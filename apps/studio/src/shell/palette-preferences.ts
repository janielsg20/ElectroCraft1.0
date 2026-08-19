import { useEffect, useState } from 'react';
import type { PaletteItemDescriptor } from './palette-catalog';

export const PALETTE_PREFERENCES_STORAGE_KEY = 'electrocraft.workspace.palette.v1';
export const PALETTE_RECENT_LIMIT = 8;

export interface PalettePreferences {
  readonly favorites: readonly PaletteItemDescriptor['id'][];
  readonly recent: readonly PaletteItemDescriptor['id'][];
}

export const emptyPalettePreferences: PalettePreferences = Object.freeze({ favorites: [], recent: [] });

const uniqueIds = (values: readonly string[]): PaletteItemDescriptor['id'][] => [
  ...new Set(values.filter((value): value is PaletteItemDescriptor['id'] => value.startsWith('palette.'))),
];

export function normalizePalettePreferences(value: unknown): PalettePreferences {
  if (!value || typeof value !== 'object') return emptyPalettePreferences;
  const candidate = value as { favorites?: unknown; recent?: unknown };
  const favorites = Array.isArray(candidate.favorites)
    ? uniqueIds(candidate.favorites.filter((v): v is string => typeof v === 'string'))
    : [];
  const recent = Array.isArray(candidate.recent)
    ? uniqueIds(candidate.recent.filter((v): v is string => typeof v === 'string')).slice(0, PALETTE_RECENT_LIMIT)
    : [];
  return Object.freeze({ favorites, recent });
}

export function parsePalettePreferences(serialized: string | null): PalettePreferences {
  if (!serialized) return emptyPalettePreferences;
  try {
    return normalizePalettePreferences(JSON.parse(serialized));
  } catch {
    return emptyPalettePreferences;
  }
}

export function serializePalettePreferences(preferences: PalettePreferences): string {
  return JSON.stringify(normalizePalettePreferences(preferences));
}

export function togglePaletteFavorite(
  preferences: PalettePreferences,
  paletteItemId: PaletteItemDescriptor['id'],
): PalettePreferences {
  const favorites = preferences.favorites.includes(paletteItemId)
    ? preferences.favorites.filter((id) => id !== paletteItemId)
    : [...preferences.favorites, paletteItemId];
  return Object.freeze({ favorites, recent: preferences.recent });
}

export function pushRecentPaletteItem(
  preferences: PalettePreferences,
  paletteItemId: PaletteItemDescriptor['id'],
): PalettePreferences {
  const recent = [paletteItemId, ...preferences.recent.filter((id) => id !== paletteItemId)].slice(
    0,
    PALETTE_RECENT_LIMIT,
  );
  return Object.freeze({ favorites: preferences.favorites, recent });
}

function loadPreferences(): PalettePreferences {
  if (typeof window === 'undefined') return emptyPalettePreferences;
  try {
    return parsePalettePreferences(window.localStorage.getItem(PALETTE_PREFERENCES_STORAGE_KEY));
  } catch {
    return emptyPalettePreferences;
  }
}

export function usePalettePreferences() {
  const [preferences, setPreferences] = useState<PalettePreferences>(loadPreferences);

  useEffect(() => {
    try {
      window.localStorage.setItem(PALETTE_PREFERENCES_STORAGE_KEY, serializePalettePreferences(preferences));
    } catch {
      // Workspace preferences fail closed to in-memory state when storage is unavailable.
    }
  }, [preferences]);

  return {
    preferences,
    toggleFavorite: (paletteItemId: PaletteItemDescriptor['id']) =>
      setPreferences((current) => togglePaletteFavorite(current, paletteItemId)),
    rememberRecent: (paletteItemId: PaletteItemDescriptor['id']) =>
      setPreferences((current) => pushRecentPaletteItem(current, paletteItemId)),
  } as const;
}
