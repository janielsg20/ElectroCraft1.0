import { createUsePuck, type ComponentData, type Config } from '@puckeditor/core';
import {
  createDeterministicObjectId,
  electroCraftDocumentNodeSchema,
  electroCraftStyleSchema,
  type ElectroCraftDocumentNode,
} from '@electrocraft/domain';
import { useEffect, useMemo } from 'react';
import { puckContextControls, type PuckContextBreadcrumb } from './puck-context-controls';
import { parsePuckNodePresentation, projectPuckNodePresentation, stripPuckNodePresentation } from './puck-layout-style';

const usePuckContext = createUsePuck();

function componentSlot(config: Config, componentType: string): string | null {
  const fields = config.components[componentType]?.fields ?? {};
  const slots = Object.entries(fields).flatMap(([key, field]) =>
    field && typeof field === 'object' && 'type' in field && field.type === 'slot' ? [key] : [],
  );
  if (slots.length > 1) {
    throw new Error(`El clipboard canónico no admite múltiples colecciones hijas en ${componentType}.`);
  }
  return slots[0] ?? null;
}

function puckNodeToCanonical(item: ComponentData, config: Config): ElectroCraftDocumentNode {
  const props = item.props as Record<string, unknown>;
  const id = props.id;
  if (typeof id !== 'string' || !id) throw new Error('El elemento seleccionado no tiene un ID canónico estable.');
  const componentRef = String(item.type);
  const slot = componentSlot(config, componentRef);
  const rawChildren = slot ? (props[slot] ?? []) : [];
  if (!Array.isArray(rawChildren)) throw new Error(`El Slot ${componentRef}.${slot} no contiene una lista válida.`);

  const canonicalProps = stripPuckNodePresentation(props);
  delete canonicalProps.id;
  if (slot) delete canonicalProps[slot];
  const presentation = parsePuckNodePresentation(props);

  return electroCraftDocumentNodeSchema.parse({
    id,
    componentRef,
    props: canonicalProps,
    ...presentation,
    children: rawChildren.map((child) => puckNodeToCanonical(child as ComponentData, config)),
  });
}

function cloneCanonicalNode(node: ElectroCraftDocumentNode, seed: string, path = '0'): ElectroCraftDocumentNode {
  return electroCraftDocumentNodeSchema.parse({
    ...structuredClone(node),
    id: createDeterministicObjectId('node', `clipboard:${seed}:${path}`),
    children: node.children.map((child, index) => cloneCanonicalNode(child, seed, `${path}.${index}`)),
  });
}

function labelFor(config: Config, item: ComponentData) {
  return config.components[String(item.type)]?.label ?? String(item.type);
}

function resolveBreadcrumbs(
  selectedId: string,
  config: Config,
  getItemById: (id: string) => ComponentData | null | undefined,
  getSelectorForId: (id: string) => { index: number; zone: string } | null | undefined,
): readonly PuckContextBreadcrumb[] {
  const breadcrumbs: PuckContextBreadcrumb[] = [{ id: 'root', label: 'Página' }];
  const lineage: PuckContextBreadcrumb[] = [];
  const seen = new Set<string>();
  let currentId: string | null = selectedId;

  while (currentId && currentId !== 'root') {
    if (seen.has(currentId)) throw new Error('La jerarquía contextual contiene un ciclo.');
    seen.add(currentId);
    const item = getItemById(currentId);
    if (!item) break;
    lineage.push({ id: currentId, label: labelFor(config, item) });
    const selector = getSelectorForId(currentId);
    if (!selector || selector.zone.startsWith('root:')) break;
    const parentId = selector.zone.split(':')[0];
    currentId = parentId || null;
  }

  breadcrumbs.push(...lineage.reverse());
  return Object.freeze(breadcrumbs);
}

