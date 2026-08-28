import { Puck, createUsePuck, type Config, type Data } from '@puckeditor/core';
import { createDeterministicObjectId } from '@electrocraft/domain';
import {
  ELECTROCRAFT_RESPONSIVE_PRESETS,
  electroCraftLayoutSchema,
  electroCraftResponsiveConfigurationSchema,
  electroCraftStyleSchema,
  type ElectroCraftLayout,
  type ElectroCraftStyle,
} from '@electrocraft/domain';
import { Fragment, createElement, useEffect, useMemo, useSyncExternalStore, type ComponentProps } from 'react';
import { puckAdvancedSelectionControls } from './puck-advanced-selection';
import { ELECTROCRAFT_PUCK_CHILDREN_SLOT } from './puck-adapter-contract';
import { PuckCanvasGuideOverlay } from './puck-canvas-guide-overlay';
import { puckEditorCommandControls } from './puck-command-controls';
import { puckEditorHistoryControls } from './puck-history-controls';
import { applyPuckHistoryPolicy } from './puck-history-policy';
import { parsePuckNodePresentation, projectPuckNodePresentation } from './puck-layout-style';
import { puckResponsiveControls } from './puck-responsive-controls';
import {
  ELECTROCRAFT_PUCK_RESPONSIVE_CONFIG_PROP,
  projectResponsiveConfigurationToPuckViewports,
} from './puck-responsive-viewports';

export type PuckEditorConfig = Config;
export type PuckEditorOnChange = (data: Data) => void;

export const structuralPuckConfig: Config = {
  components: {},
  root: { fields: {} },
};

export const structuralPuckData: Data = {
  content: [],
  root: { props: {} },
};

/**
 * Puck 0.22 iframe policy for ElectroCraft Studio.
 * Project preview styles stay isolated from the Studio shell while Puck keeps
 * its own iframe interaction styles and waits for them before rendering.
 */
export const electroCraftPuckIframeConfig = Object.freeze({
  enabled: true,
  waitForStyles: true,
  syncHostStyles: false,
});

const useElectroCraftPuck = createUsePuck();

function PuckCommandBridge() {
  const dispatch = usePuckEditorDispatch();

  useEffect(() => puckEditorCommandControls.connect(dispatch), [dispatch]);
  return null;
}

function PuckHistoryBridge() {
  const history = usePuckEditorHistoryControls();
  const controls = useSyncExternalStore(
    puckEditorHistoryControls.subscribe,
    puckEditorHistoryControls.getSnapshot,
    puckEditorHistoryControls.getSnapshot,
  );
  usePuckEditorHistoryPolicy(controls.visualHistoryLimit);

  useEffect(
    () =>
      puckEditorHistoryControls.connect({
        undo: history.undo,
        redo: history.redo,
      }),
    [history.undo, history.redo],
  );

  useEffect(() => {
    puckEditorHistoryControls.updateAvailability(history.canUndo, history.canRedo);
  }, [history.canUndo, history.canRedo]);

  return null;
}

function PuckResponsiveBridge() {
  const dispatch = usePuckEditorDispatch();
  const currentWidth = useElectroCraftPuck((api) => api.appState.ui.viewports.current.width);
  const root = useElectroCraftPuck((api) => api.appState.data.root);
  const rootProps = (root.props ?? {}) as Record<string, unknown>;
  const responsiveConfiguration = useMemo(
    () =>
      electroCraftResponsiveConfigurationSchema.parse(
        rootProps[ELECTROCRAFT_PUCK_RESPONSIVE_CONFIG_PROP] ?? ELECTROCRAFT_RESPONSIVE_PRESETS,
      ),
    [rootProps],
  );
  useEffect(
    () =>
      puckResponsiveControls.connect({
        setViewport: (current) =>
          dispatch({ type: 'setUi', ui: (previous) => ({ viewports: { ...previous.viewports, current } }) }),
        setBreakpoints: (breakpoints) =>
          dispatch({
            type: 'replaceRoot',
            root: {
              ...root,
              props: {
                ...rootProps,
                [ELECTROCRAFT_PUCK_RESPONSIVE_CONFIG_PROP]: { schemaVersion: 1, breakpoints },
              },
            } as typeof root,
          }),
      }),
    [dispatch, root, rootProps],
  );
  useEffect(
    () => puckResponsiveControls.setBreakpoints(responsiveConfiguration.breakpoints),
    [responsiveConfiguration.breakpoints],
  );
  useEffect(() => puckResponsiveControls.syncCurrent(currentWidth), [currentWidth]);
  return null;
}

