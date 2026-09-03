import type { ElectroCraftDataFieldType } from '@electrocraft/domain';

export type ElectroCraftFieldFamily =
  | 'text'
  | 'number'
  | 'choice'
  | 'date-time'
  | 'media'
  | 'location'
  | 'relation'
  | 'composition'
  | 'logic'
  | 'system';

export type ElectroCraftFieldStorageHint = 'scalar' | 'json' | 'reference' | 'computed';

export interface ElectroCraftFieldRegistryEntry {
  readonly type: ElectroCraftDataFieldType;
  readonly label: string;
  readonly family: ElectroCraftFieldFamily;
  readonly help: string;
  readonly storageHint: ElectroCraftFieldStorageHint;
  readonly supportsDefault: boolean;
  readonly supportsValidation: boolean;
  readonly supportsOptions: boolean;
  readonly supportsConditions: boolean;
  readonly supportsIndexing: boolean;
  readonly advancedOwner?: 'M08.9' | 'M08.10' | 'M08.11';
}

const field = (
  type: ElectroCraftDataFieldType,
  label: string,
  family: ElectroCraftFieldFamily,
  help: string,
  storageHint: ElectroCraftFieldStorageHint,
  options: Partial<Omit<ElectroCraftFieldRegistryEntry, 'type' | 'label' | 'family' | 'help' | 'storageHint'>> = {},
): ElectroCraftFieldRegistryEntry =>
  Object.freeze({
    type,
    label,
    family,
    help,
    storageHint,
    supportsDefault: options.supportsDefault ?? true,
    supportsValidation: options.supportsValidation ?? true,
    supportsOptions: options.supportsOptions ?? false,
    supportsConditions: options.supportsConditions ?? true,
    supportsIndexing: options.supportsIndexing ?? storageHint === 'scalar' || storageHint === 'reference',
    ...(options.advancedOwner ? { advancedOwner: options.advancedOwner } : {}),
  });

export const electroCraftFieldRegistry = Object.freeze([
  field('text', 'Texto', 'text', 'Texto corto de una línea.', 'scalar'),
  field('textarea', 'Texto largo', 'text', 'Texto multilínea sin formato enriquecido.', 'scalar'),
  field('richtext', 'Texto enriquecido', 'text', 'Contenido enriquecido portable.', 'json', { supportsIndexing: false }),
  field('number', 'Número', 'number', 'Valor numérico general.', 'scalar'),
  field('currency', 'Moneda', 'number', 'Importe monetario con metadata de moneda.', 'scalar'),
  field('email', 'Correo electrónico', 'text', 'Correo con validación de formato.', 'scalar'),
  field('phone', 'Teléfono', 'text', 'Número telefónico normalizado como texto.', 'scalar'),
  field('url', 'URL', 'text', 'Dirección web con validación de formato.', 'scalar'),
  field('boolean', 'Booleano', 'choice', 'Valor true/false canónico.', 'scalar'),
  field('date', 'Fecha', 'date-time', 'Fecha sin hora.', 'scalar'),
  field('time', 'Hora', 'date-time', 'Hora sin fecha.', 'scalar'),
  field('datetime', 'Fecha y hora', 'date-time', 'Instante o fecha/hora portable.', 'scalar'),
  field('color', 'Color', 'text', 'Color portable, normalmente hexadecimal.', 'scalar'),
  field('select', 'Selección', 'choice', 'Una opción de una lista definida.', 'scalar', { supportsOptions: true }),
  field('radio', 'Radio', 'choice', 'Una opción visible de una lista definida.', 'scalar', { supportsOptions: true }),
  field('checkbox', 'Casillas', 'choice', 'Una o varias opciones de una lista.', 'json', {
    supportsOptions: true,
    supportsIndexing: false,
  }),
  field('switch', 'Interruptor', 'choice', 'Control booleano presentado como interruptor.', 'scalar'),
  field('image', 'Imagen', 'media', 'Referencia a un recurso de imagen.', 'reference'),
  field('gallery', 'Galería', 'media', 'Colección ordenada de referencias de imagen.', 'json', { supportsIndexing: false }),
  field('file', 'Archivo', 'media', 'Referencia a un recurso de archivo.', 'reference'),
  field('map', 'Mapa', 'location', 'Coordenadas y metadata de ubicación.', 'json', { supportsIndexing: false }),
  field('relation', 'Relación', 'relation', 'Referencia a otro modelo del mismo esquema.', 'reference', {
    advancedOwner: 'M08.11',
  }),
  field('user', 'Usuario', 'relation', 'Referencia portable a identidad/usuario.', 'reference'),
  field('taxonomy', 'Taxonomía', 'relation', 'Referencia a taxonomía del modelo.', 'reference', {
    advancedOwner: 'M08.10',
  }),
  field('group', 'Grupo', 'composition', 'Agrupa campos bajo una estructura anidada.', 'json', {
    supportsIndexing: false,
    advancedOwner: 'M08.9',
  }),
  field('repeater', 'Repetidor', 'composition', 'Colección repetible de campos agrupados.', 'json', {
    supportsIndexing: false,
    advancedOwner: 'M08.9',
  }),
  field('calculated', 'Calculado', 'logic', 'Valor derivado; su semántica completa pertenece a M08.9.', 'computed', {
    supportsDefault: false,
    supportsValidation: false,
    supportsIndexing: false,
    advancedOwner: 'M08.9',
  }),
  field('conditional', 'Condicional', 'logic', 'Campo gobernado por condición; semántica completa en M08.9.', 'json', {
    supportsIndexing: false,
    advancedOwner: 'M08.9',
  }),
  field('json', 'JSON', 'system', 'Valor JSON portable para adapters y schemas externos.', 'json', {
    supportsIndexing: false,
  }),
] as const satisfies readonly ElectroCraftFieldRegistryEntry[]);

const registryByType = new Map(electroCraftFieldRegistry.map((entry) => [entry.type, entry]));

export function getElectroCraftFieldRegistryEntry(type: ElectroCraftDataFieldType): ElectroCraftFieldRegistryEntry {
  const entry = registryByType.get(type);
  if (!entry) throw new Error(`Unknown ElectroCraft field type: ${type}`);
  return entry;
}

export function listElectroCraftFieldRegistryByFamily(family: ElectroCraftFieldFamily) {
  return Object.freeze(electroCraftFieldRegistry.filter((entry) => entry.family === family));
}
