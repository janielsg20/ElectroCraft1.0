export const editorMessagesEs = Object.freeze({
  'studio.editor.workspaceLabel': 'Editor visual de ElectroCraft',
  'studio.editor.contextTitle': 'Contexto',
  'studio.editor.canvasTitle': 'Lienzo',
  'studio.editor.inspectorTitle': 'Inspector',
  'studio.editor.outlineTitle': 'Capas',
  'studio.editor.contextStructural':
    'Palette ElectroCraft sobre Puck: catálogo descubrible sin duplicar ComponentDefinitions. La inserción solo se habilita cuando el mapping propietario existe.',
  'studio.editor.canvasStructural':
    'Lienzo Puck integrado. Esta microfase valida la estructura del editor sin inventar contenido demo.',
  'studio.editor.inspectorStructural':
    'Inspector Puck integrado. Los campos aparecerán cuando exista una selección real del documento.',
  'studio.editor.toolsLabel': 'Herramientas del editor',
  'studio.editor.openContextLabel': 'Contexto',
  'studio.editor.openInspectorLabel': 'Inspector',
  'studio.editor.closeToolLabel': 'Cerrar panel',
  'studio.editor.contextSheetDescription':
    'Componentes y estructura del documento en una superficie secundaria sin comprimir el lienzo.',
  'studio.editor.inspectorSheetDescription':
    'Propiedades de la selección actual en una superficie secundaria sin comprimir el lienzo.',
  'studio.editor.resizeContextLabel': 'Redimensionar panel Contexto',
  'studio.editor.resizeInspectorLabel': 'Redimensionar panel Inspector',
  'studio.editor.mode.laptop': 'Modo portátil · herramientas secundarias adaptativas',
  'studio.editor.mode.tablet': 'Modo tablet · rail global y herramientas en paneles secundarios',
  'studio.editor.mode.mobile': 'Modo móvil · lienzo prioritario y navegación inferior',
  'studio.editor.mobileNavigationLabel': 'Navegación inferior del editor',
  'studio.editor.mobile.components': 'Componentes',
  'studio.editor.mobile.screens': 'Pantallas',
  'studio.editor.mobile.canvas': 'Lienzo',
  'studio.editor.mobile.properties': 'Propiedades',
  'studio.editor.mobile.more': 'Más',
  'studio.editor.mobile.componentsDescription':
    'Palette buscable con categorías, favoritos y recientes en un panel inferior táctil. Puck conserva el ownership de la composición.',
  'studio.editor.mobile.propertiesDescription':
    'Propiedades de la selección actual en un panel inferior; Puck conserva el ownership de los campos.',
  'studio.editor.mobile.moreDescription':
    'Capas del documento en una herramienta de altura completa para conservar espacio útil en el lienzo.',
  'studio.editor.mobile.closeComponents': 'Cerrar Componentes',
  'studio.editor.mobile.closeProperties': 'Cerrar Propiedades',
  'studio.editor.mobile.closeMore': 'Cerrar Más',
  'studio.editor.mobile.canvasFocusLabel': 'Ir al lienzo',
} as const);

export type EditorMessageKey = keyof typeof editorMessagesEs;

export function editorT<Key extends EditorMessageKey>(key: Key): (typeof editorMessagesEs)[Key] {
  return editorMessagesEs[key];
}
