import { describe, expect, it } from 'vitest';
import {
  AdvancedFieldRuntimeError,
  evaluateElectroCraftFieldRule,
  normalizeElectroCraftAdvancedFieldRecord,
} from '@electrocraft/connectors';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  validateElectroCraftAdvancedFieldModel,
  type ElectroCraftDataField,
  type ElectroCraftDataFieldType,
  type JsonValue,
} from '@electrocraft/domain';

function field(
  key: string,
  type: ElectroCraftDataFieldType,
  advancedField: Record<string, JsonValue> = { parentFieldRef: null, order: 0 },
  required = false,
): ElectroCraftDataField {
  return electroCraftDataFieldSchema.parse({
    id: createDeterministicObjectId('data-field', `m08-9-${key}`),
    key,
    label: key,
    type,
    nullable: !required,
    required,
    indexed: false,
    faceted: false,
    relationModelRef: null,
    metadata: { advancedField },
  });
}

function advancedModel() {
  const address = field('address', 'group', { parentFieldRef: null, order: 2 });
  const lines = field('lines', 'repeater', {
    parentFieldRef: null,
    order: 3,
    repeater: { minItems: 1, maxItems: 3 },
  });
  return electroCraftDataModelSchema.parse({
    id: createDeterministicObjectId('data-model', 'm08-9-order'),
    key: 'order',
    label: 'Pedido',
    capabilityRefs: ['data.advanced-fields'],
    fields: [
      field('price', 'number', { parentFieldRef: null, order: 0 }, true),
      field('quantity', 'number', { parentFieldRef: null, order: 1 }, true),
      address,
      field('street', 'text', { parentFieldRef: address.id, order: 0 }, true),
      lines,
      field('sku', 'text', { parentFieldRef: lines.id, order: 0 }, true),
      field('total', 'calculated', {
        parentFieldRef: null,
        order: 4,
        calculated: {
          operation: 'multiply',
          operands: [
            { kind: 'field', fieldKey: 'price' },
            { kind: 'field', fieldKey: 'quantity' },
          ],
        },
      }),
      field('note', 'conditional', {
        parentFieldRef: null,
        order: 5,
        conditional: {
          rule: { kind: 'comparison', fieldKey: 'total', operator: 'greater-than', value: 20 },
          valueType: 'text',
          whenFalse: 'omit',
        },
      }),
    ],
    metadata: {},
  });
}

describe('M08.9 advanced field contracts and runtime', () => {
  it('normalizes Group, Repeater, Calculated and Conditional without eval', () => {
    const model = advancedModel();
    expect(validateElectroCraftAdvancedFieldModel(model)).toEqual([]);

    expect(
      normalizeElectroCraftAdvancedFieldRecord(model, {
        price: 12,
        quantity: 2,
        address: { street: 'Main' },
        lines: [{ sku: 'USB-C' }],
        note: 'priority',
      }),
    ).toEqual({
      price: 12,
      quantity: 2,
      address: { street: 'Main' },
      lines: [{ sku: 'USB-C' }],
      total: 24,
      note: 'priority',
    });
    expect(
      evaluateElectroCraftFieldRule(
        { kind: 'not', rule: { kind: 'comparison', fieldKey: 'price', operator: 'empty' } },
        { price: 12 },
      ),
    ).toBe(true);
  });

  it('fails closed for nested validation and calculation errors', () => {
    const model = advancedModel();
    expect(() =>
      normalizeElectroCraftAdvancedFieldRecord(model, {
        price: 12,
        quantity: 0,
        address: {},
        lines: [],
      }),
    ).toThrow(AdvancedFieldRuntimeError);

    expect(() =>
      normalizeElectroCraftAdvancedFieldRecord(model, {
        price: 'invalid',
        quantity: 2,
        address: { street: 'Main' },
        lines: [{ sku: 'USB-C' }],
      }),
    ).toThrow(/operandos numéricos/);
  });

  it('detects missing, cross-scope and cyclic dependencies before persistence', () => {
    const model = advancedModel();
    const total = model.fields.find(({ key }) => key === 'total');
    if (!total) throw new Error('total fixture missing');
    const cycle = electroCraftDataFieldSchema.parse({
      ...total,
      metadata: {
        ...total.metadata,
        advancedField: {
          parentFieldRef: null,
          order: 4,
          calculated: { operation: 'coalesce', operands: [{ kind: 'field', fieldKey: 'total' }] },
        },
      },
    });
    const invalid = electroCraftDataModelSchema.parse({
      ...model,
      fields: model.fields.map((candidate) => (candidate.id === total.id ? cycle : candidate)),
    });
    expect(validateElectroCraftAdvancedFieldModel(invalid)).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'dependency-cycle', fieldId: total.id })]),
    );
  });
});
