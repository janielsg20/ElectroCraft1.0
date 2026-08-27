import { describe, expect, it } from 'vitest';
import { createDeterministicObjectId, electroCraftDocumentSchema } from '@electrocraft/domain';
import { createStudioPuckDocumentSession } from '../../../apps/studio/src/features/editor/puck-document-session';
import {
  studioCoreComponentDefinitions,
  studioCorePuckRenderers,
} from '../../../apps/studio/src/features/editor/studio-core-components';

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
  it('provides deterministic Container/Text/Image/Button definitions used by a fresh editor', () => {
    expect(studioCoreComponentDefinitions.map((definition) => definition.key)).toEqual([
      'Container',
      'Text',
      'Image',
      'Button',
    ]);
    expect(studioCoreComponentDefinitions.map((definition) => definition.category)).toEqual([
      'Layout',
      'Basic',
      'Basic',
      'Basic',
    ]);
    expect(Object.keys(studioCorePuckRenderers)).toEqual(['Container', 'Text', 'Image', 'Button']);
    expect(new Set(studioCoreComponentDefinitions.map((definition) => definition.id)).size).toBe(4);
    for (const definition of studioCoreComponentDefinitions) {
      expect(definition.metadata).toMatchObject({ builtIn: true, owner: 'studio-core' });
    }
  });

  it('projects the core kit through the same Puck config, Slots and inline editing policies as the real Studio', () => {
    const session = createStudioPuckDocumentSession(
      emptyDocument(),
      studioCoreComponentDefinitions,
      studioCorePuckRenderers,
    );

    expect(Object.keys(session.config.components)).toEqual(
      expect.arrayContaining(['Container', 'Text', 'Image', 'Button']),
    );
    expect(session.config.categories?.Layout).toMatchObject({ components: ['Container'] });
    expect(session.config.categories?.Basic).toMatchObject({ components: ['Text', 'Image', 'Button'] });
    expect(session.config.components.Container.fields?.children).toMatchObject({ type: 'slot' });
    expect(session.config.components.Text.fields?.content).toMatchObject({ type: 'text', contentEditable: true });
    expect(session.config.components.Image.fields).toMatchObject({
      src: { type: 'text' },
      alt: { type: 'text' },
    });
    expect(session.config.components.Button.fields?.label).toMatchObject({ type: 'text' });
  });
});