function PuckAdvancedSelectionBridge() {
  const dispatch = usePuckEditorDispatch();
  const selectedItem = useElectroCraftPuck((api) => api.selectedItem);
  const getSelectorForId = useElectroCraftPuck((api) => api.getSelectorForId);
  const getItemById = useElectroCraftPuck((api) => api.getItemById);
  const config = useElectroCraftPuck((api) => api.config);
  const primaryId = typeof selectedItem?.props.id === 'string' ? selectedItem.props.id : null;

  useEffect(() => puckAdvancedSelectionControls.syncPrimary(primaryId), [primaryId]);

  useEffect(
    () =>
      puckAdvancedSelectionControls.connect({
        group(ids) {
          if (!config.components.Container)
            throw new Error('El registry activo no contiene un Container para agrupar.');
          const selected = ids.map((id) => {
            const selector = getSelectorForId(id);
            if (!selector) throw new Error(`Puck no pudo resolver ${id} para Agrupar.`);
            return { id, selector };
          });
          const zone = selected[0]?.selector.zone;
          if (!zone || selected.some(({ selector }) => selector.zone !== zone)) {
            throw new Error('Agrupar requiere elementos hermanos dentro del mismo contenedor.');
          }
          const ordered = selected.toSorted((left, right) => left.selector.index - right.selector.index);
          const groupId = createDeterministicObjectId('node', `puck-group:${globalThis.crypto.randomUUID()}`);
          const groupIndex = ordered[0].selector.index;
          dispatch({
            type: 'insert',
            componentType: 'Container',
            destinationIndex: groupIndex,
            destinationZone: zone,
            id: groupId,
          });
          for (const { selector } of ordered.toReversed()) {
            dispatch({
              type: 'move',
              sourceIndex: selector.index + 1,
              sourceZone: zone,
              destinationIndex: 0,
              destinationZone: `${groupId}:${ELECTROCRAFT_PUCK_CHILDREN_SLOT}`,
            });
          }
          dispatch({ type: 'setUi', ui: { itemSelector: { index: groupIndex, zone } } });
          return groupId;
        },
        ungroup(id) {
          const item = getItemById(id);
          if (!item || String(item.type) !== 'Container') {
            throw new Error('Desagrupar solo está disponible para un Container seleccionado.');
          }
          const rawChildren = (item.props as Record<string, unknown>)[ELECTROCRAFT_PUCK_CHILDREN_SLOT];
          if (!Array.isArray(rawChildren) || rawChildren.length === 0) {
            throw new Error('El Container seleccionado no contiene elementos para desagrupar.');
          }
          const childIds = rawChildren.map((child) => {
            const props = (child as { props?: Record<string, unknown> }).props;
            const childId = props?.id;
            if (typeof childId !== 'string' || childId.length === 0) {
              throw new Error('Un elemento del grupo no tiene un identificador estable.');
            }
            return childId;
          });
          const containerSelector = getSelectorForId(id);
          if (!containerSelector) throw new Error('Puck no pudo resolver el grupo para Desagrupar.');
          const sourceZone = `${id}:${ELECTROCRAFT_PUCK_CHILDREN_SLOT}`;
          for (let sourceIndex = childIds.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
            dispatch({
              type: 'move',
              sourceIndex,
              sourceZone,
              destinationIndex: containerSelector.index + 1,
              destinationZone: containerSelector.zone,
            });
          }
          dispatch({ type: 'remove', index: containerSelector.index, zone: containerSelector.zone });
          dispatch({
            type: 'setUi',
            ui: { itemSelector: { index: containerSelector.index, zone: containerSelector.zone } },
          });
          return childIds;
        },
        resize(id, width, height) {
          const item = getItemById(id);
          const selector = getSelectorForId(id);
          if (!item || !selector) throw new Error('Puck no pudo resolver el elemento para cambiar su tamaño.');
          const componentType = String(item.type);
          const metadata = config.components[componentType]?.metadata;
          const metadataRecord = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
          if (metadataRecord.electrocraftResizable !== true) {
            throw new Error(`El componente ${componentType} no declara resize compatible.`);
          }
          const defaultStyle = electroCraftStyleSchema.safeParse(metadataRecord.electrocraftStyle);
          if (!defaultStyle.success) throw new Error(`El componente ${componentType} no expone Style canónico válido.`);
          const presentation = parsePuckNodePresentation(item.props as Record<string, unknown>);
          const style = presentation.style ?? defaultStyle.data;
          const nextStyle = electroCraftStyleSchema.parse({
            ...style,
            base: {
              ...style.base,
              width: width === null ? null : { kind: 'value', value: width, unit: 'px' },
              height: height === null ? null : { kind: 'value', value: height, unit: 'px' },
            },
          });
          const props = projectPuckNodePresentation(item.props as Record<string, unknown>, {
            layout: presentation.layout,
            style: nextStyle,
          });
          props.id = id;
          dispatch({
            type: 'replace',
            destinationIndex: selector.index,
            destinationZone: selector.zone,
            data: { ...item, props: props as typeof item.props },
          });
        },
      }),
    [config.components, dispatch, getItemById, getSelectorForId],
  );

  return null;
}

