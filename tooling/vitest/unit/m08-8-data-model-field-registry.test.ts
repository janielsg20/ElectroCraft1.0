import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftFieldRegistry,
  getElectroCraftFieldRegistryEntry,
  listElectroCraftFieldRegistryByFamily,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  type ElectroCraftDataFieldType,
} from '@electrocraft/domain';

const sourceId = createDeterministicObjectId('data-source', 'm08-8-source');
const schemaId = createDeterministicObjectId('data-schema', 'm08-8-schema');
const productId = createDeterministicObjectId('data-model', 'm08-8-product');
const categoryId = createDeterministicObjectId('data-model', 'm08-8-category');

function fieldFor(type: ElectroCraftDataFieldType, index: number) {
  const descriptor = getElectroCraftFieldRegistryEntry(type);
  return electroCraftDataFieldSchema.parse({
    id: createDeterministicObjectId('data-field', `m08-8-${type}-${index}`),
    key: `field_${index}`,
    label: descriptor.label,
    type,
    nullable: true,
    indexed: false,
    faceted: false,
    relationModelRef: type === 'relation' ? categoryId : null,
    ...(descriptor.supportsDefault ? { defaultValue: null } : {}),
    ...(descriptor.supportsOptions && type !== 'checkbox'
      ? { options: [{ label: 'Opción A', value: 'a' }] }
      : descriptor.supportsOptions
        ? {
            options: [
              { label: 'Opción A', value: 'a' },
              { label: 'Opción B', value: 'b' },
            ],
          }
        : {}),
    ...(descriptor.supportsValidation ? { validation: { maxLength: 120 } } : {}),
    conditions: [{ fieldKey: 'name', operator: 'not-empty' }],
    permissions: { read: ['content.read'], write: ['content.write'] },
    metadata: {
      storageHint: descriptor.storageHint,
      fieldFamily: descriptor.family,
      ...(descriptor.advancedOwner ? { advancedOwner: descriptor.advancedOwner } : {}),
    },
  });
}

describe('M08.8 canonical DataModel and Field Registry', () => {
  it('keeps field-type registry under the pre-existing application owner', () => {
    const ownership = readFileSync(resolve('packages/domain/src/contracts/model-ownership.ts'), 'utf8');
    const domainIndex = readFileSync(resolve('packages/domain/src/index.ts'), 'utf8');
    const applicationIndex = readFileSync(resolve('packages/application/src/data/index.ts'), 'utf8');

    expect(ownership).toContain("key: 'field-type'");
    expect(ownership).toContain("ownerPackage: '@electrocraft/application'");
    expect(applicationIndex).toContain("export * from './field-registry'");
    expect(domainIndex).not.toContain('./data/field-registry');
  });

  it('registers every required field type with portable storage semantics', () => {
    expect(electroCraftFieldRegistry).toHaveLength(29);
    expect(new Set(electroCraftFieldRegistry.map(({ type }) => type)).size).toBe(electroCraftFieldRegistry.length);

    const requiredTypes = [
      'text',
      'textarea',
      'richtext',
      'number',
      'currency',
      'email',
      'phone',
      'url',
      'date',
      'time',
      'datetime',
      'color',
      'select',
      'radio',
      'checkbox',
      'switch',
      'image',
      'gallery',
      'file',
      'map',
      'relation',
      'user',
      'taxonomy',
      'group',
      'repeater',
      'calculated',
      'conditional',
    ] as const;

    for (const type of requiredTypes) {
      expect(getElectroCraftFieldRegistryEntry(type)).toMatchObject({ type });
    }
    expect(getElectroCraftFieldRegistryEntry('relation').advancedOwner).toBe('M08.11');
    expect(getElectroCraftFieldRegistryEntry('taxonomy').advancedOwner).toBe('M08.10');
    expect(getElectroCraftFieldRegistryEntry('group').advancedOwner).toBe('M08.9');
    expect(getElectroCraftFieldRegistryEntry('calculated').storageHint).toBe('computed');
    expect(listElectroCraftFieldRegistryByFamily('media').map(({ type }) => type)).toEqual([
      'image',
      'gallery',
      'file',
    ]);
  });

  it('parses every registry family and round-trips expanded model identity without engine internals', () => {
    const fields = electroCraftFieldRegistry.map(({ type }, index) => fieldFor(type, index + 1));
    const product = electroCraftDataModelSchema.parse({
      id: productId,
      key: 'product',
      label: 'Producto',
      singularLabel: 'Producto',
      pluralLabel: 'Productos',
      description: 'Catálogo interno de productos.',
      icon: 'database',
      visibility: 'public',
      singleton: false,
      menuVisible: true,
      capabilityRefs: ['content.read', 'content.write'],
      fields,
      metadata: { storageHint: 'generic-content-records' },
    });
    const category = electroCraftDataModelSchema.parse({
      id: categoryId,
      key: 'category',
      label: 'Categoría',
      fields: [
        electroCraftDataFieldSchema.parse({
          id: createDeterministicObjectId('data-field', 'm08-8-category-name'),
          key: 'name',
          label: 'Nombre',
          type: 'text',
          nullable: false,
          indexed: true,
          faceted: false,
          relationModelRef: null,
          required: true,
          metadata: { storageHint: 'scalar' },
        }),
      ],
      metadata: {},
    });
    const dataSchema = electroCraftDataSchemaSchema.parse({
      schemaVersion: 1,
      id: schemaId,
      version: 3,
      sourceRef: sourceId,
      name: 'ElectroCraft Data',
      models: [product, category],
      metadata: { owner: 'PGlite generic content store' },
    });

    const roundTrip = electroCraftDataSchemaSchema.parse(JSON.parse(JSON.stringify(dataSchema)) as unknown);
    expect(roundTrip).toEqual(dataSchema);
    expect(roundTrip.models[0]).toMatchObject({
      singularLabel: 'Producto',
      pluralLabel: 'Productos',
      visibility: 'public',
      menuVisible: true,
    });
    expect(JSON.stringify(roundTrip)).not.toMatch(/CREATE TABLE|ALTER TABLE|drizzleTable|pgliteInternal/i);
  });

  it('fails closed on invalid required/options/validation combinations', () => {
    const base = {
      id: createDeterministicObjectId('data-field', 'm08-8-invalid'),
      key: 'invalid',
      label: 'Inválido',
      type: 'text' as const,
      nullable: true,
      indexed: false,
      faceted: false,
      relationModelRef: null,
      metadata: {},
    };

    expect(() => electroCraftDataFieldSchema.parse({ ...base, required: true })).toThrow(
      /required fields cannot be nullable/,
    );
    expect(() => electroCraftDataFieldSchema.parse({ ...base, options: [{ label: 'A', value: 'a' }] })).toThrow(
      /options are only valid/,
    );
    expect(() => electroCraftDataFieldSchema.parse({ ...base, validation: { min: 20, max: 10 } })).toThrow(
      /min cannot exceed max/,
    );
    expect(() =>
      electroCraftDataFieldSchema.parse({
        ...base,
        type: 'relation',
        relationModelRef: null,
      }),
    ).toThrow(/relation field requires relationModelRef/);
  });
});
