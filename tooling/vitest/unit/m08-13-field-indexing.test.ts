import { describe, expect, it } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  normalizeElectroCraftIndexText,
  readElectroCraftFieldIndexing,
  writeElectroCraftFieldIndexing,
} from '@electrocraft/domain';

describe('M08.13 canonical field indexing semantics', () => {
  it('keeps explicit search/filter/sort/facet flags portable while preserving legacy compatibility', () => {
    const field = electroCraftDataFieldSchema.parse({
      id: createDeterministicObjectId('data-field', 'm08-13-title'),
      key: 'title',
      label: 'Título',
      type: 'text',
      nullable: true,
      indexed: false,
      faceted: false,
      relationModelRef: null,
      metadata: {},
    });

    const patch = writeElectroCraftFieldIndexing(field, {
      searchable: true,
      filterable: false,
      sortable: true,
      faceted: true,
    });
    const next = electroCraftDataFieldSchema.parse({ ...field, ...patch });

    expect(next.indexed).toBe(true);
    expect(next.faceted).toBe(true);
    expect(readElectroCraftFieldIndexing(next)).toEqual({
      searchable: true,
      filterable: true,
      sortable: true,
      faceted: true,
    });
  });

  it('normalizes searchable text without retaining accents or case differences', () => {
    expect(normalizeElectroCraftIndexText('  CÁMARA   Pró  ')).toBe('camara pro');
  });
});
