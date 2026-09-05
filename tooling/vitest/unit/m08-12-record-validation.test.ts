import { describe, expect, it } from 'vitest';
import { compileElectroCraftRecordValidator } from '@electrocraft/connectors';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
} from '@electrocraft/domain';

function fixture() {
  const model = electroCraftDataModelSchema.parse({
    id: createDeterministicObjectId('data-model', 'm08-12-product'),
    key: 'product',
    label: 'Producto',
    fields: [
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-12-name'),
        key: 'name',
        label: 'Nombre',
        type: 'text',
        nullable: false,
        required: true,
        indexed: true,
        faceted: false,
        relationModelRef: null,
        validation: { minLength: 3, pattern: '^[A-Z]' },
        metadata: {},
      }),
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-12-price'),
        key: 'price',
        label: 'Precio',
        type: 'number',
        nullable: false,
        indexed: true,
        faceted: false,
        relationModelRef: null,
        validation: { min: 0 },
        defaultValue: 0,
        metadata: {},
      }),
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-12-status'),
        key: 'status',
        label: 'Estado',
        type: 'select',
        nullable: false,
        indexed: true,
        faceted: true,
        relationModelRef: null,
        options: [
          { label: 'Activo', value: 'active' },
          { label: 'Pausado', value: 'paused' },
        ],
        metadata: {},
      }),
    ],
    metadata: {},
  });
  const schema = electroCraftDataSchemaSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('data-schema', 'm08-12-schema'),
    version: 3,
    sourceRef: createDeterministicObjectId('data-source', 'm08-12-source'),
    name: 'ElectroCraft Data',
    models: [model],
    metadata: {},
  });
  return { model, schema };
}

describe('M08.12 record validation compiler', () => {
  it('compiles from ElectroCraftDataSchema, applies defaults and returns normalized data', () => {
    const { model, schema } = fixture();
    const validator = compileElectroCraftRecordValidator(schema, model.id);
    expect(validator).toMatchObject({ schemaId: schema.id, schemaVersion: 3, modelId: model.id });
    expect(validator.validate({ name: 'Mesa', status: 'active' })).toEqual({
      name: 'Mesa',
      price: 0,
      status: 'active',
    });
  });

  it('fails closed for required, pattern, option, numeric and unknown-field violations', () => {
    const { model, schema } = fixture();
    const validator = compileElectroCraftRecordValidator(schema, model.id);
    expect(() => validator.validate({ name: 'ab', price: -1, status: 'unknown', extra: true })).toThrow(
      /VALIDATION|obligatorio|patrón|opción|campo/i,
    );
  });
});
