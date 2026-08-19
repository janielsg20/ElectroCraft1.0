import { Puck, createUsePuck, type Config, type Data } from '@puckeditor/core';

export const structuralPuckConfig: Config = {
  components: {},
  root: { fields: {} },
};

export const structuralPuckData: Data = {
  content: [],
  root: { props: {} },
};

/**
 * Public Puck composition surface owned by the editor-puck adapter.
 * Studio never imports @puckeditor/core directly.
 */
export const PuckEditorRoot = Puck;
export const PuckEditorComponents = Puck.Components;
export const PuckEditorOutline = Puck.Outline;
export const PuckEditorPreview = Puck.Preview;
export const PuckEditorFields = Puck.Fields;

const usePuckForPalette = createUsePuck();

/**
 * Accessible click-to-insert bridge for Palette UI.
 * Availability is resolved by the Studio catalog before dispatching so an
 * unsupported catalog item never becomes a silent Puck success.
 */
export function usePuckPaletteInsert() {
  const dispatch = usePuckForPalette((api) => api.dispatch);

  return (componentType: string) => {
    dispatch({
      type: 'insert',
      componentType,
      destinationIndex: 0,
      destinationZone: 'root:default-zone',
    });
  };
}
