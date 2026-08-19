export const editorWorkspaceMessagesEs = Object.freeze({
  'studio.workspace.label': 'Workspace visual del editor',
  'studio.workspace.contextEyebrow': 'Workspace',
  'studio.workspace.contextTitle': 'Contexto',
  'studio.workspace.contextScrollLabel': 'Contenido del panel Contexto',
  'studio.workspace.contextPlaceholderTitle': 'Contexto estructural',
  'studio.workspace.contextPlaceholderSummary':
    'La estructura, inserción y navegación contextual se conectarán a sus owners reales; esta microfase reserva la superficie sin simular funciones.',
  'studio.workspace.canvasEyebrow': 'Puck',
  'studio.workspace.canvasTitle': 'Canvas',
  'studio.workspace.puckReady': 'Puck conectado',
  'studio.workspace.canvasEmptyTitle': 'Canvas vacío',
  'studio.workspace.canvasEmptySummary':
    'La composición usa el adapter Puck real con configuración vacía. No se inyectan componentes ni datos demo permanentes.',
  'studio.workspace.inspectorEyebrow': 'Workspace',
  'studio.workspace.inspectorTitle': 'Inspector',
  'studio.workspace.inspectorScrollLabel': 'Contenido del panel Inspector',
  'studio.workspace.inspectorPlaceholderTitle': 'Sin selección',
  'studio.workspace.inspectorPlaceholderSummary':
    'Selecciona un elemento cuando el editor propietario lo habilite. M03.5 solo establece la región estructural y sus límites.',
  'studio.workspace.resizeContext': 'Redimensionar panel Contexto',
  'studio.workspace.resizeInspector': 'Redimensionar panel Inspector',
  'studio.workspace.responsiveToolsLabel': 'Paneles secundarios del workspace',
  'studio.workspace.openContext': 'Abrir Contexto',
  'studio.workspace.openInspector': 'Abrir Inspector',
  'studio.workspace.statusDetail': 'Editor · Puck · workspace estructural',
} as const);

export type EditorWorkspaceMessageKey = keyof typeof editorWorkspaceMessagesEs;

export function editorWorkspaceT<Key extends EditorWorkspaceMessageKey>(
  key: Key,
): (typeof editorWorkspaceMessagesEs)[Key] {
  return editorWorkspaceMessagesEs[key];
}
