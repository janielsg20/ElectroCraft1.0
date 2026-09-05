import { describe, expect, it } from 'vitest';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroRelationSchema,
  parseRelationResourceId,
  relationResourceId,
} from '@electrocraft/domain';

function model(idSeed: string, key: string) {
  return electroCraftDataModelSchema.parse({
    id: createDeterministicObjectId('data-model', idSeed),
    key,
    label: key,
    fields: [
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', `${idSeed}-name`),
        key: 'name',
        label: 'Nombre',
        type: 'text',
        nullable: false,
        indexed: false,
        faceted: false,
        relationModelRef: null,
        metadata: {},
      }),
    ],
    metadata: {},
  });
}

describe('M08.11 canonical relations', () => {
  it('keeps source, target, cardinality, inverse and delete behavior portable', () => {
    const sourceModel = model('m08-11-source', 'product');
    const targetModel = model('m08-11-target', 'category');
    const relation = electroRelationSchema.parse({
      id: createDeterministicObjectId('relation', 'm08-11-products-category'),
      key: 'category',
      label: 'Categoría',
      sourceModelRef: sourceModel.id,
      targetModelRef: targetModel.id,
      cardinality: 'one-to-many',
      deleteBehavior: 'restrict',
      inverse: { key: 'products', label: 'Productos' },
      permissions: { read: ['editor'], write: ['admin'] },
      metadata: {},
    });
    const relationField = electroCraftDataFieldSchema.parse({
      id: createDeterministicObjectId('data-field', 'm08-11-relation-field'),
      key: 'category',
      label: 'Categoría',
      type: 'relation',
      nullable: true,
      indexed: false,
      faceted: false,
      relationModelRef: targetModel.id,
      relationRef: relation.id,
      metadata: {},
    });
    const schema = electroCraftDataSchemaSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-schema', 'm08-11-schema'),
      version: 1,
      sourceRef: createDeterministicObjectId('data-source', 'm08-11-source'),
      name: 'ElectroCraft Data',
      models: [{ ...sourceModel, fields: [...sourceModel.fields, relationField] }, targetModel],
      relations: [relation],
      metadata: {},
    });

    expect(schema.relations?.[0]).toMatchObject({
      cardinality: 'one-to-many',
      deleteBehavior: 'restrict',
      inverse: { key: 'products' },
    });
    expect(relationResourceId(relation.id)).toBe(`relation:${relation.id}`);
    expect(parseRelationResourceId(relationResourceId(relation.id))).toBe(relation.id);
  });

  it('fails closed for missing refs, mismatched relation fields and embedded secrets', () => {
    const sourceModel = model('m08-11-negative-source', 'source');
    const targetModel = model('m08-11-negative-target', 'target');
    const relationId = createDeterministicObjectId('relation', 'm08-11-negative-relation');
    const badField = electroCraftDataFieldSchema.parse({
      id: createDeterministicObjectId('data-field', 'm08-11-negative-field'),
      key: 'target',
      label: 'Target',
      type: 'relation',
      nullable: true,
      indexed: false,
      faceted: false,
      relationModelRef: sourceModel.id,
      relationRef: relationId,
      metadata: {},
    });
    const result = electroCraftDataSchemaSchema.safeParse({
      schemaVersion: 1,
      id: createDeterministicObjectId('data-schema', 'm08-11-negative-schema'),
      version: 1,
      sourceRef: createDeterministicObjectId('data-source', 'm08-11-negative-ds'),
      name: 'ElectroCraft Data',
      models: [{ ...sourceModel, fields: [...sourceModel.fields, badField] }, targetModel],
      relations: [
        {
          id: relationId,
          key: 'target',
          label: 'Target',
          sourceModelRef: sourceModel.id,
          targetModelRef: targetModel.id,
          cardinality: 'one-to-one',
          deleteBehavior: 'detach',
          metadata: {},
        },
      ],
      metadata: {},
    });
    expect(result.success).toBe(false);

    expect(
      electroCraftDataSourceDefinitionSchema.safeParse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-source', 'm08-11-secret-source'),
        version: 1,
        key: 'internal',
        label: 'Internal',
        kind: 'internal',
        adapterId: 'internal.pglite',
        authRef: null,
        config: { nested: { apiKey: 'forbidden' } },
        environmentScope: ['development'],
        environmentOverrides: {},
        schemaDiscovery: 'on-demand',
        capabilities: ['read', 'relations'],
        metadata: {},
      }).success,
    ).toBe(false);
  });
});
