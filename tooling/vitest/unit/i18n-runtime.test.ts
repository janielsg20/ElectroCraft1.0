import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  MissingTranslationError,
  electroCraftI18n,
  electroCraftNamespaces,
  formatDateEs,
  formatNumberEs,
  initializeElectroCraftI18n,
  resourcesEs,
  translateStrict,
} from '@electrocraft/i18n';
import { describe, expect, it } from 'vitest';

describe('M03.10 Spanish-first i18n runtime', () => {
  it('owns the required namespaces with Spanish as initial and fallback locale', async () => {
    await initializeElectroCraftI18n();
    expect(DEFAULT_LOCALE).toBe('es');
    expect(FALLBACK_LOCALE).toBe('es');
    expect(electroCraftNamespaces).toEqual([
      'common',
      'navigation',
      'editor',
      'content',
      'queries',
      'forms',
      'backend',
      'media',
      'themes',
      'export',
      'settings',
      'help',
      'ai',
    ]);
    for (const namespace of electroCraftNamespaces) expect(Object.keys(resourcesEs[namespace]).length).toBeGreaterThan(0);
    expect(electroCraftI18n.language).toBe('es');
  });

  it('fails closed for a missing visible key', () => {
    expect(() => translateStrict('settings', 'settings.missing' as never)).toThrow(MissingTranslationError);
  });

  it('uses Spanish pluralization and Intl formatting', async () => {
    await initializeElectroCraftI18n();
    expect(electroCraftI18n.t('items.count', { ns: 'common', count: 1 })).toBe('1 elemento');
    expect(electroCraftI18n.t('items.count', { ns: 'common', count: 3 })).toBe('3 elementos');
    expect(formatNumberEs(1234.5)).toContain(',5');
    expect(formatDateEs(Date.UTC(2026, 0, 2), { timeZone: 'UTC', year: 'numeric' })).toContain('2026');
  });

  it('returns required Settings copy from the typed owner', () => {
    expect(translateStrict('settings', 'settings.general.title')).toBe('Configuración general');
    expect(translateStrict('settings', 'settings.language.label')).toBe('Idioma');
    expect(translateStrict('settings', 'settings.language.spanish')).toBe('Español');
  });
});