/**
 * Public Puck composition surface owned by the editor-puck adapter.
 * Studio never imports @puckeditor/core directly. Session-only command/history
 * bridges are mounted inside the owning Puck context and expose delegation
 * only; AppState, selection and the visual history stack remain in Puck.
 */
export function PuckEditorRoot({ iframe, children, ...props }: ComponentProps<typeof Puck>) {
  return createElement(
    Puck,
    {
      ...props,
      iframe: {
        ...iframe,
        ...electroCraftPuckIframeConfig,
      },
      viewports: props.viewports ?? projectResponsiveConfigurationToPuckViewports(ELECTROCRAFT_RESPONSIVE_PRESETS),
    },
    createElement(
      Fragment,
      null,
      createElement(PuckCommandBridge),
      createElement(PuckHistoryBridge),
      createElement(PuckResponsiveBridge),
      createElement(PuckAdvancedSelectionBridge),
      children,
    ),
  );
}

export const PuckEditorComponents = Puck.Components;
export const PuckEditorOutline = Puck.Outline;
export function PuckEditorPreview(props: ComponentProps<typeof Puck.Preview>) {
  return createElement(
    'div',
    { className: 'ec-puck-preview-with-guides', 'data-puck-preview-with-guides': true },
    createElement(Puck.Preview, props),
    createElement(PuckCanvasGuideOverlay),
  );
}
export const PuckEditorFields = Puck.Fields;

/**
 * Returns the stable active Config reference supplied to the owning <Puck>.
 * Callers derive UI-only availability from this reference instead of keeping
 * a second component registry.
 */
export function usePuckEditorConfig() {
  return useElectroCraftPuck((api) => api.config);
}

/**
 * Thin public dispatch bridge for engine-owned editor interactions. Consumers
 * may issue documented Puck actions without importing @puckeditor/core or
 * receiving AppState internals. The reducer/history remain entirely in Puck.
 */
export function usePuckEditorDispatch() {
  return useElectroCraftPuck((api) => api.dispatch);
}

/**
 * Minimal public-data subscription for empty-state rendering. This observes
 * only Data.content; selection/history remain owned by Puck and outside the
 * canonical persistence bridge.
 */
export function usePuckEditorHasContent() {
  return useElectroCraftPuck((api) => api.appState.data.content.length > 0);
}

export type PuckEditorPresentationState =
  | Readonly<{ status: 'empty'; message: string }>
  | Readonly<{ status: 'blocked'; message: string }>
  | Readonly<{
      status: 'ready';
      componentId: string;
      componentType: string;
      layout: ElectroCraftLayout;
      style: ElectroCraftStyle;
      layoutInherited: boolean;
      styleInherited: boolean;
      setLayout: (layout: ElectroCraftLayout) => void;
      setStyle: (style: ElectroCraftStyle) => void;
      resetLayout: () => void;
      resetStyle: () => void;
    }>;

/**
 * Fine Puck extension for the advanced ElectroCraft inspector. Selection,
 * replacement and history stay in Puck; this hook only validates canonical
 * presentation metadata and dispatches the public replace action.
 */
