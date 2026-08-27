import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  electroCraftDocumentSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import type { PuckCanonicalRenderer, PuckEditorData } from '@electrocraft/editor-puck';
import { describe, expect, it } from 'vitest';
import { createStudioPuckDocumentSession } from '../../../apps/studio/src/features/editor/puck-document-session';

function componentTemplate(): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse(
    JSON.parse(readFileSync(resolve('tooling/fixtures/canonical-model/component-definition-v1.json'), 'utf8')),
  );
}

function richTextDefinition(): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse({
    ...componentTemplate(),
    id: createDeterministicObjectId('component', 'm05.6-richtext'),
    key: 'RichText',
    label: 'Texto enriquecido',
    category: 'Basic',
    fields: [{ key: 'content', label: 'Contenido', kind: 'text', required: false, options: [] }],
    defaultProps: { content: '<p>Texto enriquecido</p>' },
  });
}

const richTextRenderer: PuckCanonicalRenderer = ({ content }) =>
  createElement('div', { 'data-richtext-render': true }, String(content ?? ''));

describe('M05.6 Studio inline RichText round-trip', () => {
  it('keeps Tiptap/Puck authoring as a string-only canonical projection and strips editor internals', () => {
    const nodeId = createDeterministicObjectId('node', 'm05.6-richtext-node');
    const initialHtml = '<p>Hola <strong>ElectroCraft</strong></p>';
    const document = electroCraftDocumentSchema.parse({
      schemaVersion: 4,
      id: createDeterministicObjectId('document', 'm05.6-richtext-screen'),
      version: 1,
      name: 'RichText inline',
      kind: 'screen',
      root: {
        id: createDeterministicObjectId('node', 'm05.6-root'),
        componentRef: 'core.root',
        props: {},
        children: [
          {
            id: nodeId,
            componentRef: 'RichText',
            props: { content: initialHtml },
            children: [],
          },
        ],
      },
      references: { documentRefs: [] },
      metadata: { fixture: 'm05.6' },
      formMeta: null,
      templateMeta: null,
    });
    const session = createStudioPuckDocumentSession(document, [richTextDefinition()], {
      RichText: richTextRenderer,
    });

    expect(session.config.components.RichText.fields?.content).toMatchObject({
      type: 'richtext',
      contentEditable: true,
    });
    expect(session.data.content[0]?.props.content).toBe(initialHtml);

    const editedHtml = '<p>Editado <em>inline</em></p>';
    const edited = structuredClone(session.data) as PuckEditorData & Record<string, unknown>;
    edited.content[0]!.props.content = editedHtml;
    edited.selectedItem = { type: 'RichText', props: { id: nodeId } };
    edited.history = { index: 2, records: ['runtime-only'] };
    edited.ui = { inlineToolbarOpen: true };

    const reconstructed = session.reconstruct(edited).document;
    expect(reconstructed.root.children[0]?.props.content).toBe(editedHtml);
    expect(typeof reconstructed.root.children[0]?.props.content).toBe('string');
    expect(JSON.stringify(reconstructed)).not.toContain('selectedItem');
    expect(JSON.stringify(reconstructed)).not.toContain('runtime-only');
    expect(JSON.stringify(reconstructed)).not.toContain('inlineToolbarOpen');
    expect(JSON.stringify(reconstructed)).not.toContain('tiptap');
  });

  it('keeps canonical richtext inert when a target renders the transported string as text', () => {
    const unsafeHtml = '<p>Visible</p><script>window.__m056 = true</script>';
    const document = electroCraftDocumentSchema.parse({
      schemaVersion: 4,
      id: createDeterministicObjectId('document', 'm05.6-richtext-security'),
      version: 1,
      name: 'RichText security',
      kind: 'screen',
      root: {
        id: createDeterministicObjectId('node', 'm05.6-security-root'),
        componentRef: 'core.root',
        props: {},
        children: [
          {
            id: createDeterministicObjectId('node', 'm05.6-security-node'),
            componentRef: 'RichText',
            props: { content: unsafeHtml },
            children: [],
          },
        ],
      },
      references: { documentRefs: [] },
      metadata: {},
      formMeta: null,
      templateMeta: null,
    });
    const session = createStudioPuckDocumentSession(document, [richTextDefinition()], {
      RichText: richTextRenderer,
    });
    const canonicalContent = session.reconstruct(session.data).document.root.children[0]?.props.content;
    const markup = renderToStaticMarkup(createElement('div', null, String(canonicalContent ?? '')));

    expect(canonicalContent).toBe(unsafeHtml);
    expect(markup).toContain('&lt;script');
    expect(markup).toContain('window.__m056 = true');
    expect(markup).not.toContain('<script>');
  });
});
