import { describe, expect, it } from 'vitest';
import { createDeterministicObjectId, electroCraftDocumentSchema } from '@electrocraft/domain';
import {
  studioCoreEditorComponentKeys,
  studioCoreEditorDefinitions,
  studioCoreEditorRenderers,
} from '../../../apps/studio/src/features/editor/puck-core-components';
import { createStudioPuckDocumentSession } from '../../../apps/studio/src/features/editor/puck-document-session';

function emptyDocument() {
  return electroCraftDocumentSchema.parse({
    schemaVersion: 3,
    id: createDeterministicObjectId('document', 'm05.8-core-kit'),
    version: 1,
    name: 'Editor core',
    kind: 'screen',
    root: {
      id: createDeterministicObjectId('node', 'm05.8-core-kit-root'),
      componentRef: 'core.root',
      props: {},
      children: [],
    },
    references: { documentRefs: [] },
    metadata: {},
    formMeta: null,
    templateMeta: null,
  });
}

describe('M05.8 Studio core editor kit', () => {
  it('provides the deterministic Container/Text/Image/Button definitions used by a fresh editor', () => {
    expect(studioCoreEditorComponentKeys).toEqual(['Container', 'Text', 'Image', 'Button']);
    expect(studioCoreEditorDefinitions.map((definition) => definition.category)).toEqual([
      'Layout',
      'Basic',
      'Basic',
      'Basic',
    ]);
    expect(Object.keys(studioCoreEditorRenderers)).toEqual(['Container', 'Text', 'Image', 'Button']);
    expect(new Set(studioCoreEditorDefinitions.map((definition) => definition.id)).size).toBe(4);
    for (const definition of studioCoreEditorDefinitions) {
      expect(definition.metadata).toMatchObject({ builtin: 'studio-core', editorCore: true });
    }
  });

  it('projects the core kit through the same Puck config, Slots and inline editing policies as the real Studio', () => {
    const session = createStudioPuckDocumentSession(
      emptyDocument(),
      studioCoreEditorDefinitions,
      studioCoreEditorRenderers,
    );

    expect(Object.keys(session.config.components)).toEqual(
      expect.arrayContaining(['Container', 'Text', 'Image', 'Button']),
    );
    expect(session.config.categories?.Layout).toMatchObject({ components: ['Container'] });
    expect(session.config.categories?.Basic).toMatchObject({ components: ['Text', 'Image', 'Button'] });
    expect(session.config.components.Container.fields?.children).toMatchObject({ type: 'slot' });
    expect(session.config.components.Text.fields?.text).toMatchObject({ type: 'text', contentEditable: true });
    expect(session.config.components.Image.fields).toMatchObject({
      src: { type: 'text' },
      alt: { type: 'text' },
    });
    expect(session.config.components.Button.fields?.label).toMatchObject({ type: 'text' });
  });
});
