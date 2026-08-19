import { describe, expect, it } from 'vitest';
import {
  getPaletteItemById,
  resolvePaletteInsert,
  searchPaletteCatalog,
} from '../../../apps/studio/src/shell/palette-catalog';
import {
  emptyPalettePreferences,
  parsePalettePreferences,
  pushRecentPaletteItem,
  serializePalettePreferences,
  togglePaletteFavorite,
} from '../../../apps/studio/src/shell/palette-preferences';

describe('M03.8 palette runtime integration', () => {
  it('connects discovery to workspace preferences without cloning definitions', () => {
    const [listing] = searchPaletteCatalog('posts').filter((item) => item.id === 'palette.dynamic.listing');
    expect(listing).toBeDefined();

    const favorited = togglePaletteFavorite(emptyPalettePreferences, listing!.id);
    const used = pushRecentPaletteItem(favorited, listing!.id);
    const restored = parsePalettePreferences(serializePalettePreferences(used));

    expect(restored).toEqual({ favorites: [listing!.id], recent: [listing!.id] });
    expect(getPaletteItemById(restored.favorites[0]!)?.componentRef).toBe('Listing');
  });

  it('keeps discovery usable while insertion is honestly blocked before F05 mappings exist', () => {
    const login = searchPaletteCatalog('login').find((item) => item.id === 'palette.navigation.login');
    expect(login).toBeDefined();
    const resolution = resolvePaletteInsert(login!, new Set());
    expect(resolution.status).toBe('blocked');
    if (resolution.status === 'blocked') {
      expect(resolution.diagnostic.location).toBe('Construir > Editor > Componentes');
      expect(resolution.diagnostic.cause.length).toBeGreaterThan(0);
      expect(resolution.diagnostic.action.length).toBeGreaterThan(0);
    }
  });

  it('becomes insertable without changing the palette id when the owner component appears', () => {
    const text = getPaletteItemById('palette.basic.heading');
    expect(text?.componentRef).toBe('Text');
    const blocked = resolvePaletteInsert(text!, new Set());
    const ready = resolvePaletteInsert(text!, new Set(['Text']));
    expect(blocked.status).toBe('blocked');
    expect(ready).toEqual({ status: 'ready', componentType: 'Text' });
    expect(text?.id).toBe('palette.basic.heading');
  });
});
