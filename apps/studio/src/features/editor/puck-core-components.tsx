import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import type { PuckCanonicalRenderer, PuckRendererRegistry } from '@electrocraft/editor-puck';
import { createElement, isValidElement, type ComponentType, type ReactNode } from 'react';

const emptyStyle = Object.freeze({
  schemaVersion: 1 as const,
  base: Object.freeze({
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
  }),
  responsive: Object.freeze({}),
  platform: Object.freeze({}),
});

const baseLayout = Object.freeze({
  mode: 'flow' as const,
  gap: null,
  align: 'stretch' as const,
  justify: 'start' as const,
  wrap: false,
  columns: null,
});

function coreDefinition(
  key: 'Container' | 'Text' | 'Image' | 'Button',
  label: string,
  category: 'Layout' | 'Basic',
  fields: ElectroCraftComponentDefinition['fields'],
  defaultProps: ElectroCraftComponentDefinition['defaultProps'],
): ElectroCraftComponentDefinition {
  return electroCraftComponentDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('component', `studio-core:${key}`),
    version: 1,
    key,
    label,
    category,
    fields,
    defaultProps,
    layout: key === 'Container' ? { ...baseLayout, mode: 'stack' } : baseLayout,
    style: emptyStyle,
    references: { componentRefs: [], assetRefs: [], actionRefs: [] },
    metadata: { builtin: 'studio-core', editorCore: true },
  });
}

export const studioCoreEditorDefinitions = Object.freeze([
  coreDefinition('Container', 'Contenedor', 'Layout', [], {}),
  coreDefinition('Text', 'Texto', 'Basic', [{ key: 'text', label: 'Texto', kind: 'text', required: false, options: [] }], {
    text: 'Texto',
  }),
  coreDefinition(
    'Image',
    'Imagen',
    'Basic',
    [
      { key: 'src', label: 'Fuente', kind: 'text', required: false, options: [] },
      { key: 'alt', label: 'Texto alternativo', kind: 'text', required: false, options: [] },
    ],
    { src: '', alt: 'Imagen' },
  ),
  coreDefinition('Button', 'Botón', 'Basic', [{ key: 'label', label: 'Etiqueta', kind: 'text', required: false, options: [] }], {
    label: 'Botón',
  }),
] satisfies readonly ElectroCraftComponentDefinition[]);

function slotNode(value: unknown): ReactNode {
  if (isValidElement(value)) return value;
  if (typeof value === 'function') return createElement(value as ComponentType);
  return null;
}

const ContainerRenderer: PuckCanonicalRenderer = ({ children }) =>
  createElement('div', { 'data-ec-core-component': 'Container' }, slotNode(children));

const TextRenderer: PuckCanonicalRenderer = ({ text }) =>
  createElement('p', { 'data-ec-core-component': 'Text' }, typeof text === 'string' ? text : '');

const ImageRenderer: PuckCanonicalRenderer = ({ src, alt }) => {
  const source = typeof src === 'string' ? src.trim() : '';
  const alternative = typeof alt === 'string' && alt.trim() ? alt.trim() : 'Imagen';
  return source
    ? createElement('img', { 'data-ec-core-component': 'Image', src: source, alt: alternative })
    : createElement('div', { 'data-ec-core-component': 'Image', role: 'img', 'aria-label': alternative }, alternative);
};

const ButtonRenderer: PuckCanonicalRenderer = ({ label }) =>
  createElement(
    'button',
    { 'data-ec-core-component': 'Button', type: 'button' },
    typeof label === 'string' ? label : 'Botón',
  );

export const studioCoreEditorRenderers = Object.freeze({
  Container: ContainerRenderer,
  Text: TextRenderer,
  Image: ImageRenderer,
  Button: ButtonRenderer,
} satisfies PuckRendererRegistry);

export const studioCoreEditorComponentKeys = Object.freeze(
  studioCoreEditorDefinitions.map((definition) => definition.key),
);
