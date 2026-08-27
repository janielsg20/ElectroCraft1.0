export const editorMessagesEs = Object.freeze({
  'studio.editor.workspaceLabel': 'Editor visual de ElectroCraft',
  'studio.editor.contextTitle': 'Contexto',
  'studio.editor.canvasTitle': 'Lienzo',
  'studio.editor.inspectorTitle': 'Inspector',
  'studio.editor.outlineTitle': 'Capas',
  'studio.editor.context.componentsTab': 'Componentes',
  'studio.editor.context.screensTab': 'Pantallas',
  'studio.editor.context.layersTab': 'Capas',
  'studio.editor.context.screensTitle': 'Pantallas del proyecto',
  'studio.editor.context.screensSummary':
    'Organiza las pantallas desde su espacio dedicado sin duplicar el modelo del editor.',
  'studio.editor.context.openScreens': 'Abrir Pantallas',
  'studio.editor.inspector.contentTab': 'Contenido',
  'studio.editor.inspector.designTab': 'Diseño',
  'studio.editor.inspector.actionsTab': 'Acciones',
  'studio.editor.inspector.designTitle': 'Diseño y responsive',
  'studio.editor.inspector.designSummary':
    'Los controles avanzados aparecen cuando la selección expone propiedades editables.',
  'studio.editor.inspector.actionsTitle': 'Acciones del elemento',
  'studio.editor.inspector.actionsSummary':
    'Selecciona un elemento compatible para configurar navegación, eventos y automatizaciones.',
  'studio.editor.canvas.viewportLabel': 'Vista adaptable',
  'studio.editor.canvas.zoomLabel': 'Zoom del lienzo al 100 %',
  'studio.editor.contextStructural':
    'Componentes combina la Palette ElectroCraft con Puck.Components. Arrastra o inserta con teclado o clic cuando existe un mapping canónico.',
  'studio.editor.canvasStructural':
    'Lienzo usa Puck.Preview en un iframe aislado del tema del Studio; el frontend del proyecto conserva sus propios estilos.',
  'studio.editor.inspectorStructural':
    'Contenido usa Puck.Fields para la selección actual. Puck conserva selección, arrastre e historial del editor.',
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
  'studio.editor.panel.collapse': 'Contraer panel',
  'studio.editor.panel.expand': 'Expandir panel',
  'studio.editor.panel.minimize': 'Minimizar panel',
  'studio.editor.panel.maximize': 'Maximizar panel',
  'studio.editor.panel.restore': 'Restaurar panel',
  'studio.editor.panel.restoreContext': 'Restaurar panel Contexto',
  'studio.editor.panel.restoreInspector': 'Restaurar panel Inspector',
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
