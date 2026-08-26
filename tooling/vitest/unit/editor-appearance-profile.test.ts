import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STUDIO_THEME,
  deserializeStudioTheme,
  loadStudioTheme,
  persistStudioTheme,
  resetStudioTheme,
  serializeStudioTheme,
  type StudioThemeStorage,
} from '../../../apps/studio/src/theme';

function memoryStorage(initial: string | null = null): StudioThemeStorage & { current: () => string | null } {
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

describe('M03.9 single Studio theme preference', () => {
  it('uses dark as the deterministic default and fails closed for invalid values', () => {
    expect(DEFAULT_STUDIO_THEME).toBe('dark');
    expect(loadStudioTheme(memoryStorage())).toBe('dark');
    expect(loadStudioTheme(memoryStorage('{broken'))).toBe('dark');
    expect(deserializeStudioTheme(JSON.stringify('system'))).toBe('dark');
    expect(deserializeStudioTheme(JSON.stringify('unknown'))).toBe('dark');
  });

  it('accepts only light and dark modes', () => {
    expect(deserializeStudioTheme(serializeStudioTheme('light'))).toBe('light');
    expect(deserializeStudioTheme(serializeStudioTheme('dark'))).toBe('dark');
  });

  it('can read a legacy appearance object without keeping its old preset system', () => {
    expect(deserializeStudioTheme(JSON.stringify({ tone: 'dark', accent: 'rose', framework: 'heroui' }))).toBe('dark');
    expect(deserializeStudioTheme(JSON.stringify({ tone: 'system', accent: 'emerald' }))).toBe('light');
  });

  it('persists the selected mode and reloads it', () => {
    const storage = memoryStorage();
    expect(persistStudioTheme(storage, 'dark')).toBe('dark');
    expect(storage.current()).toBe(JSON.stringify('dark'));
    expect(loadStudioTheme(storage)).toBe('dark');
  });

  it('resets to the single dark baseline', () => {
    const storage = memoryStorage(JSON.stringify('dark'));
    expect(resetStudioTheme(storage)).toBe('dark');
    expect(storage.current()).toBeNull();
  });

  it('survives a denied storage adapter without throwing', () => {
    const broken: StudioThemeStorage = {
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

    expect(loadStudioTheme(broken)).toBe('dark');
    expect(() => persistStudioTheme(broken, 'dark')).not.toThrow();
    expect(() => resetStudioTheme(broken)).not.toThrow();
  });
});
