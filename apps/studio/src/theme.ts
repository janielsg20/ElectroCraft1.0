import type { ThemePreference } from '@electrocraft/design-system';

export const EDITOR_APPEARANCE_STORAGE_KEY = 'electrocraft.studio.appearance.v1' as const;

export type EditorAppearanceTone = ThemePreference;
export type EditorAppearanceAccent = 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose';
export type EditorAppearanceDensity = 'high' | 'comfortable';
export type EditorCanvasDensity = 'compact' | 'comfortable' | 'spacious';

export interface EditorAppearanceProfile {
  readonly name: string;
  readonly tone: EditorAppearanceTone;
  readonly accent: EditorAppearanceAccent;
  readonly density: EditorAppearanceDensity;
  readonly canvasDensity: EditorCanvasDensity;
}

export interface EditorAppearanceStorage {
  readonly read: () => string | null;
  readonly write: (serialized: string) => void;
  readonly remove: () => void;
}

export const DEFAULT_EDITOR_APPEARANCE_PROFILE: EditorAppearanceProfile = Object.freeze({
  name: 'ElectroCraft',
  tone: 'system',
  accent: 'indigo',
  density: 'high',
  canvasDensity: 'comfortable',
});

const tones = new Set<EditorAppearanceTone>(['light', 'dark', 'system']);
const accents = new Set<EditorAppearanceAccent>(['indigo', 'blue', 'emerald', 'amber', 'rose']);
const densities = new Set<EditorAppearanceDensity>(['high', 'comfortable']);
const canvasDensities = new Set<EditorCanvasDensity>(['compact', 'comfortable', 'spacious']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizedName(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 48) : fallback;
}

export function normalizeEditorAppearanceProfile(value: unknown): EditorAppearanceProfile {
  if (!isRecord(value)) return DEFAULT_EDITOR_APPEARANCE_PROFILE;

  return Object.freeze({
    name: normalizedName(value.name, DEFAULT_EDITOR_APPEARANCE_PROFILE.name),
    tone: tones.has(value.tone as EditorAppearanceTone)
      ? (value.tone as EditorAppearanceTone)
      : DEFAULT_EDITOR_APPEARANCE_PROFILE.tone,
    accent: accents.has(value.accent as EditorAppearanceAccent)
      ? (value.accent as EditorAppearanceAccent)
      : DEFAULT_EDITOR_APPEARANCE_PROFILE.accent,
    density: densities.has(value.density as EditorAppearanceDensity)
      ? (value.density as EditorAppearanceDensity)
      : DEFAULT_EDITOR_APPEARANCE_PROFILE.density,
    canvasDensity: canvasDensities.has(value.canvasDensity as EditorCanvasDensity)
      ? (value.canvasDensity as EditorCanvasDensity)
      : DEFAULT_EDITOR_APPEARANCE_PROFILE.canvasDensity,
  });
}

export function serializeEditorAppearanceProfile(profile: EditorAppearanceProfile) {
  return JSON.stringify(normalizeEditorAppearanceProfile(profile));
}

export function deserializeEditorAppearanceProfile(serialized: string): EditorAppearanceProfile {
  try {
    return normalizeEditorAppearanceProfile(JSON.parse(serialized) as unknown);
  } catch {
    return DEFAULT_EDITOR_APPEARANCE_PROFILE;
  }
}

export function createBrowserEditorAppearanceStorage(): EditorAppearanceStorage {
  return Object.freeze({
    read: () => {
      try {
        return window.localStorage.getItem(EDITOR_APPEARANCE_STORAGE_KEY);
      } catch {
        return null;
      }
    },
    write: (serialized) => {
      try {
        window.localStorage.setItem(EDITOR_APPEARANCE_STORAGE_KEY, serialized);
      } catch {
        // Storage is an optional adapter. Runtime appearance remains usable in memory.
      }
    },
    remove: () => {
      try {
        window.localStorage.removeItem(EDITOR_APPEARANCE_STORAGE_KEY);
      } catch {
        // Reset still succeeds in memory when storage is unavailable.
      }
    },
  });
}

export function loadEditorAppearanceProfile(storage: EditorAppearanceStorage): EditorAppearanceProfile {
  try {
    const serialized = storage.read();
    return serialized ? deserializeEditorAppearanceProfile(serialized) : DEFAULT_EDITOR_APPEARANCE_PROFILE;
  } catch {
    return DEFAULT_EDITOR_APPEARANCE_PROFILE;
  }
}

export function persistEditorAppearanceProfile(storage: EditorAppearanceStorage, profile: EditorAppearanceProfile) {
  const normalized = normalizeEditorAppearanceProfile(profile);
  try {
    storage.write(serializeEditorAppearanceProfile(normalized));
  } catch {
    // Persistence failure must never block the Studio session.
  }
  return normalized;
}

export function resetEditorAppearanceProfile(current: EditorAppearanceProfile): EditorAppearanceProfile {
  return Object.freeze({
    ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
    name: normalizedName(current.name, DEFAULT_EDITOR_APPEARANCE_PROFILE.name),
  });
}

export function resolveEditorAppearanceProfile(
  preview: EditorAppearanceProfile | null,
  applied: EditorAppearanceProfile | null,
): EditorAppearanceProfile {
  return preview ?? applied ?? DEFAULT_EDITOR_APPEARANCE_PROFILE;
}
