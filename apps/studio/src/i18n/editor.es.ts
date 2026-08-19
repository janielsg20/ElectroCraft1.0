export const editorMessagesEs = Object.freeze({
  'studio.editor.workspaceLabel': 'Editor visual de ElectroCraft',
  'studio.editor.contextTitle': 'Contexto',
  'studio.editor.canvasTitle': 'Lienzo',
  'studio.editor.inspectorTitle': 'Inspector',
  'studio.editor.contextStructural':
    'Estructura M03.5: componentes y capas de Puck. Los widgets se registrarán en su microfase propietaria.',
  'studio.editor.canvasStructural':
    'Lienzo Puck integrado. Esta microfase valida la estructura del editor sin inventar contenido demo.',
  'studio.editor.inspectorStructural':
    'Inspector Puck integrado. Los campos aparecerán cuando exista una selección real del documento.',
  'studio.editor.toolsLabel': 'Herramientas del editor',
  'studio.editor.openContextLabel': 'Contexto',
  'studio.editor.openInspectorLabel': 'Inspector',
  'studio.editor.closeToolLabel': 'Cerrar panel',
  'studio.editor.contextSheetDescription':
    'Componentes y estructura del documento en una superficie secundaria para tablet y móvil.',
  'studio.editor.inspectorSheetDescription':
    'Propiedades de la selección actual en una superficie secundaria sin comprimir el lienzo.',
  'studio.editor.resizeContextLabel': 'Redimensionar panel Contexto',
  'studio.editor.resizeInspectorLabel': 'Redimensionar panel Inspector',
  'studio.editor.mode.laptop': 'Modo portátil · Inspector en panel secundario',
  'studio.editor.mode.tablet': 'Modo tablet · herramientas en paneles secundarios',
  'studio.editor.mode.mobile': 'Modo móvil · lienzo prioritario',
} as const);

export type EditorMessageKey = keyof typeof editorMessagesEs;

export function editorT<Key extends EditorMessageKey>(key: Key): (typeof editorMessagesEs)[Key] {
  return editorMessagesEs[key];
}
