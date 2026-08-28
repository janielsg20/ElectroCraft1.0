import {
  createDeterministicObjectId,
  electroCraftComponentDefinitionSchema,
  type ElectroCraftComponentDefinition,
} from '@electrocraft/domain';
import type { PuckCanonicalRenderer, PuckRendererRegistry } from '@electrocraft/editor-puck';
import { puckAdvancedSelectionControls, puckPlatformControls, puckResponsiveControls } from '@electrocraft/editor-puck';
import {
  createElement,
  isValidElement,
  useSyncExternalStore,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { resolveStudioPresentationStyle } from './advanced/presentation-style';

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
    metadata: { builtin: 'studio-core', editorCore: true, resizable: key !== 'Text' },
  });
}

export const studioCoreEditorDefinitions = Object.freeze([
  coreDefinition('Container', 'Contenedor', 'Layout', [], {}),
  coreDefinition(
    'Text',
    'Texto',
    'Basic',
    [{ key: 'text', label: 'Texto', kind: 'text', required: false, options: [] }],
    { text: 'Texto' },
  ),
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
  coreDefinition(
    'Button',
    'Botón',
    'Basic',
    [{ key: 'label', label: 'Etiqueta', kind: 'text', required: false, options: [] }],
    { label: 'Botón' },
  ),
] satisfies readonly ElectroCraftComponentDefinition[]);

function slotNode(value: unknown): ReactNode {
  if (isValidElement(value)) return value;
  if (typeof value === 'function') return createElement(value as ComponentType);
  return null;
}

function usePresentationStyle(props: Record<string, unknown>, definitionIndex: number) {
  const definition = studioCoreEditorDefinitions[definitionIndex];
  const responsive = useSyncExternalStore(
    puckResponsiveControls.subscribe,
    puckResponsiveControls.getSnapshot,
    puckResponsiveControls.getSnapshot,
  );
  const platform = useSyncExternalStore(
    puckPlatformControls.subscribe,
    puckPlatformControls.getSnapshot,
    puckPlatformControls.getSnapshot,
  );
  return resolveStudioPresentationStyle(
    props,
    definition.layout,
    definition.style,
    responsive.breakpoints.map((breakpoint) => breakpoint.id),
    responsive.currentId,
    platform.current,
  );
}

function useAdvancedSelection(id: unknown) {
  const selection = useSyncExternalStore(
    puckAdvancedSelectionControls.subscribe,
    puckAdvancedSelectionControls.getSnapshot,
    puckAdvancedSelectionControls.getSnapshot,
  );
  const nodeId = typeof id === 'string' ? id : null;
  const selected = nodeId !== null && selection.selectedIds.includes(nodeId);
  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!nodeId || (!event.metaKey && !event.ctrlKey && !event.shiftKey)) return;
    event.preventDefault();
    event.stopPropagation();
    puckAdvancedSelectionControls.toggle(nodeId);
  };
  return {
    nodeId,
    selected,
    onPointerDown,
    selectionStyle: selected
      ? ({ outline: '2px solid var(--puck-color-selection-border, currentColor)', outlineOffset: '2px' } as const)
      : null,
  };
}

const ContainerRenderer: PuckCanonicalRenderer = ({ children, id, ...props }) => {
  const style = usePresentationStyle({ ...props, id }, 0);
  const selection = useAdvancedSelection(id);
  return createElement(
    'div',
    {
      'data-ec-core-component': 'Container',
      'data-ec-node-id': selection.nodeId ?? undefined,
      'data-ec-multi-selected': selection.selected ? 'true' : 'false',
      onPointerDown: selection.onPointerDown,
      style: { ...style, ...(selection.selectionStyle ?? {}) },
    },
    slotNode(children),
  );
};

const TextRenderer: PuckCanonicalRenderer = ({ text, id, ...props }) => {
  const style = usePresentationStyle({ ...props, id }, 1);
  const selection = useAdvancedSelection(id);
  return createElement(
    'p',
    {
      'data-ec-core-component': 'Text',
      'data-ec-node-id': selection.nodeId ?? undefined,
      'data-ec-multi-selected': selection.selected ? 'true' : 'false',
      onPointerDown: selection.onPointerDown,
      style: { ...style, ...(selection.selectionStyle ?? {}) },
    },
    typeof text === 'string' ? text : '',
  );
};

const ImageRenderer: PuckCanonicalRenderer = ({ src, alt, id, ...props }) => {
  const source = typeof src === 'string' ? src.trim() : '';
  const alternative = typeof alt === 'string' && alt.trim() ? alt.trim() : 'Imagen';
  const style = usePresentationStyle({ ...props, id }, 2);
  const selection = useAdvancedSelection(id);
  const editorProps = {
    'data-ec-core-component': 'Image',
    'data-ec-node-id': selection.nodeId ?? undefined,
    'data-ec-multi-selected': selection.selected ? 'true' : 'false',
    onPointerDown: selection.onPointerDown,
    style: { ...style, ...(selection.selectionStyle ?? {}) },
  };
  return source
    ? createElement('img', { ...editorProps, src: source, alt: alternative })
    : createElement('div', { ...editorProps, role: 'img', 'aria-label': alternative }, alternative);
};

const ButtonRenderer: PuckCanonicalRenderer = ({ label, id, ...props }) => {
  const style = usePresentationStyle({ ...props, id }, 3);
  const selection = useAdvancedSelection(id);
  return createElement(
    'button',
    {
      'data-ec-core-component': 'Button',
      'data-ec-node-id': selection.nodeId ?? undefined,
      'data-ec-multi-selected': selection.selected ? 'true' : 'false',
      onPointerDown: selection.onPointerDown,
      type: 'button',
      style: { ...style, ...(selection.selectionStyle ?? {}) },
    },
    typeof label === 'string' ? label : 'Botón',
  );
};

export const studioCoreEditorRenderers = Object.freeze({
  Container: ContainerRenderer,
  Text: TextRenderer,
  Image: ImageRenderer,
  Button: ButtonRenderer,
} satisfies PuckRendererRegistry);

export const studioCoreEditorComponentKeys = Object.freeze(
  studioCoreEditorDefinitions.map((definition) => definition.key),
);
