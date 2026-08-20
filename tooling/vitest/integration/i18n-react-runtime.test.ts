import {
  ElectroCraftI18nProvider,
  initializeElectroCraftI18n,
  translateStrict,
  useElectroCraftTranslation,
} from '@electrocraft/i18n';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

function Probe() {
  const { t } = useElectroCraftTranslation('settings');
  return createElement('span', null, t('settings.language.spanish'));
}

describe('M03.10 react-i18next integration', () => {
  it('renders Spanish through the shared provider and typed hook', async () => {
    await initializeElectroCraftI18n();
    const html = renderToStaticMarkup(
      createElement(ElectroCraftI18nProvider, null, createElement(Probe)),
    );
    expect(html).toContain('Español');
  });

  it('keeps server/import-time copy deterministic before UI composition', () => {
    expect(translateStrict('navigation', 'studio.sidebar.group.build')).toBe('Construir');
  });
});
