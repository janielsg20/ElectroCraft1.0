import { describe, expect, it } from 'vitest';
import {
  getPaletteItemsByCategory,
  paletteCatalog,
  paletteCategories,
  resolvePaletteInsert,
  searchPaletteCatalog,
  validatePaletteCatalog,
} from '../../../apps/studio/src/shell/palette-catalog';

describe('M03.8 palette catalog', () => {
  it('validates the catalog and exact category contract', () => {
    expect(validatePaletteCatalog()).toEqual([]);
    expect(paletteCategories).toEqual([
      'Layout',
      'Basic',
      'Content',
      'Navigation',
      'Dynamic Data',
      'Forms',
      'Filters',
      'Social / Contact',
      'Admin',
      'Commerce Pack',
    ]);
    expect(new Set(paletteCatalog.map((item) => item.id)).size).toBe(paletteCatalog.length);
    expect(paletteCategories.every((category) => getPaletteItemsByCategory(paletteCatalog, category).length > 0)).toBe(
      true,
    );
  });

  it.each([
    ['posts', ['palette.content.post-card', 'palette.dynamic.listing', 'palette.dynamic.field']],
    ['menu', ['palette.navigation.navigation', 'palette.navigation.mobile', 'palette.navigation.user-menu']],
    ['login', ['palette.navigation.login', 'palette.forms.form']],
    ['JetEngine', ['palette.dynamic.field', 'palette.dynamic.listing', 'palette.filters.filter']],
    ['social', ['palette.social.icons', 'palette.social.share', 'palette.social.message']],
    ['commerce', ['palette.commerce.product-card', 'palette.commerce.product-grid', 'palette.commerce.checkout']],
  ])('discovers contract items for %s', (query, expectedIds) => {
    const ids = searchPaletteCatalog(query).map((item) => item.id);
    for (const expectedId of expectedIds) expect(ids).toContain(expectedId);
  });

  it('normalizes casing and diacritics', () => {
    expect(searchPaletteCatalog('CUADRICULA').some((item) => item.id === 'palette.layout.grid')).toBe(true);
    expect(searchPaletteCatalog('teléfono').some((item) => item.name.includes('Teléfono'))).toBe(true);
  });

  it('keeps preset aliases pointing to reusable component refs instead of unique definitions', () => {
    const heading = paletteCatalog.find((item) => item.id === 'palette.basic.heading');
    const paragraph = paletteCatalog.find((item) => item.id === 'palette.basic.paragraph');
    const text = paletteCatalog.find((item) => item.id === 'palette.basic.text');
    expect(heading?.componentRef).toBe('Text');
    expect(paragraph?.componentRef).toBe('Text');
    expect(text?.componentRef).toBe('Text');
  });

  it('fails closed when a catalog item has no owner mapping yet', () => {
    const descriptor = paletteCatalog.find((item) => item.id === 'palette.content.card');
    expect(descriptor).toBeDefined();
    const resolution = resolvePaletteInsert(descriptor!, new Set());
    expect(resolution.status).toBe('blocked');
    if (resolution.status === 'blocked') expect(resolution.diagnostic.code).toBe('PALETTE_MAPPING_PENDING');
  });

  it('fails closed when a componentRef is not registered in active Puck config', () => {
    const descriptor = paletteCatalog.find((item) => item.id === 'palette.basic.text');
    expect(descriptor).toBeDefined();
    const resolution = resolvePaletteInsert(descriptor!, new Set());
    expect(resolution.status).toBe('blocked');
    if (resolution.status === 'blocked') expect(resolution.diagnostic.code).toBe('PALETTE_COMPONENT_UNAVAILABLE');
  });

  it('returns a ready insertion only for a component registered by the owner adapter', () => {
    const descriptor = paletteCatalog.find((item) => item.id === 'palette.basic.text');
    expect(descriptor).toBeDefined();
    expect(resolvePaletteInsert(descriptor!, new Set(['Text']))).toEqual({ status: 'ready', componentType: 'Text' });
  });
});
