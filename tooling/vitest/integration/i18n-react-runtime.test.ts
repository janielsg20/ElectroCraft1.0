import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { electroCraftComponentDefinitionSchema } from '@electrocraft/domain';
import { createPuckConfig, type PuckCanonicalRenderer, type PuckLabelResolver } from '@electrocraft/editor-puck';
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

  it('injects translated Puck labels without translating component or field ids', () => {
    const definition = electroCraftComponentDefinitionSchema.parse(
      JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/component-definition-v1.json'), 'utf8')),
    );
    const renderer: PuckCanonicalRenderer = ({ title }) => createElement('h2', null, String(title));
    const labels: PuckLabelResolver = {
      component: (component) => translateStrict('editor', `puck.component.${component.key}` as never),
      field: (component, field) => translateStrict('editor', `puck.field.${component.key}.${field.key}` as never),
      booleanOption: (value) => translateStrict('editor', value ? 'puck.boolean.yes' : 'puck.boolean.no'),
    };

    const config = createPuckConfig([definition], { HeadingBlock: renderer }, labels);
    expect(Object.keys(config.components)).toEqual(['HeadingBlock']);
    expect(config.components.HeadingBlock.label).toBe('Encabezado');
    expect(config.components.HeadingBlock.fields?.title).toMatchObject({ label: 'Título' });
    expect(config.components.HeadingBlock.fields?.emphasis).toMatchObject({
      label: 'Énfasis',
      options: [
        { label: 'Sí', value: true },
        { label: 'No', value: false },
      ],
    });
    expect(config.components.HeadingBlock.metadata?.electrocraftComponentId).toBe(definition.id);
  });
});
