import * as z from 'zod';
import type { ElectroCraftDataField, ElectroCraftDataModel } from '../contracts/data-definition';
import { jsonValueSchema, type JsonValue } from '../contracts/json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from '../contracts/object-id';

const fieldKeySchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/);

export const electroCraftCalculatedOperationSchema = z.enum([
  'add',
  'subtract',
  'multiply',
  'divide',
  'concat',
  'coalesce',
]);
export type ElectroCraftCalculatedOperation = z.infer<typeof electroCraftCalculatedOperationSchema>;

export const electroCraftCalculatedOperandSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('field'), fieldKey: fieldKeySchema }),
  z.strictObject({ kind: z.literal('literal'), value: jsonValueSchema }),
]);
export type ElectroCraftCalculatedOperand = z.infer<typeof electroCraftCalculatedOperandSchema>;

export const electroCraftCalculatedFieldConfigSchema = z.strictObject({
  operation: electroCraftCalculatedOperationSchema,
  operands: z.array(electroCraftCalculatedOperandSchema).min(1).max(20),
});
export type ElectroCraftCalculatedFieldConfig = z.infer<typeof electroCraftCalculatedFieldConfigSchema>;

export const electroCraftConditionalOperatorSchema = z.enum([
  'equals',
  'not-equals',
  'contains',
  'greater-than',
  'greater-than-or-equal',
  'less-than',
  'less-than-or-equal',
  'empty',
  'not-empty',
]);
export type ElectroCraftConditionalOperator = z.infer<typeof electroCraftConditionalOperatorSchema>;

export type ElectroCraftFieldRule =
  | {
      readonly kind: 'comparison';
      readonly fieldKey: string;
      readonly operator: ElectroCraftConditionalOperator;
      readonly value?: JsonValue;
    }
  | { readonly kind: 'and' | 'or'; readonly rules: readonly ElectroCraftFieldRule[] }
  | { readonly kind: 'not'; readonly rule: ElectroCraftFieldRule };

export const electroCraftFieldRuleSchema: z.ZodType<ElectroCraftFieldRule> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.strictObject({
      kind: z.literal('comparison'),
      fieldKey: fieldKeySchema,
      operator: electroCraftConditionalOperatorSchema,
      value: jsonValueSchema.optional(),
    }),
    z.strictObject({
      kind: z.literal('and'),
      rules: z.array(electroCraftFieldRuleSchema).min(1).max(20),
    }),
    z.strictObject({
      kind: z.literal('or'),
      rules: z.array(electroCraftFieldRuleSchema).min(1).max(20),
    }),
    z.strictObject({ kind: z.literal('not'), rule: electroCraftFieldRuleSchema }),
  ]),
);

export const electroCraftConditionalValueTypeSchema = z.enum(['text', 'number', 'boolean', 'json']);
export type ElectroCraftConditionalValueType = z.infer<typeof electroCraftConditionalValueTypeSchema>;

export const electroCraftConditionalFieldConfigSchema = z.strictObject({
  rule: electroCraftFieldRuleSchema,
  valueType: electroCraftConditionalValueTypeSchema.default('text'),
  whenFalse: z.enum(['omit', 'null']).default('omit'),
});
export type ElectroCraftConditionalFieldConfig = z.infer<typeof electroCraftConditionalFieldConfigSchema>;

export const electroCraftRepeaterFieldConfigSchema = z
  .strictObject({
    minItems: z.number().int().nonnegative().optional(),
    maxItems: z.number().int().positive().max(500).optional(),
  })
  .superRefine((config, context) => {
    if (config.minItems !== undefined && config.maxItems !== undefined && config.minItems > config.maxItems) {
      context.addIssue({ code: 'custom', path: ['minItems'], message: 'repeater minItems cannot exceed maxItems' });
    }
  });
export type ElectroCraftRepeaterFieldConfig = z.infer<typeof electroCraftRepeaterFieldConfigSchema>;

export const electroCraftAdvancedFieldMetadataSchema = z.strictObject({
  parentFieldRef: electroCraftObjectIdSchema.nullable().default(null),
  order: z.number().int().nonnegative().default(0),
  repeater: electroCraftRepeaterFieldConfigSchema.optional(),
  calculated: electroCraftCalculatedFieldConfigSchema.optional(),
  conditional: electroCraftConditionalFieldConfigSchema.optional(),
});
export type ElectroCraftAdvancedFieldMetadata = z.infer<typeof electroCraftAdvancedFieldMetadataSchema>;

export const ELECTROCRAFT_ADVANCED_FIELD_METADATA_KEY = 'advancedField' as const;
export const ELECTROCRAFT_ADVANCED_FIELD_CAPABILITY = 'data.advanced-fields' as const;

export function readElectroCraftAdvancedFieldMetadata(field: ElectroCraftDataField): ElectroCraftAdvancedFieldMetadata {
  const candidate = field.metadata[ELECTROCRAFT_ADVANCED_FIELD_METADATA_KEY];
  const parsed = electroCraftAdvancedFieldMetadataSchema.safeParse(candidate ?? {});
  if (!parsed.success) {
    return Object.freeze({ parentFieldRef: null, order: 0 });
  }
  return Object.freeze(parsed.data);
}

export function createElectroCraftAdvancedFieldMetadata(
  input: Partial<ElectroCraftAdvancedFieldMetadata>,
): ElectroCraftAdvancedFieldMetadata {
  return Object.freeze(electroCraftAdvancedFieldMetadataSchema.parse(input));
}

export function collectElectroCraftFieldRuleDependencies(rule: ElectroCraftFieldRule): readonly string[] {
  const dependencies = new Set<string>();
  const visit = (candidate: ElectroCraftFieldRule) => {
    if (candidate.kind === 'comparison') {
      dependencies.add(candidate.fieldKey);
      return;
    }
    if (candidate.kind === 'not') {
      visit(candidate.rule);
      return;
    }
    for (const child of candidate.rules) visit(child);
  };
  visit(rule);
  return Object.freeze([...dependencies]);
}

