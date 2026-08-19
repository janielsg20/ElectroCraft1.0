export const paletteMessagesEs = Object.freeze({
  'studio.palette.title': 'Componentes',
  'studio.palette.description': 'Busca por nombre, función o concepto y añade herramientas sin duplicar componentes.',
  'studio.palette.searchLabel': 'Buscar componentes',
  'studio.palette.searchPlaceholder': 'Buscar: posts, menu, login, JetEngine…',
  'studio.palette.clearSearch': 'Limpiar búsqueda',
  'studio.palette.noResultsTitle': 'Sin resultados',
  'studio.palette.noResultsDescription': 'Prueba otro nombre, capacidad o sinónimo.',
  'studio.palette.favorites': 'Favoritos',
  'studio.palette.recent': 'Recientes',
  'studio.palette.allCategories': 'Catálogo',
  'studio.palette.favoriteAdd': 'Añadir a favoritos',
  'studio.palette.favoriteRemove': 'Quitar de favoritos',
  'studio.palette.insert': 'Insertar',
  'studio.palette.insertUnavailable': 'Inserción no disponible todavía',
  'studio.palette.dragSource': 'Componentes registrados en Puck para arrastrar',
  'studio.palette.diagnosticTitle': 'No se puede insertar este elemento',
  'studio.palette.diagnosticClose': 'Cerrar diagnóstico',
  'studio.palette.diagnosticLocation': 'Ubicación',
  'studio.palette.diagnosticCause': 'Causa',
  'studio.palette.diagnosticAction': 'Acción sugerida',
  'studio.palette.keyboardHelp': 'Usa Tab o flechas para recorrer. Enter inserta. Escape devuelve el foco al lienzo.',
} as const);

export type PaletteMessageKey = keyof typeof paletteMessagesEs;

export function paletteT<Key extends PaletteMessageKey>(key: Key): (typeof paletteMessagesEs)[Key] {
  return paletteMessagesEs[key];
}
