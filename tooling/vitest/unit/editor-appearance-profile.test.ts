import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EDITOR_APPEARANCE_PROFILE,
  deserializeEditorAppearanceProfile,
  loadEditorAppearanceProfile,
  persistEditorAppearanceProfile,
  resetEditorAppearanceProfile,
  resolveEditorAppearanceProfile,
  type EditorAppearanceStorage,
} from '../../../apps/studio/src/theme';

function memoryStorage(initial: string | null = null): EditorAppearanceStorage & { current: () => string | null } {
  let value = initial;
  return {
    read: () => value,
    write: (serialized) => {
      value = serialized;
    },
    remove: () => {
      value = null;
    },
    current: () => value,
  };
}

describe('M03.9 editor session appearance profile', () => {
  it('falls back safely for missing, malformed and partially invalid storage', () => {
    expect(loadEditorAppearanceProfile(memoryStorage())).toEqual(DEFAULT_EDITOR_APPEARANCE_PROFILE);
    expect(loadEditorAppearanceProfile(memoryStorage('{broken'))).toEqual(DEFAULT_EDITOR_APPEARANCE_PROFILE);
    expect(
      deserializeEditorAppearanceProfile(
        JSON.stringify({ name: 'Mi perfil', tone: 'unknown', accent: 'emerald', density: 'nope', canvasDensity: 'compact' }),
      ),
    ).toEqual({
      name: 'Mi perfil',
      tone: 'system',
      accent: 'emerald',
      density: 'high',
      canvasDensity: 'compact',
    });
  });

  it('uses preview over applied over defaults', () => {
    const applied = { ...DEFAULT_EDITOR_APPEARANCE_PROFILE, accent: 'blue' as const };
    const preview = { ...applied, accent: 'rose' as const };

    expect(resolveEditorAppearanceProfile(preview, applied)).toBe(preview);
    expect(resolveEditorAppearanceProfile(null, applied)).toBe(applied);
    expect(resolveEditorAppearanceProfile(null, null)).toBe(DEFAULT_EDITOR_APPEARANCE_PROFILE);
  });

  it('persists an applied profile and reloads it like a remount', () => {
    const storage = memoryStorage();
    const applied = {
      name: 'Mi Studio',
      tone: 'dark' as const,
      accent: 'emerald' as const,
      density: 'comfortable' as const,
      canvasDensity: 'spacious' as const,
    };

    persistEditorAppearanceProfile(storage, applied);
    expect(storage.current()).not.toBeNull();
    expect(loadEditorAppearanceProfile(storage)).toEqual(applied);
  });

  it('resets exact appearance defaults while retaining a custom profile name', () => {
    const reset = resetEditorAppearanceProfile({
      name: 'Perfil tatuaje',
      tone: 'dark',
      accent: 'rose',
      density: 'comfortable',
      canvasDensity: 'compact',
    });

    expect(reset).toEqual({ ...DEFAULT_EDITOR_APPEARANCE_PROFILE, name: 'Perfil tatuaje' });
  });

  it('survives a broken storage adapter without throwing', () => {
    const broken: EditorAppearanceStorage = {
      read: () => {
        throw new Error('denied');
      },
      write: () => {
        throw new Error('denied');
      },
      remove: () => {
        throw new Error('denied');
      },
    };

    expect(loadEditorAppearanceProfile(broken)).toEqual(DEFAULT_EDITOR_APPEARANCE_PROFILE);
    expect(() => persistEditorAppearanceProfile(broken, DEFAULT_EDITOR_APPEARANCE_PROFILE)).not.toThrow();
  });
});
