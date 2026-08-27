import { describe, expect, it } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftDocumentSchema,
  type ElectroCraftDocument,
} from '@electrocraft/domain';
import { createStudioPuckDocumentSession } from '../../../apps/studio/src/features/editor/puck-document-session';
import {
  studioCoreComponentDefinitions,
  studioCorePuckRenderers,
} from '../../../apps/studio/src/features/editor/studio-core-components';

function documentFixture(): ElectroCraftDocument {
  return electroCraftDocumentSchema.parse({
    schemaVersion: 3,
    id: createDeterministicObjectId('document', 'm05.8-editor-core'),
    version: 1,
    name: 'Editor core M05.8',
    kind: 'screen',
    root: {
      id: createDeterministicObjectId('node', 'm05.8-editor-core-root'),
      componentRef: 'core.root',
      props: {},
      children: [
        {
          id: createDeterministicObjectId('node', 'm05.8-container'),
          componentRef: 'Container',
          props: {},
          children: [
            {
              id: createDeterministicObjectId('node', 'm05.8-text'),
              componentRef: 'Text',
              props: { content: 'Texto inicial' },
              children: [],
            },
          ],
        },
        {
          id: createDeterministicObjectId('node', 'm05.8-image'),
          componentRef: 'Image',
          props: { src: '', alt: 'Imagen de prueba' },
          children: [],
        },
        {
          id: createDeterministicObjectId('node', 'm05.8-button'),
          componentRef: 'Button',
          props: { label: 'Continuar' },
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

describe('M05.8 editor core runtime', () => {
  it('opens the real core registry with public Puck Slot/Fields configuration', () => {
    const session = createStudioPuckDocumentSession(
      documentFixture(),
      studioCoreComponentDefinitions,
      studioCorePuckRenderers,
    );

    expect(Object.keys(session.config.components)).toEqual(
      expect.arrayContaining(['Container', 'Text', 'Image', 'Button']),
    );
    expect(session.config.components.Container.fields?.children).toMatchObject({ type: 'slot' });
    expect(session.config.components.Text.fields?.content).toMatchObject({ type: 'text', contentEditable: true });
    expect(session.config.categories?.Layout).toMatchObject({ components: ['Container'] });
    expect(session.config.categories?.Basic?.components).toEqual(expect.arrayContaining(['Text', 'Image', 'Button']));
  });

  it('round-trips nesting, reorder and edits without serializing Puck internals', () => {
    const base = documentFixture();
    const session = createStudioPuckDocumentSession(base, studioCoreComponentDefinitions, studioCorePuckRenderers);
    const data = structuredClone(session.data);
    const container = data.content.find((item) => item.type === 'Container');
    const image = data.content.find((item) => item.type === 'Image');
    const button = data.content.find((item) => item.type === 'Button');

    expect(container).toBeDefined();
    expect(image).toBeDefined();
    expect(button).toBeDefined();

    const nested = container?.props.children;
    expect(Array.isArray(nested)).toBe(true);
    if (!Array.isArray(nested) || !image || !button || !container) throw new Error('invalid M05.8 fixture');

    const text = nested[0];
    if (!text) throw new Error('missing nested Text fixture');
    text.props.content = 'Texto editado';
    data.content = [button, container, image];
    (data as typeof data & { ui?: unknown; history?: unknown }).ui = { itemSelector: { index: 1 } };
    (data as typeof data & { ui?: unknown; history?: unknown }).history = { records: ['session-only'] };

    const reconstructed = session.reconstruct(data).document;
    expect(reconstructed.root.children.map((node) => node.componentRef)).toEqual(['Button', 'Container', 'Image']);
    expect(reconstructed.root.children[1]?.children[0]?.props.content).toBe('Texto editado');

    const serialized = JSON.stringify(reconstructed);
    expect(serialized).not.toContain('itemSelector');
    expect(serialized).not.toContain('session-only');
    expect(serialized).not.toContain('history');
    expect(serialized).not.toContain('zones');
  });

  it('fails closed when a canonical core definition has no renderer', () => {
    const renderers = { ...studioCorePuckRenderers } as Record<string, (props: Record<string, unknown>) => unknown>;
    delete renderers.Button;

    expect(() =>
      createStudioPuckDocumentSession(
        documentFixture(),
        studioCoreComponentDefinitions,
        renderers as typeof studioCorePuckRenderers,
      ),
    ).toThrow('missing Puck renderer for component key: Button');
  });
});
