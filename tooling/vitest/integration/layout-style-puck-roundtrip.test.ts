import { describe, expect, it } from 'vitest';
import {
  createDefaultElectroCraftLayout,
  createDefaultElectroCraftStyle,
  createDeterministicObjectId,
  electroCraftDocumentSchema,
} from '@electrocraft/domain';
import {
  ELECTROCRAFT_PUCK_LAYOUT_PROP,
  ELECTROCRAFT_PUCK_STYLE_PROP,
  createPuckDocumentAdapter,
} from '@electrocraft/editor-puck';

function documentFixture() {
  return electroCraftDocumentSchema.parse({
    schemaVersion: 4,
    id: createDeterministicObjectId('document', 'm06.1-layout-style'),
    version: 1,
    name: 'Layout y estilo',
    kind: 'screen',
    root: {
      id: createDeterministicObjectId('node', 'm06.1-root'),
      componentRef: 'core.root',
      props: {},
      children: [
        {
          id: createDeterministicObjectId('node', 'm06.1-container'),
          componentRef: 'Container',
          props: {},
          children: [],
        },
      ],
    },
    references: { documentRefs: [] },
    metadata: {},
    formMeta: null,
    templateMeta: null,
  });
}

describe('M06.1 Puck Layout/Style canonical round-trip', () => {
  it('persists semantic instance overrides and strips Puck transport keys', () => {
    const document = documentFixture();
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container'] });
    const projection = adapter.toPuck(document);
    const component = projection.data.content[0];
    const layout = { ...createDefaultElectroCraftLayout(), mode: 'row' as const, wrap: true };
    const style = createDefaultElectroCraftStyle();
    style.base.padding = { kind: 'token', token: 'spacing.4' };
    style.base.background = { kind: 'token', token: 'color.surface' };
    component.props[ELECTROCRAFT_PUCK_LAYOUT_PROP] = layout;
    component.props[ELECTROCRAFT_PUCK_STYLE_PROP] = style;

    const reconstructed = adapter.fromPuck(projection.data, document).document;
    expect(reconstructed.root.children[0]).toMatchObject({ layout, style, props: {} });
    expect(JSON.stringify(reconstructed)).not.toMatch(/__electrocraft|history|itemSelector|zones/);
  });

  it('blocks malformed layout values before canonical persistence', () => {
    const document = documentFixture();
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container'] });
    const projection = adapter.toPuck(document);
    projection.data.content[0].props[ELECTROCRAFT_PUCK_LAYOUT_PROP] = {
      mode: 'grid',
      gap: null,
      align: 'stretch',
      justify: 'start',
      wrap: false,
      columns: null,
    };
    expect(() => adapter.fromPuck(projection.data, document)).toThrow('grid layout requires columns');
  });
});
