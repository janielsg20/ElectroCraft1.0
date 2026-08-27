import { createElement, type ComponentType, type CSSProperties } from 'react';
import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import type { PuckRendererRegistry } from '@electrocraft/editor-puck';

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

function definition(
  key: string,
  label: string,
  category: string,
  fields: ElectroCraftComponentDefinition['fields'],
  defaultProps: ElectroCraftComponentDefinition['defaultProps'],
  mode: ElectroCraftComponentDefinition['layout']['mode'] = 'flow',
) {
  return electroCraftComponentDefinitionSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('component', `studio-core:${key}`),
    version: 1,
    key,
    label,
    category,
    fields,
    defaultProps,
    layout: {
      mode,
      gap: null,
      align: 'stretch',
      justify: 'start',
      wrap: false,
      columns: null,
    },
    style: emptyStyle,
    references: { componentRefs: [], assetRefs: [], actionRefs: [] },
    metadata: { builtIn: true, owner: 'studio-core' },
  });
}

export const studioCoreComponentDefinitions = Object.freeze([
  definition('Container', 'Contenedor', 'Layout', [], {}, 'stack'),
  definition(
    'Text',
    'Texto',
    'Basic',
    [{ key: 'content', label: 'Contenido', kind: 'text', required: false, options: [] }],
    { content: 'Texto' },
  ),
  definition(
    'Image',
    'Imagen',
    'Basic',
    [
      { key: 'src', label: 'Fuente', kind: 'text', required: false, options: [] },
      { key: 'alt', label: 'Texto alternativo', kind: 'text', required: false, options: [] },
    ],
    { src: '', alt: 'Imagen' },
  ),
  definition(
    'Button',
    'Botón',
    'Basic',
    [{ key: 'label', label: 'Etiqueta', kind: 'text', required: false, options: [] }],
    { label: 'Botón' },
  ),
] satisfies readonly ElectroCraftComponentDefinition[]);

interface SlotProps {
  readonly className?: string;
  readonly minEmptyHeight?: CSSProperties['minHeight'];
}

const ContainerRenderer = ({ children }: Record<string, unknown>) => {
  const Content = children as ComponentType<SlotProps> | undefined;
  return createElement(
    'section',
    { className: 'ec-core-component ec-core-container', 'data-ec-component': 'Container' },
    Content ? createElement(Content, { className: 'ec-core-container-slot', minEmptyHeight: 96 }) : null,
  );
};

const TextRenderer = ({ content }: Record<string, unknown>) =>
  createElement(
    'p',
    { className: 'ec-core-component ec-core-text', 'data-ec-component': 'Text' },
    String(content ?? ''),
  );

const ImageRenderer = ({ src, alt }: Record<string, unknown>) => {
  const resolvedSrc = typeof src === 'string' ? src.trim() : '';
  const resolvedAlt = typeof alt === 'string' && alt.trim() ? alt : 'Imagen';
  return createElement(
    'figure',
    { className: 'ec-core-component ec-core-image', 'data-ec-component': 'Image' },
    resolvedSrc
      ? createElement('img', { src: resolvedSrc, alt: resolvedAlt, loading: 'lazy' })
      : createElement('div', { className: 'ec-core-image-placeholder', role: 'img', 'aria-label': resolvedAlt }, resolvedAlt),
  );
};

const ButtonRenderer = ({ label }: Record<string, unknown>) =>
  createElement(
    'button',
    { type: 'button', className: 'ec-core-component ec-core-button', 'data-ec-component': 'Button' },
    String(label ?? 'Botón'),
  );

export const studioCorePuckRenderers = Object.freeze({
  Container: ContainerRenderer,
  Text: TextRenderer,
  Image: ImageRenderer,
  Button: ButtonRenderer,
} satisfies PuckRendererRegistry);
