import {
  ELECTROCRAFT_ADVANCED_FIELD_CAPABILITY,
  createElectroCraftAdvancedFieldMetadata,
  readElectroCraftAdvancedFieldMetadata,
  type ElectroCraftAdvancedFieldMetadata,
  type ElectroCraftDataField,
  type ElectroCraftDataFieldType,
  type ElectroCraftDataModel,
  type ElectroCraftObjectId,
  type JsonValue,
} from '@electrocraft/domain';

const advancedTypes = new Set<ElectroCraftDataFieldType>(['group', 'repeater', 'calculated', 'conditional']);

export function isElectroCraftAdvancedFieldType(type: ElectroCraftDataFieldType) {
  return advancedTypes.has(type);
}

function defaultDependency(model: ElectroCraftDataModel, fieldId?: string, parentFieldRef: string | null = null) {
  return model.fields.find(
    (candidate) =>
      candidate.id !== fieldId &&
      readElectroCraftAdvancedFieldMetadata(candidate).parentFieldRef === parentFieldRef &&
      candidate.type !== 'group' &&
      candidate.type !== 'repeater',
  );
}

export function createAdvancedMetadataForField(
  model: ElectroCraftDataModel,
  type: ElectroCraftDataFieldType,
  options?: {
    readonly fieldId?: ElectroCraftObjectId;
    readonly parentFieldRef?: ElectroCraftObjectId | null;
    readonly order?: number;
    readonly existing?: ElectroCraftAdvancedFieldMetadata;
  },
): ElectroCraftAdvancedFieldMetadata {
  const parentFieldRef = options?.parentFieldRef ?? options?.existing?.parentFieldRef ?? null;
  const order = options?.order ?? options?.existing?.order ?? model.fields.length;
  const dependency = defaultDependency(model, options?.fieldId, parentFieldRef);
  const base: Partial<ElectroCraftAdvancedFieldMetadata> = { parentFieldRef, order };

  if (type === 'repeater') {
    base.repeater = options?.existing?.repeater ?? { minItems: 0 };
  }
  if (type === 'calculated') {
    base.calculated =
      options?.existing?.calculated ??
      (dependency
        ? { operation: 'coalesce', operands: [{ kind: 'field', fieldKey: dependency.key }] }
        : { operation: 'coalesce', operands: [{ kind: 'literal', value: null }] });
  }
  if (type === 'conditional') {
    base.conditional =
      options?.existing?.conditional ??
      (dependency
        ? {
            rule: { kind: 'comparison', fieldKey: dependency.key, operator: 'not-empty' },
            valueType: 'text',
            whenFalse: 'omit',
          }
        : {
            rule: { kind: 'comparison', fieldKey: 'name', operator: 'not-empty' },
            valueType: 'text',
            whenFalse: 'omit',
          });
  }
  return createElectroCraftAdvancedFieldMetadata(base);
}

export function withAdvancedFieldMetadata(
  model: ElectroCraftDataModel,
  field: ElectroCraftDataField,
  type: ElectroCraftDataFieldType = field.type,
  patch?: Partial<ElectroCraftAdvancedFieldMetadata>,
): ElectroCraftDataField {
  const current = readElectroCraftAdvancedFieldMetadata(field);
  const advanced = createAdvancedMetadataForField(model, type, {
    fieldId: field.id,
    existing: { ...current, ...patch },
    parentFieldRef: patch?.parentFieldRef ?? current.parentFieldRef,
    order: patch?.order ?? current.order,
  });
  return Object.freeze({
    ...field,
    type,
    metadata: Object.freeze({
      ...field.metadata,
      advancedField: advanced as unknown as JsonValue,
    }),
  });
}

export function modelCapabilityRefsForFields(model: ElectroCraftDataModel, fields: readonly ElectroCraftDataField[]) {
  const refs = new Set(model.capabilityRefs ?? []);
  if (fields.some((field) => isElectroCraftAdvancedFieldType(field.type)))
    refs.add(ELECTROCRAFT_ADVANCED_FIELD_CAPABILITY);
  else refs.delete(ELECTROCRAFT_ADVANCED_FIELD_CAPABILITY);
  return Object.freeze([...refs]);
}

export function moveFieldWithinScope(
  model: ElectroCraftDataModel,
  fieldId: ElectroCraftObjectId,
  direction: -1 | 1,
): readonly ElectroCraftDataField[] {
  const field = model.fields.find(({ id }) => id === fieldId);
  if (!field) return model.fields;
  const parentFieldRef = readElectroCraftAdvancedFieldMetadata(field).parentFieldRef;
  const scoped = model.fields
    .filter((candidate) => readElectroCraftAdvancedFieldMetadata(candidate).parentFieldRef === parentFieldRef)
    .sort(
      (left, right) =>
        readElectroCraftAdvancedFieldMetadata(left).order - readElectroCraftAdvancedFieldMetadata(right).order,
    );
  const currentIndex = scoped.findIndex(({ id }) => id === fieldId);
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= scoped.length) return model.fields;
  const reordered = [...scoped];
  const [moved] = reordered.splice(currentIndex, 1);
  if (!moved) return model.fields;
  reordered.splice(targetIndex, 0, moved);
  const orderById = new Map(reordered.map((candidate, index) => [candidate.id, index]));
  return Object.freeze(
    model.fields.map((candidate) => {
      const order = orderById.get(candidate.id);
      return order === undefined ? candidate : withAdvancedFieldMetadata(model, candidate, candidate.type, { order });
    }),
  );
}

export interface OrderedAdvancedField {
  readonly field: ElectroCraftDataField;
  readonly depth: number;
}

export function orderAdvancedFieldsForDisplay(model: ElectroCraftDataModel): readonly OrderedAdvancedField[] {
  const children = new Map<ElectroCraftObjectId | null, ElectroCraftDataField[]>();
  for (const field of model.fields) {
    const parent = readElectroCraftAdvancedFieldMetadata(field).parentFieldRef;
    const scoped = children.get(parent) ?? [];
    scoped.push(field);
    children.set(parent, scoped);
  }
  for (const scoped of children.values()) {
    scoped.sort(
      (left, right) =>
        readElectroCraftAdvancedFieldMetadata(left).order - readElectroCraftAdvancedFieldMetadata(right).order,
    );
  }

  const ordered: OrderedAdvancedField[] = [];
  const visited = new Set<ElectroCraftObjectId>();
  const visit = (parent: ElectroCraftObjectId | null, depth: number) => {
    for (const field of children.get(parent) ?? []) {
      if (visited.has(field.id)) continue;
      visited.add(field.id);
      ordered.push(Object.freeze({ field, depth }));
      if (field.type === 'group' || field.type === 'repeater') visit(field.id, depth + 1);
    }
  };
  visit(null, 0);
  for (const field of model.fields) {
    if (!visited.has(field.id)) ordered.push(Object.freeze({ field, depth: 0 }));
  }
  return Object.freeze(ordered);
}