export function PuckContextBridge() {
  const selectedItem = usePuckContext((api) => api.selectedItem);
  const config = usePuckContext((api) => api.config);
  const dispatch = usePuckContext((api) => api.dispatch);
  const getItemById = usePuckContext((api) => api.getItemById);
  const getSelectorForId = usePuckContext((api) => api.getSelectorForId);
  const refreshPermissions = usePuckContext((api) => api.refreshPermissions);
  const selectedId = typeof selectedItem?.props.id === 'string' ? selectedItem.props.id : null;

  const context = useMemo(() => {
    if (!selectedId || !selectedItem) return { selectedId: null, breadcrumbs: [], hidden: false } as const;
    const metadata = config.components[String(selectedItem.type)]?.metadata;
    const metadataRecord = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
    const defaultStyle = electroCraftStyleSchema.safeParse(metadataRecord.electrocraftStyle);
    const presentation = parsePuckNodePresentation(selectedItem.props);
    const style = presentation.style ?? (defaultStyle.success ? defaultStyle.data : null);
    return {
      selectedId,
      breadcrumbs: resolveBreadcrumbs(selectedId, config, getItemById, getSelectorForId),
      hidden: style?.base.visibility === 'hidden',
    } as const;
  }, [config, getItemById, getSelectorForId, selectedId, selectedItem]);

  useEffect(() => puckContextControls.syncContext(context), [context]);

  useEffect(
    () =>
      puckContextControls.connect({
        copy(id) {
          const item = getItemById(id);
          if (!item) throw new Error(`Puck no pudo resolver ${id} para copiar.`);
          return puckNodeToCanonical(item, config);
        },
        paste(node) {
          const currentSelectedId = puckContextControls.getSnapshot().selectedId;
          const selectedSelector = currentSelectedId ? getSelectorForId(currentSelectedId) : null;
          const destinationZone = selectedSelector?.zone ?? 'root:default-zone';
          const destinationIndex = selectedSelector ? selectedSelector.index + 1 : 0;
          const cloned = cloneCanonicalNode(node, globalThis.crypto.randomUUID());

          const insertNode = (current: ElectroCraftDocumentNode, zone: string, index: number) => {
            if (!config.components[current.componentRef]) {
              throw new Error(`El componente ${current.componentRef} del clipboard no existe en el registry activo.`);
            }
            const slot = componentSlot(config, current.componentRef);
            if (current.children.length > 0 && !slot) {
              throw new Error(`El componente ${current.componentRef} no admite hijos en el registry activo.`);
            }
            const props = projectPuckNodePresentation(
              {
                ...current.props,
                id: current.id,
                ...(slot ? { [slot]: [] } : {}),
              },
              current,
            );
            dispatch({
              type: 'insert',
              componentType: current.componentRef,
              destinationIndex: index,
              destinationZone: zone,
              id: current.id,
            });
            dispatch({
              type: 'replace',
              destinationIndex: index,
              destinationZone: zone,
              data: { type: current.componentRef, props } as ComponentData,
            });
            if (slot) {
              current.children.forEach((child, childIndex) => insertNode(child, `${current.id}:${slot}`, childIndex));
            }
          };

          insertNode(cloned, destinationZone, destinationIndex);
          dispatch({ type: 'setUi', ui: { itemSelector: { index: destinationIndex, zone: destinationZone } } });
          return cloned.id;
        },
        duplicate(id) {
          const selector = getSelectorForId(id);
          if (!selector) throw new Error(`Puck no pudo resolver ${id} para duplicar.`);
          dispatch({ type: 'duplicate', sourceIndex: selector.index, sourceZone: selector.zone });
        },
        remove(id) {
          const selector = getSelectorForId(id);
          if (!selector) throw new Error(`Puck no pudo resolver ${id} para eliminar.`);
          dispatch({ type: 'remove', index: selector.index, zone: selector.zone });
        },
        setHidden(id, hidden) {
          const item = getItemById(id);
          const selector = getSelectorForId(id);
          if (!item || !selector) throw new Error(`Puck no pudo resolver ${id} para cambiar visibilidad.`);
          const metadata = config.components[String(item.type)]?.metadata;
          const metadataRecord = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
          const defaultStyle = electroCraftStyleSchema.safeParse(metadataRecord.electrocraftStyle);
          if (!defaultStyle.success) throw new Error(`El componente ${String(item.type)} no expone Style canónico válido.`);
          const presentation = parsePuckNodePresentation(item.props);
          const style = presentation.style ?? defaultStyle.data;
          const nextStyle = electroCraftStyleSchema.parse({
            ...style,
            base: { ...style.base, visibility: hidden ? 'hidden' : 'visible' },
          });
          const props = projectPuckNodePresentation(item.props, { layout: presentation.layout, style: nextStyle });
          props.id = id;
          dispatch({
            type: 'replace',
            destinationIndex: selector.index,
            destinationZone: selector.zone,
            data: { ...item, props: props as typeof item.props },
          });
        },
        refreshPermissions,
      }),
    [config, dispatch, getItemById, getSelectorForId, refreshPermissions],
  );

  return null;
}
