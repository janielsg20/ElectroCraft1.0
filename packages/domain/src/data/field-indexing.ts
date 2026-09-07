import type { ElectroCraftDataField } from '../contracts/data-definition';
import type { JsonValue } from '../contracts/json-value';

export interface ElectroCraftFieldIndexing {
  readonly searchable: boolean;
  readonly filterable: boolean;
  readonly sortable: boolean;
  readonly faceted: boolean;
}

export const DATA_MODEL_INDEX_RESOURCE_PREFIX = 'index:' as const;

function asObject(value: JsonValue | undefined): Readonly<Record<string, JsonValue>> | null {
  return value && !Array.isArray(value) && typeof value === 'object'
    ? (value as Readonly<Record<string, JsonValue>>)
    : null;
}

function explicitBoolean(value: JsonValue | undefined) {
  return typeof value === 'boolean' ? value : undefined;
}

export function readElectroCraftFieldIndexing(field: ElectroCraftDataField): ElectroCraftFieldIndexing {
  const metadata = asObject(field.metadata.indexing);
  const searchable = explicitBoolean(metadata?.searchable) ?? false;
  const filterable = explicitBoolean(metadata?.filterable) ?? field.indexed;
  const sortable = explicitBoolean(metadata?.sortable) ?? field.indexed;
  const faceted = explicitBoolean(metadata?.faceted) ?? field.faceted;
  return Object.freeze({
    searchable,
    filterable: filterable || faceted,
    sortable,
    faceted,
  });
}

export function hasElectroCraftFieldIndexing(field: ElectroCraftDataField) {
  const indexing = readElectroCraftFieldIndexing(field);
  return indexing.searchable || indexing.filterable || indexing.sortable || indexing.faceted;
}

export function writeElectroCraftFieldIndexing(
  field: ElectroCraftDataField,
  patch: Partial<ElectroCraftFieldIndexing>,
): Pick<ElectroCraftDataField, 'indexed' | 'faceted' | 'metadata'> {
  const current = readElectroCraftFieldIndexing(field);
  const next = Object.freeze({
    searchable: patch.searchable ?? current.searchable,
    filterable: patch.filterable ?? current.filterable,
    sortable: patch.sortable ?? current.sortable,
    faceted: patch.faceted ?? current.faceted,
  });
  const normalized = Object.freeze({
    ...next,
    filterable: next.filterable || next.faceted,
  });
  return Object.freeze({
    indexed: normalized.searchable || normalized.filterable || normalized.sortable || normalized.faceted,
    faceted: normalized.faceted,
    metadata: Object.freeze({
      ...field.metadata,
      indexing: {
        searchable: normalized.searchable,
        filterable: normalized.filterable,
        sortable: normalized.sortable,
        faceted: normalized.faceted,
      },
    }),
  });
}

export function dataModelIndexResourceId(modelId: string) {
  const normalized = modelId.trim();
  if (!normalized) throw new TypeError('modelId must not be empty');
  return `${DATA_MODEL_INDEX_RESOURCE_PREFIX}${normalized}`;
}

export function parseDataModelIndexResourceId(resourceId: string) {
  if (!resourceId.startsWith(DATA_MODEL_INDEX_RESOURCE_PREFIX)) return null;
  const modelId = resourceId.slice(DATA_MODEL_INDEX_RESOURCE_PREFIX.length).trim();
  return modelId || null;
}

export function normalizeElectroCraftIndexText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .replace(/\s+/g, ' ')
    .trim();
}
