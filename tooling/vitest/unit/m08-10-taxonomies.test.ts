import { describe, expect, it } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroTaxonomySchema,
  electroTaxonomyTermSchema,
  getElectroTaxonomy,
} from '@electrocraft/domain';

const modelId = createDeterministicObjectId('data-model', 'm08-10-model');
const taxonomyId = createDeterministicObjectId('taxonomy', 'm08-10-category');

function model(taxonomyRef: typeof taxonomyId | null = null) {
  return electroCraftDataModelSchema.parse({
    id: modelId,
    key: 'product',
    label: 'Producto',
    capabilityRefs: ['data.taxonomies'],
    fields: [
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-10-category-field'),
        key: 'category',
        label: 'Categoría',
        type: 'taxonomy',
        nullable: true,
        indexed: true,
        faceted: true,
        relationModelRef: null,
        taxonomyRef,
        metadata: { storageHint: 'reference' },
      }),
    ],
    metadata: {},
  });
}

describe('M08.10 canonical taxonomies', () => {
  it('round-trips portable taxonomy metadata and model/field references', () => {
    const taxonomy = electroTaxonomySchema.parse({
      id: taxonomyId,
      key: 'category',
      label: 'Categorías',
      singularLabel: 'Categoría',
      pluralLabel: 'Categorías',
      hierarchical: true,
      modelRefs: [modelId],
      templateRefs: [],
      metadata: {},
    });
    const schema = electroCraftDataSchemaSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-schema', 'm08-10-schema'),
      version: 1,
      sourceRef: createDeterministicObjectId('data-source', 'm08-10-source'),
      name: 'ElectroCraft Data',
      models: [model(taxonomy.id)],
      taxonomies: [taxonomy],
      metadata: {},
    });

    expect(getElectroTaxonomy(schema, taxonomy.id)).toEqual(taxonomy);
    expect(electroCraftDataSchemaSchema.parse(JSON.parse(JSON.stringify(schema)))).toEqual(schema);
    expect(JSON.stringify(schema)).not.toMatch(/CREATE TABLE|pglite|drizzle/i);
  });

  it('fails closed on missing taxonomy/model refs and invalid term hierarchy', () => {
    const taxonomy = electroTaxonomySchema.parse({
      id: taxonomyId,
      key: 'category',
      label: 'Categorías',
      singularLabel: 'Categoría',
      pluralLabel: 'Categorías',
      hierarchical: true,
      modelRefs: [modelId],
      metadata: {},
    });
    const base = {
      schemaVersion: 1 as const,
      id: createDeterministicObjectId('data-schema', 'm08-10-invalid-schema'),
      version: 1,
      sourceRef: createDeterministicObjectId('data-source', 'm08-10-invalid-source'),
      name: 'ElectroCraft Data',
      models: [model(createDeterministicObjectId('taxonomy', 'missing'))],
      taxonomies: [taxonomy],
      metadata: {},
    };
    expect(() => electroCraftDataSchemaSchema.parse(base)).toThrow(/taxonomyRef must reference/);
    expect(() =>
      electroTaxonomyTermSchema.parse({
        id: createDeterministicObjectId('taxonomy-term', 'same'),
        taxonomyRef: taxonomy.id,
        slug: 'same',
        name: 'Mismo',
        parentId: createDeterministicObjectId('taxonomy-term', 'same'),
        metadata: {},
      }),
    ).toThrow(/own parent/);
  });
});
