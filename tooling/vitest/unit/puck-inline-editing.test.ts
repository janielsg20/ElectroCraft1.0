import { createDeterministicObjectId, electroCraftComponentDefinitionSchema } from '@electrocraft/domain';
import { createPuckConfig, electroCraftCorePuckInlineEditing } from '@electrocraft/editor-puck';
import { describe, expect, it } from 'vitest';

const emptyStyle = {
  schemaVersion: 1 as const,
  base: {
    width: null,
    height: null,
    minWidth: null,
    maxWidth: null,
    gap: null,
    padding: null,
    margin: null,
    fontSize: null,
    fontWeight: null,
    textAlign: null,
    foreground: null,
    background: null,
    opacity: null,
  },
  responsive: {},
  platform: {},
};

type InlineFieldShape = { type?: string; contentEditable?: boolean };

function definition(key: string, fieldKey: string) {
  return electroCraftComponentDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('component', `m05.6:${key}`),
    version: 1,
    key,
    label: key,
    category: 'Basic',
    fields: [{ key: fieldKey, label: 'Contenido', kind: 'text', required: false, options: [] }],
    defaultProps: { [fieldKey]: '' },
    layout: {
      mode: 'flow',
      gap: null,
      align: 'stretch',
      justify: 'start',
      wrap: false,
      columns: null,
    },
    style: emptyStyle,
    references: { componentRefs: [], assetRefs: [], actionRefs: [] },
    metadata: {},
  });
}

function fieldShape(config: ReturnType<typeof createPuckConfig>, componentKey: string, fieldKey: string) {
  const fields = config.components[componentKey]?.fields as Record<string, unknown> | undefined;
  return fields?.[fieldKey] as InlineFieldShape | undefined;
}

describe('M05.6 Puck inline editing projection', () => {
  it('uses Puck contentEditable text for Text and therefore its heading/paragraph presets', () => {
    const text = definition('Text', 'text');
    const config = createPuckConfig([text], { Text: () => null }, undefined, {
      inlineEditing: electroCraftCorePuckInlineEditing,
    });

    expect(fieldShape(config, 'Text', 'text')).toMatchObject({ type: 'text', contentEditable: true });
  });

  it('uses the public Puck richtext field so Tiptap remains the only rich text engine', () => {
    const richText = definition('RichText', 'content');
    const config = createPuckConfig([richText], { RichText: () => null }, undefined, {
      inlineEditing: electroCraftCorePuckInlineEditing,
    });

    expect(fieldShape(config, 'RichText', 'content')).toMatchObject({ type: 'richtext', contentEditable: true });
  });

  it('does not enable inline editing for unrelated canonical text fields', () => {
    const label = definition('Label', 'text');
    const config = createPuckConfig([label], { Label: () => null }, undefined, {
      inlineEditing: electroCraftCorePuckInlineEditing,
    });

    expect(fieldShape(config, 'Label', 'text')).toEqual(expect.objectContaining({ type: 'text' }));
    expect(fieldShape(config, 'Label', 'text')).not.toHaveProperty('contentEditable');
  });

  it('fails closed when an inline mapping targets a field absent from the canonical definition', () => {
    const text = definition('Text', 'text');

    expect(() =>
      createPuckConfig([text], { Text: () => null }, undefined, {
        inlineEditing: { Text: { mode: 'text', fieldKeys: ['missing'] } },
      }),
    ).toThrow(/Puck inline field is not canonical: Text\.missing/);
  });
});
