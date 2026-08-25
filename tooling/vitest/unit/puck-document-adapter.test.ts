import { describe, expect, it } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftDocumentSchema,
  type ElectroCraftDocument,
} from '@electrocraft/domain';
import {
  ELECTROCRAFT_PUCK_CHILDREN_SLOT,
  ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT,
  createPuckDocumentAdapter,
} from '@electrocraft/editor-puck';

const documentId = createDeterministicObjectId('document', 'm05.1-screen-home');
const rootId = createDeterministicObjectId('node', 'm05.1-core-root');
const containerId = createDeterministicObjectId('node', 'm05.1-layout-container');
const titleId = createDeterministicObjectId('node', 'm05.1-title-home');
const legacyId = createDeterministicObjectId('node', 'm05.1-legacy-widget');
const nestedId = createDeterministicObjectId('node', 'm05.1-nested-text');

function documentFixture(): ElectroCraftDocument {
  return electroCraftDocumentSchema.parse({
    schemaVersion: 3,
    id: documentId,
    version: 7,
    name: 'Inicio',
    kind: 'screen',
    root: {
      id: rootId,
      componentRef: 'core.root',
      props: { label: 'Inicio' },
      children: [
        {
          id: containerId,
          componentRef: 'Container',
          props: { gap: 16, semanticElement: 'main' },
          children: [
            {
              id: titleId,
              componentRef: 'Text',
              props: { text: 'Hola ElectroCraft' },
              children: [],
            },
          ],
        },
      ],
    },
    references: { documentRefs: [] },
    metadata: { locale: 'es', source: 'm05.1' },
    formMeta: null,
    templateMeta: null,
  });
}

describe('M05.1 ElectroCraftDocument <-> Puck Data adapter', () => {
  it('maps core.root to the Puck root envelope and round-trips stable ids through public Slots', () => {
    const document = documentFixture();
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container', 'Text'] });
    const projection = adapter.toPuck(document);

    expect(projection.diagnostics).toEqual([]);
    expect(projection.data.root).toEqual({ props: { label: 'Inicio' } });
    expect(projection.data.content).toHaveLength(1);
    expect(projection.data.content[0]).toMatchObject({
      type: 'Container',
      props: { id: containerId, gap: 16, semanticElement: 'main' },
    });
    const children = projection.data.content[0]?.props[ELECTROCRAFT_PUCK_CHILDREN_SLOT];
    expect(children).toEqual([
      {
        type: 'Text',
        props: { id: titleId, text: 'Hola ElectroCraft' },
      },
    ]);
    expect('zones' in projection.data).toBe(false);

    const reconstructed = adapter.fromPuck(projection.data, document);
    expect(reconstructed.diagnostics).toEqual([]);
    expect(reconstructed.document).toEqual(document);
    expect(reconstructed.document.root.id).toBe(rootId);
    expect(reconstructed.document.root.componentRef).toBe('core.root');
    expect(reconstructed.document.metadata).toEqual({ locale: 'es', source: 'm05.1' });
  });

  it('projects an unknown canonical component as a visible recoverable diagnostic without data loss', () => {
    const document = documentFixture();
    document.root.children.push({
      id: legacyId,
      componentRef: 'LegacyWidget',
      props: { legacy: true, label: 'Conservarme' },
      children: [],
    });
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container', 'Text'] });
    const projection = adapter.toPuck(document);

    expect(projection.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-component', nodeId: legacyId, componentRef: 'LegacyWidget' }),
    );
    expect(projection.data.content[1]?.type).toBe(ELECTROCRAFT_PUCK_DIAGNOSTIC_COMPONENT);
    expect(adapter.fromPuck(projection.data, document).document).toEqual(document);
  });

  it('keeps invalid nested content recoverable instead of silently flattening it', () => {
    const document = documentFixture();
    document.root.children[0]?.children[0]?.children.push({
      id: nestedId,
      componentRef: 'Text',
      props: { text: 'Anidado' },
      children: [],
    });
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container', 'Text'] });
    const projection = adapter.toPuck(document);

    expect(projection.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unsupported-children', nodeId: titleId, componentRef: 'Text' }),
    );
    expect(adapter.fromPuck(projection.data, document).document).toEqual(document);
  });

  it('rejects Puck data without the current root.props shape', () => {
    const document = documentFixture();
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container', 'Text'] });
    expect(() => adapter.fromPuck({ content: [], root: {} }, document)).toThrow(/current root.props shape/);
  });

  it('fails closed instead of discarding legacy Puck zones with content', () => {
    const document = documentFixture();
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container', 'Text'] });
    const projection = adapter.toPuck(document);
    expect(() =>
      adapter.fromPuck(
        {
          ...projection.data,
          zones: { 'legacy-zone': [projection.data.content[0]!] },
        },
        document,
      ),
    ).toThrow(/legacy zones with content are not supported/);
  });

  it('keeps Puck selection and editor history outside the reconstructed canonical document', () => {
    const document = documentFixture();
    const adapter = createPuckDocumentAdapter({ knownComponentRefs: ['Container', 'Text'] });
    const projection = adapter.toPuck(document);
    const runtimeLikeData = {
      ...projection.data,
      selectedItem: { type: 'Text', props: { id: titleId } },
      history: { index: 3, records: ['runtime-only'] },
    } as unknown as Parameters<typeof adapter.fromPuck>[0];

    const reconstructed = adapter.fromPuck(runtimeLikeData, document).document;
    expect(reconstructed).toEqual(document);
    expect(JSON.stringify(reconstructed)).not.toContain('selectedItem');
    expect(JSON.stringify(reconstructed)).not.toContain('runtime-only');
  });
});
