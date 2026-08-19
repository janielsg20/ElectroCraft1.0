import { createPuckConfig } from '@electrocraft/editor-puck';

const emptyRenderers = Object.freeze({});

export const editorWorkspacePuckComposition = Object.freeze({
  engine: '@puckeditor/core',
  mode: 'structural-empty',
  config: createPuckConfig([], emptyRenderers),
});

export function getEditorWorkspacePuckDiagnostics() {
  return Object.freeze({
    engine: editorWorkspacePuckComposition.engine,
    componentCount: Object.keys(editorWorkspacePuckComposition.config.components).length,
    structuralEmpty: Object.keys(editorWorkspacePuckComposition.config.components).length === 0,
  });
}
