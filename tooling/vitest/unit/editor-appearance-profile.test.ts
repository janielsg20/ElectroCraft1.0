import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EDITOR_APPEARANCE_PROFILE,
  BUILT_IN_STUDIO_APPEARANCE_PRESETS,
  createPersonalStudioAppearancePreset,
  deserializeEditorAppearanceProfile,
  deserializePersonalStudioAppearancePresets,
  getStudioAppearanceAccessibilityWarnings,
  loadEditorAppearanceProfile,
  persistEditorAppearanceProfile,
  persistPersonalStudioAppearancePresets,
  resetEditorAppearanceProfile,
  resolveEditorAppearanceProfile,
  resolveStudioAnimationIntensity,
  restoreAccessibleEditorAppearanceDefaults,
  type EditorAppearanceStorage,
  type StudioAppearancePresetStorage,
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

function presetStorage(): StudioAppearancePresetStorage & { current: () => string | null } {
  let value: string | null = null;
  return {
    read: () => value,
    write: (serialized) => {
      value = serialized;
    },
    current: () => value,
  };
}

describe('M03.9 editor session appearance profile', () => {
  it('falls back safely and migrates an older partial profile to complete defaults', () => {
    expect(loadEditorAppearanceProfile(memoryStorage())).toEqual(DEFAULT_EDITOR_APPEARANCE_PROFILE);
    expect(loadEditorAppearanceProfile(memoryStorage('{broken'))).toEqual(DEFAULT_EDITOR_APPEARANCE_PROFILE);

    const migrated = deserializeEditorAppearanceProfile(
      JSON.stringify({
        name: 'Mi perfil',
        tone: 'unknown',
        accent: 'emerald',
        density: 'nope',
        canvasDensity: 'compact',
      }),
    );

    expect(migrated).toMatchObject({
      name: 'Mi perfil',
      tone: 'system',
      accent: 'emerald',
      density: 'high',
      canvasDensity: 'compact',
    });
    expect(migrated.typographyFamily).toBe('system');
    expect(migrated.animationIntensity).toBe('standard');
    expect(migrated.contrastPreference).toBe('standard');
  });

  it('uses preview over applied over defaults', () => {
    const applied = { ...DEFAULT_EDITOR_APPEARANCE_PROFILE, accent: 'blue' as const };
    const preview = { ...applied, accent: 'rose' as const };

    expect(resolveEditorAppearanceProfile(preview, applied)).toBe(preview);
    expect(resolveEditorAppearanceProfile(null, applied)).toBe(applied);
    expect(resolveEditorAppearanceProfile(null, null)).toBe(DEFAULT_EDITOR_APPEARANCE_PROFILE);
  });

  it('exposes framework-attributed built-in themes as complete high-density profiles', () => {
    const external = BUILT_IN_STUDIO_APPEARANCE_PRESETS.filter((preset) => preset.framework !== 'electrocraft');

    expect(external).toHaveLength(5);
    expect(external.every((preset) => preset.profile.framework === preset.framework)).toBe(true);
    expect(external.every((preset) => preset.profile.density === 'high')).toBe(true);
  });

  it('persists a complete applied profile and reloads it like a remount', () => {
    const storage = memoryStorage();
    const applied = {
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Mi Studio',
      tone: 'dark' as const,
      accent: 'emerald' as const,
      typographyFamily: 'humanist' as const,
      iconStyle: 'strong' as const,
      radii: 'rounded' as const,
      density: 'comfortable' as const,
      canvasDensity: 'spacious' as const,
      animationIntensity: 'high' as const,
    };

    persistEditorAppearanceProfile(storage, applied);
    expect(storage.current()).not.toBeNull();
    expect(loadEditorAppearanceProfile(storage)).toEqual(applied);
  });

  it('resets exact appearance defaults while retaining a custom profile name', () => {
    const reset = resetEditorAppearanceProfile({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Perfil tatuaje',
      tone: 'dark',
      accent: 'rose',
      density: 'comfortable',
      canvasDensity: 'compact',
    });

    expect(reset).toEqual({ ...DEFAULT_EDITOR_APPEARANCE_PROFILE, name: 'Perfil tatuaje' });
  });

  it('persists personal presets outside the project profile', () => {
    const storage = presetStorage();
    const preset = createPersonalStudioAppearancePreset(
      { ...DEFAULT_EDITOR_APPEARANCE_PROFILE, name: 'Mi preset', accent: 'amber' },
      'unit-1',
    );

    persistPersonalStudioAppearancePresets(storage, [preset]);
    const serialized = storage.current();
    expect(serialized).not.toBeNull();
    expect(deserializePersonalStudioAppearancePresets(serialized ?? '[]')).toEqual([preset]);
  });

  it('warns about invalid accessibility combinations and restores accessible defaults', () => {
    const invalid = {
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Compacto',
      semanticColors: 'muted' as const,
      contrastPreference: 'standard' as const,
      typographyScale: 'compact' as const,
      controlSize: 'compact' as const,
      density: 'high' as const,
    };

    expect(getStudioAppearanceAccessibilityWarnings(invalid).length).toBeGreaterThanOrEqual(2);
    const restored = restoreAccessibleEditorAppearanceDefaults(invalid);
    expect(restored.name).toBe('Compacto');
    expect(restored.contrastPreference).toBe('high');
    expect(restored.animationIntensity).toBe('reduced');
    expect(getStudioAppearanceAccessibilityWarnings(restored)).toEqual([]);
  });

  it('caps requested animation intensity when the operating system requests reduced motion', () => {
    expect(resolveStudioAnimationIntensity('high', false)).toBe('high');
    expect(resolveStudioAnimationIntensity('high', true)).toBe('reduced');
    expect(resolveStudioAnimationIntensity('standard', true)).toBe('reduced');
    expect(resolveStudioAnimationIntensity('none', true)).toBe('none');
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