export function collectElectroCraftAdvancedFieldDependencies(field: ElectroCraftDataField): readonly string[] {
  const advanced = readElectroCraftAdvancedFieldMetadata(field);
  if (field.type === 'calculated' && advanced.calculated) {
    return Object.freeze(
      advanced.calculated.operands.flatMap((operand) => (operand.kind === 'field' ? [operand.fieldKey] : [])),
    );
  }
  if (field.type === 'conditional' && advanced.conditional) {
    return collectElectroCraftFieldRuleDependencies(advanced.conditional.rule);
  }
  return Object.freeze([]);
}

export type ElectroCraftAdvancedFieldDiagnosticCode =
  | 'invalid-advanced-config'
  | 'invalid-parent'
  | 'parent-cycle'
  | 'missing-dependency'
  | 'cross-scope-dependency'
  | 'dependency-cycle';

export interface ElectroCraftAdvancedFieldDiagnostic {
  readonly code: ElectroCraftAdvancedFieldDiagnosticCode;
  readonly fieldId: ElectroCraftObjectId;
  readonly message: string;
}

function hasCycle(graph: ReadonlyMap<string, readonly string[]>): ReadonlySet<string> {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cyclic = new Set<string>();
  const visit = (node: string, stack: readonly string[]) => {
    if (visiting.has(node)) {
      const index = stack.indexOf(node);
      for (const item of index >= 0 ? stack.slice(index) : [node]) cyclic.add(item);
      cyclic.add(node);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const child of graph.get(node) ?? []) visit(child, [...stack, node]);
    visiting.delete(node);
    visited.add(node);
  };
  for (const node of graph.keys()) visit(node, []);
  return cyclic;
}

export function validateElectroCraftAdvancedFieldModel(
  model: ElectroCraftDataModel,
): readonly ElectroCraftAdvancedFieldDiagnostic[] {
  const diagnostics: ElectroCraftAdvancedFieldDiagnostic[] = [];
  const byId = new Map(model.fields.map((field) => [field.id, field]));
  const byKey = new Map(model.fields.map((field) => [field.key, field]));
  const parentGraph = new Map<string, readonly string[]>();
  const dependencyGraph = new Map<string, readonly string[]>();

  for (const field of model.fields) {
    const raw = field.metadata[ELECTROCRAFT_ADVANCED_FIELD_METADATA_KEY];
    const parsed = electroCraftAdvancedFieldMetadataSchema.safeParse(raw ?? {});
    if (!parsed.success) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: configuración avanzada inválida.` });
      continue;
    }
    const advanced = parsed.data;
    if (advanced.parentFieldRef) {
      const parent = byId.get(advanced.parentFieldRef);
      if (!parent || !['group', 'repeater'].includes(parent.type) || parent.id === field.id) {
        diagnostics.push({ code: 'invalid-parent', fieldId: field.id, message: `${field.label}: el padre debe ser Group o Repeater del mismo modelo.` });
      } else {
        parentGraph.set(field.id, [parent.id]);
      }
    } else {
      parentGraph.set(field.id, []);
    }

    if (field.type === 'repeater' && !advanced.repeater) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: Repeater requiere configuración repetible.` });
    }
    if (field.type === 'calculated' && !advanced.calculated) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: Calculated requiere operación y operandos.` });
    }
    if (field.type === 'conditional' && !advanced.conditional) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: Conditional requiere un rule AST.` });
    }
    if (field.type !== 'repeater' && advanced.repeater) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: repeater config solo es válida para Repeater.` });
    }
    if (field.type !== 'calculated' && advanced.calculated) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: calculated config solo es válida para Calculated.` });
    }
    if (field.type !== 'conditional' && advanced.conditional) {
      diagnostics.push({ code: 'invalid-advanced-config', fieldId: field.id, message: `${field.label}: conditional config solo es válida para Conditional.` });
    }

    const dependencies = collectElectroCraftAdvancedFieldDependencies(field);
    dependencyGraph.set(field.key, dependencies);
    for (const dependency of dependencies) {
      const target = byKey.get(dependency);
      if (!target) {
        diagnostics.push({ code: 'missing-dependency', fieldId: field.id, message: `${field.label}: dependencia ${dependency} no existe.` });
        continue;
      }
      const targetParent = readElectroCraftAdvancedFieldMetadata(target).parentFieldRef;
      if (targetParent !== advanced.parentFieldRef) {
        diagnostics.push({ code: 'cross-scope-dependency', fieldId: field.id, message: `${field.label}: ${dependency} pertenece a otro scope anidado.` });
      }
    }
  }

  for (const fieldId of hasCycle(parentGraph)) {
    const field = byId.get(fieldId as ElectroCraftObjectId);
    if (field) diagnostics.push({ code: 'parent-cycle', fieldId: field.id, message: `${field.label}: ciclo de Group/Repeater detectado.` });
  }
  for (const fieldKey of hasCycle(dependencyGraph)) {
    const field = byKey.get(fieldKey);
    if (field) diagnostics.push({ code: 'dependency-cycle', fieldId: field.id, message: `${field.label}: ciclo de dependencias detectado.` });
  }

  return Object.freeze(diagnostics);
}

export function assertElectroCraftAdvancedFieldModel(model: ElectroCraftDataModel): void {
  const diagnostics = validateElectroCraftAdvancedFieldModel(model);
  if (diagnostics.length) throw new Error(`ADVANCED_FIELD_MODEL_INVALID:${diagnostics.map(({ message }) => message).join(' | ')}`);
}