export function usePuckEditorPresentation(): PuckEditorPresentationState {
  const selectedItem = useElectroCraftPuck((api) => api.selectedItem);
  const config = useElectroCraftPuck((api) => api.config);
  const dispatch = usePuckEditorDispatch();
  const getSelectorForId = useElectroCraftPuck((api) => api.getSelectorForId);

  return useMemo(() => {
    if (!selectedItem) return Object.freeze({ status: 'empty', message: 'Selecciona un componente en el lienzo.' });

    const componentId = typeof selectedItem.props.id === 'string' ? selectedItem.props.id : '';
    if (!componentId) {
      return Object.freeze({ status: 'blocked', message: 'La selección no tiene un identificador canónico estable.' });
    }

    const componentType = String(selectedItem.type);
    const metadata = config.components[componentType]?.metadata;
    const metadataRecord = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
    const defaultLayout = electroCraftLayoutSchema.safeParse(metadataRecord.electrocraftLayout);
    const defaultStyle = electroCraftStyleSchema.safeParse(metadataRecord.electrocraftStyle);
    if (!defaultLayout.success || !defaultStyle.success) {
      return Object.freeze({
        status: 'blocked',
        message: `El componente ${componentType} no expone Layout/Style canónico válido.`,
      });
    }

    let presentation;
    try {
      presentation = parsePuckNodePresentation(selectedItem.props);
    } catch {
      return Object.freeze({
        status: 'blocked',
        message: `La presentación de ${componentType} no cumple el contrato canónico.`,
      });
    }

    const replacePresentation = (layout: ElectroCraftLayout | null, style: ElectroCraftStyle | null) => {
      const selector = getSelectorForId(componentId);
      if (!selector) throw new Error(`Puck no pudo resolver la selección ${componentId}.`);
      const props = projectPuckNodePresentation(selectedItem.props, { layout, style });
      props.id = componentId;
      dispatch({
        type: 'replace',
        destinationIndex: selector.index,
        destinationZone: selector.zone,
        data: {
          ...selectedItem,
          props: props as typeof selectedItem.props,
        },
      });
    };

    return Object.freeze({
      status: 'ready' as const,
      componentId,
      componentType,
      layout: presentation.layout ?? defaultLayout.data,
      style: presentation.style ?? defaultStyle.data,
      layoutInherited: presentation.layout === null,
      styleInherited: presentation.style === null,
      setLayout: (layout: ElectroCraftLayout) =>
        replacePresentation(electroCraftLayoutSchema.parse(layout), presentation.style),
      setStyle: (style: ElectroCraftStyle) =>
        replacePresentation(presentation.layout, electroCraftStyleSchema.parse(style)),
      resetLayout: () => replacePresentation(null, presentation.style),
      resetStyle: () => replacePresentation(presentation.layout, null),
    });
  }, [config.components, dispatch, getSelectorForId, selectedItem]);
}

/**
 * Session-only visual history controls. The stack itself remains in Puck;
 * callers receive only availability plus delegation to the public back/forward
 * methods and never a copy of AppState/history.
 */
export function usePuckEditorHistoryControls() {
  const canUndo = useElectroCraftPuck((api) => api.history.hasPast);
  const canRedo = useElectroCraftPuck((api) => api.history.hasFuture);
  const undo = useElectroCraftPuck((api) => api.history.back);
  const redo = useElectroCraftPuck((api) => api.history.forward);

  return Object.freeze({ canUndo, canRedo, undo, redo });
}

/**
 * Enforces a bounded recent history window using only Puck's public history
 * API. Trimming is applied only at the current tip, so an undo position and
 * its redo branch are never changed by the policy itself.
 */
export function usePuckEditorHistoryPolicy(visualHistoryLimit: number) {
  const histories = useElectroCraftPuck((api) => api.history.histories);
  const index = useElectroCraftPuck((api) => api.history.index);
  const setHistories = useElectroCraftPuck((api) => api.history.setHistories);
  const setHistoryIndex = useElectroCraftPuck((api) => api.history.setHistoryIndex);

  useEffect(() => {
    applyPuckHistoryPolicy(
      {
        histories,
        index,
        setHistories,
        setHistoryIndex,
      },
      visualHistoryLimit,
    );
  }, [histories, index, setHistories, setHistoryIndex, visualHistoryLimit]);
}

/**
 * Accessible click-to-insert bridge for Palette UI.
 * Availability is resolved by the Studio catalog before dispatching so an
 * unsupported catalog item never becomes a silent Puck success. ElectroCraft
 * supplies the public insert action with a canonical node id up front so Puck
 * history, commands and canonical persistence all address the same node.
 */
export function usePuckPaletteInsert() {
  const dispatch = usePuckEditorDispatch();

  return (componentType: string) => {
    const id = createDeterministicObjectId('node', `puck-insert:${componentType}:${globalThis.crypto.randomUUID()}`);

    dispatch({
      type: 'insert',
      componentType,
      destinationIndex: 0,
      destinationZone: 'root:default-zone',
      id,
    });
  };
}
