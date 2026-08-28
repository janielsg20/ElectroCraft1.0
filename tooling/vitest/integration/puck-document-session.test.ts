import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Render } from '@puckeditor/core';
import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  electroCraftDocumentSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import type { PuckCanonicalRenderer } from '@electrocraft/editor-puck';
import { createStudioPuckDocumentSession } from '../../../apps/studio/src/features/editor/puck-document-session';

function componentTemplate(): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse(
    JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/component-definition-v1.json'), 'utf8')),
  );
}

function component(key: string, label: string): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse({
    ...componentTemplate(),
    id: createDeterministicObjectId('component', `m05.1-${key}`),
    key,
    label,
    fields: [],
    defaultProps: {},
  });
}

const containerRenderer: PuckCanonicalRenderer = ({ children }) =>
  createElement('main', null, typeof children === 'function' ? children() : null);
const textRenderer: PuckCanonicalRenderer = ({ text }) => createElement('p', null, String(text ?? ''));

describe('M05.1 Studio Puck document session', () => {
  it('uses real Puck Render with core.root envelope, public Slot mapping and visible diagnostics', () => {
    const document = electroCraftDocumentSchema.parse({
      schemaVersion: 4,
      id: createDeterministicObjectId('document', 'm05.1-screen-home'),
      version: 1,
      name: 'Inicio',
      kind: 'screen',
      root: {
        id: createDeterministicObjectId('node', 'm05.1-core-root'),
        componentRef: 'core.root',
        props: { label: 'Inicio' },
        children: [
          {
            id: createDeterministicObjectId('node', 'm05.1-layout-container'),
            componentRef: 'Container',
            props: {},
            children: [
              {
                id: createDeterministicObjectId('node', 'm05.1-title-home'),
                componentRef: 'Text',
                props: { text: 'Contenido válido' },
                children: [],
              },
              {
                id: createDeterministicObjectId('node', 'm05.1-legacy-widget'),
                componentRef: 'LegacyWidget',
                props: { legacy: true },
                children: [],
              },
            ],
          },
        ],
      },
      references: { documentRefs: [] },
      metadata: { fixture: 'm05.1' },
      formMeta: null,
      templateMeta: null,
    });
    const session = createStudioPuckDocumentSession(
      document,
      [component('Container', 'Contenedor'), component('Text', 'Texto')],
      {
        Container: containerRenderer,
        Text: textRenderer,
      },
    );

    expect(session.data.root).toMatchObject({ props: { label: 'Inicio' } });
    expect(session.config.components.Container.fields?.children).toMatchObject({ type: 'slot', label: 'Contenido' });
    expect(session.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-component', componentRef: 'LegacyWidget' }),
    );
    const markup = renderToStaticMarkup(createElement(Render, { config: session.config, data: session.data }));
    expect(markup).toContain('Contenido válido');
    expect(markup).toContain('Componente no disponible: LegacyWidget');
    expect(session.reconstruct(session.data).document).toEqual(document);
  });
});
