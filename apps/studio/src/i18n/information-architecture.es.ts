export const informationArchitectureMessagesEs = Object.freeze({
  'studio.ia.disclosure.advanced': 'Opciones avanzadas',
  'studio.ia.disclosure.advancedSummary': 'Controles menos frecuentes y detalles técnicos.',
  'studio.ia.diagnostic.label': 'Diagnóstico',
  'studio.ia.settings.primaryTitle': 'Espacio de trabajo',
  'studio.ia.settings.advancedTitle': 'Avanzado',
  'studio.ia.settings.advancedSummary': 'Detalles técnicos de la sesión y de las preferencias del Studio.',
  'studio.ia.settings.persistenceLabel': 'Preferencias del AppShell',
  'studio.ia.settings.persistenceValue': 'Adapter de workspace',
  'studio.ia.settings.persistenceHelp':
    'Las preferencias visuales del AppShell mantienen ownership separado. El estado real de la base de proyectos se muestra en Almacenamiento.',
  'studio.ia.settings.statusErrorTitle': 'El Studio necesita atención',
  'studio.ia.settings.statusErrorSummary':
    'El estado actual se mantiene visible y no se oculta dentro de las opciones avanzadas.',
  'studio.ia.inspector.primaryTitle': 'Propiedades principales',
  'studio.ia.inspector.primarySummary': 'Controles de uso frecuente para la selección actual.',
  'studio.ia.inspector.advancedTitle': 'Avanzado',
  'studio.ia.inspector.advancedSummary':
    'Los controles avanzados declarados por el componente se agrupan aquí cuando estén disponibles.',
  'studio.ia.inspector.emptyTitle': 'Selecciona un elemento',
  'studio.ia.inspector.emptyDescription':
    'El Inspector mostrará las propiedades del elemento seleccionado sin mezclar opciones de otras herramientas.',
  'studio.ia.canvas.emptyTitle': 'Lienzo vacío',
  'studio.ia.canvas.emptyDescription':
    'Los componentes aparecerán aquí cuando el documento tenga contenido. No se crean bloques demo automáticamente.',
  'studio.ia.outline.emptyTitle': 'Aún no hay capas',
  'studio.ia.outline.emptyDescription':
    'La estructura del documento aparecerá aquí en cuanto existan componentes reales en el lienzo.',
  'studio.ia.projectHome.emptyTitle': 'Aún no hay un proyecto abierto',
  'studio.ia.projectHome.emptyDescription':
    'Abre o crea un proyecto desde el flujo propietario cuando esa capacidad esté disponible.',
  'studio.ia.content.title': 'Contenido',
  'studio.ia.content.listTitle': 'Registros',
  'studio.ia.content.emptyTitle': 'Todavía no hay contenido',
  'studio.ia.content.emptyDescription':
    'Los registros aparecerán en esta lista cuando exista una fuente de contenido configurada.',
  'studio.ia.content.detailEmptyTitle': 'Selecciona un registro',
  'studio.ia.content.detailEmptyDescription':
    'El detalle se mostrará aquí sin abandonar la lista cuando exista una selección real.',
  'studio.ia.queries.emptyTitle': 'Todavía no hay consultas',
  'studio.ia.queries.emptyDescription':
    'Las consultas guardadas aparecerán aquí cuando se definan mediante el owner de Queries.',
  'studio.ia.forms.emptyTitle': 'Todavía no hay formularios',
  'studio.ia.forms.emptyDescription':
    'Los formularios aparecerán aquí cuando se creen mediante el flujo propietario de Forms.',
  'studio.ia.admin.emptyTitle': 'Administración aún no configurada',
  'studio.ia.admin.emptyDescription':
    'Los recursos administrativos aparecerán aquí cuando exista una configuración real de Administración.',
  'studio.ia.media.emptyTitle': 'Todavía no hay medios',
  'studio.ia.media.emptyDescription':
    'Los archivos aparecerán aquí cuando se incorporen mediante el flujo propietario de Medios.',
  'studio.ia.export.emptyTitle': 'No hay una exportación preparada',
  'studio.ia.export.emptyDescription':
    'Selecciona un target y una revisión válida cuando el flujo de Exportación esté disponible.',
  'studio.ia.moduleUnavailableTitle': 'Módulo todavía no implementado',
  'studio.ia.moduleUnavailableDescription':
    'La ruta es canónica, pero su capacidad propietaria todavía no se ha implementado. No se simula un resultado exitoso.',
  'studio.ia.listDetail.listLabel': 'Lista',
  'studio.ia.listDetail.detailLabel': 'Detalle',
} as const);

export type InformationArchitectureMessageKey = keyof typeof informationArchitectureMessagesEs;

export function iaT<Key extends InformationArchitectureMessageKey>(
  key: Key,
): (typeof informationArchitectureMessagesEs)[Key] {
  return informationArchitectureMessagesEs[key];
}
