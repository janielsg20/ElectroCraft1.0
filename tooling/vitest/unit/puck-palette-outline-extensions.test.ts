import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import {
  ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT,
  createPuckCategories,
  createPuckConfig,
  type PuckCanonicalRenderer,
} from '@electrocraft/editor-puck';

function template(): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse(
    JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/component-definition-v1.json'), 'utf8')),
  );
}

function definition(key: string, category: string): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse({
    ...template(),
    id: createDeterministicObjectId('component', `m05.7:${key}`),
    key,
    label: key,
    category,
  });
}

const renderer: PuckCanonicalRenderer = () => null;

describe('M05.7 Puck palette/outline extensions', () => {
  it('projects canonical categories into the public Puck categories API', () => {
    const text = definition('Text', 'Basic');
    const richText = definition('RichText', 'Basic');
    const container = definition('Container', 'Layout');

    const categories = createPuckCategories([text, richText, container]);

    expect(categories.Basic).toMatchObject({ title: 'Basic', components: ['Text', 'RichText'] });
    expect(categories.Layout).toMatchObject({ title: 'Layout', components: ['Container'] });
  });

  it('keeps the recoverable diagnostic component out of the insertable component drawer', () => {
    const text = definition('Text', 'Basic');
    const config = createPuckConfig([text], { Text: renderer }, undefined, {
      diagnosticRenderer: renderer,
    });

    expect(config.categories?.__electrocraftDiagnostics).toMatchObject({
      components: [ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT],
      visible: false,
    });
    expect(config.components[ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT].permissions).toEqual({ insert: false });
  });

  it('maps a lock to Puck edit/drag/delete/duplicate permissions even when editable was requested', () => {
    const text = definition('Text', 'Basic');
    const config = createPuckConfig([text], { Text: renderer }, undefined, {
      editorPolicies: {
        Text: { locked: true, editable: true },
      },
    });

    expect(config.components.Text.permissions).toEqual({
      drag: false,
      delete: false,
      duplicate: false,
      edit: false,
    });
  });

  it('does not invent visibility state in the Puck adapter', () => {
    const text = definition('Text', 'Basic');
    const config = createPuckConfig([text], { Text: renderer });
    const serialized = JSON.stringify(config.components.Text);

    expect(serialized).not.toContain('hidden');
    expect(serialized).not.toContain('visible');
    expect(serialized).not.toContain('visibility');
  });
});
