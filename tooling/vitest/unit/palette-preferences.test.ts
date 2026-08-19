import { describe, expect, it } from 'vitest';
import {
  PALETTE_RECENT_LIMIT,
  emptyPalettePreferences,
  normalizePalettePreferences,
  parsePalettePreferences,
  pushRecentPaletteItem,
  serializePalettePreferences,
  togglePaletteFavorite,
} from '../../../apps/studio/src/shell/palette-preferences';

describe('M03.8 palette workspace preferences', () => {
  it('stores only palette item ids for favorites', () => {
    const next = togglePaletteFavorite(emptyPalettePreferences, 'palette.basic.text');
    expect(next).toEqual({ favorites: ['palette.basic.text'], recent: [] });
    expect(togglePaletteFavorite(next, 'palette.basic.text')).toEqual(emptyPalettePreferences);
  });

  it('deduplicates recents and enforces the recent limit', () => {
    let preferences = emptyPalettePreferences;
    for (let index = 0; index < PALETTE_RECENT_LIMIT + 3; index += 1) {
      preferences = pushRecentPaletteItem(preferences, `palette.test.${index}` as `palette.${string}`);
    }
    expect(preferences.recent).toHaveLength(PALETTE_RECENT_LIMIT);
    expect(preferences.recent[0]).toBe(`palette.test.${PALETTE_RECENT_LIMIT + 2}`);

    const again = pushRecentPaletteItem(preferences, preferences.recent[3]!);
    expect(again.recent[0]).toBe(preferences.recent[3]);
    expect(new Set(again.recent).size).toBe(again.recent.length);
  });

  it('round-trips valid preferences', () => {
    const source = {
      favorites: ['palette.basic.text', 'palette.navigation.navigation'],
      recent: ['palette.dynamic.listing', 'palette.basic.text'],
    } as const;
    expect(parsePalettePreferences(serializePalettePreferences(source))).toEqual(source);
  });

  it('fails closed for corrupt or non-palette storage data', () => {
    expect(parsePalettePreferences('{bad json')).toEqual(emptyPalettePreferences);
    expect(
      normalizePalettePreferences({
        favorites: ['not-a-palette-id', 'palette.basic.text', 42],
        recent: ['wrong', 'palette.forms.form'],
      }),
    ).toEqual({ favorites: ['palette.basic.text'], recent: ['palette.forms.form'] });
  });
});
