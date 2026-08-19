import { Puck, type Config, type Data } from '@puckeditor/core';

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
