import * as z from 'zod';
import type { ElectroCraftDataSourceDefinition } from '../data/source-definition';
import { electroCraftMetadataSchema, jsonValueSchema } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

export {
  electroCraftCanonicalDataSourceCapabilities,
  electroCraftCanonicalDataSourceCapabilitySchema,
  electroCraftDataSourceCapabilitySchema,
  electroCraftDataSourceDefinitionSchema,
  electroCraftDataSourceEnvironmentSchema,
  electroCraftDataSourceKindSchema,
  electroCraftDataSourceSchemaDiscoveryPolicySchema,
  getDataSourceSchemaDiscoveryPolicy,
  isDataSourceEnvironmentEnabled,
  normalizeDataSourceCapabilities,
  resolveDataSourceConfig,
} from '../data/source-definition';
export type {
  ElectroCraftCanonicalDataSourceCapability,
  ElectroCraftDataSourceCapability,
  ElectroCraftDataSourceDefinition,
  ElectroCraftDataSourceEnvironment,
  ElectroCraftDataSourceKind,
  ElectroCraftDataSourceSchemaDiscoveryPolicy,
} from '../data/source-definition';

export const electroCraftDataFieldTypeSchema = z.enum([
  'text',
  'textarea',
  'richtext',
  'number',
  'currency',
  'email',
  'phone',
  'url',
  'boolean',
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
  'json',
]);
export type ElectroCraftDataFieldType = z.infer<typeof electroCraftDataFieldTypeSchema>;

export const electroCraftDataFieldValidationSchema = z.strictObject({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().nonnegative().optional(),
  pattern: z.string().max(500).optional(),
  format: z.string().trim().min(1).max(80).optional(),
});
export type ElectroCraftDataFieldValidation = z.infer<typeof electroCraftDataFieldValidationSchema>;

export const electroCraftDataFieldOptionSchema = z.strictObject({
  label: z.string().trim().min(1).max(120),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type ElectroCraftDataFieldOption = z.infer<typeof electroCraftDataFieldOptionSchema>;

export const electroCraftDataFieldConditionSchema = z.strictObject({
  fieldKey: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
  operator: z.enum(['equals', 'not-equals', 'contains', 'empty', 'not-empty']),
  value: jsonValueSchema.optional(),
});
export type ElectroCraftDataFieldCondition = z.infer<typeof electroCraftDataFieldConditionSchema>;

export const electroCraftDataFieldPermissionsSchema = z.strictObject({
  read: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  write: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
});
export type ElectroCraftDataFieldPermissions = z.infer<typeof electroCraftDataFieldPermissionsSchema>;

export const electroCraftDataFieldSchema = z
  .strictObject({
    id: electroCraftObjectIdSchema,
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(120),
    type: electroCraftDataFieldTypeSchema,
    nullable: z.boolean(),
    indexed: z.boolean(),
    faceted: z.boolean(),
    relationModelRef: electroCraftObjectIdSchema.nullable(),
    help: z.string().trim().max(500).optional(),
    defaultValue: jsonValueSchema.optional(),
    required: z.boolean().optional(),
    validation: electroCraftDataFieldValidationSchema.optional(),
    options: z.array(electroCraftDataFieldOptionSchema).max(500).optional(),
    conditions: z.array(electroCraftDataFieldConditionSchema).max(50).optional(),
    permissions: electroCraftDataFieldPermissionsSchema.optional(),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((field, context) => {
    if (field.faceted && !field.indexed) {
      context.addIssue({ code: 'custom', path: ['faceted'], message: 'faceted fields must be indexed' });
    }
    if (field.required === true && field.nullable) {
      context.addIssue({ code: 'custom', path: ['required'], message: 'required fields cannot be nullable' });
    }
    if (field.type === 'relation' && field.relationModelRef === null) {
      context.addIssue({
        code: 'custom',
        path: ['relationModelRef'],
        message: 'relation field requires relationModelRef',
      });
    }
    if (field.type !== 'relation' && field.relationModelRef !== null) {
      context.addIssue({
        code: 'custom',
        path: ['relationModelRef'],
        message: 'relationModelRef is only valid for relation fields',
      });
    }
    if (!['select', 'radio', 'checkbox'].includes(field.type) && field.options?.length) {
      context.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'options are only valid for select, radio or checkbox fields',
      });
    }
    if (
      field.validation?.min !== undefined &&
      field.validation?.max !== undefined &&
      field.validation.min > field.validation.max
    ) {
      context.addIssue({ code: 'custom', path: ['validation'], message: 'validation min cannot exceed max' });
    }
    if (
      field.validation?.minLength !== undefined &&
      field.validation?.maxLength !== undefined &&
      field.validation.minLength > field.validation.maxLength
    ) {
      context.addIssue({
        code: 'custom',
        path: ['validation'],
        message: 'validation minLength cannot exceed maxLength',
      });
    }
  });

export type ElectroCraftDataField = z.infer<typeof electroCraftDataFieldSchema>;

export const electroCraftDataModelSchema = z.strictObject({
  id: electroCraftObjectIdSchema,
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
  label: z.string().trim().min(1).max(160),
  singularLabel: z.string().trim().min(1).max(160).optional(),
  pluralLabel: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  icon: z.string().trim().min(1).max(120).optional(),
  visibility: z.enum(['public', 'internal']).optional(),
  singleton: z.boolean().optional(),
  menuVisible: z.boolean().optional(),
  capabilityRefs: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  fields: z.array(electroCraftDataFieldSchema).min(1).max(500),
  metadata: electroCraftMetadataSchema,
});

export type ElectroCraftDataModel = z.infer<typeof electroCraftDataModelSchema>;

export const electroCraftDataSchemaSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    sourceRef: electroCraftObjectIdSchema,
    name: z.string().trim().min(1).max(160),
    models: z.array(electroCraftDataModelSchema).min(1).max(200),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((schema, context) => {
    const modelIds = new Set<ElectroCraftObjectId>();
    const modelKeys = new Set<string>();
    for (const [modelIndex, model] of schema.models.entries()) {
      if (modelIds.has(model.id)) {
        context.addIssue({ code: 'custom', path: ['models', modelIndex, 'id'], message: 'duplicate data model id' });
      }
      if (modelKeys.has(model.key)) {
        context.addIssue({ code: 'custom', path: ['models', modelIndex, 'key'], message: 'duplicate data model key' });
      }
      modelIds.add(model.id);
      modelKeys.add(model.key);

      const fieldIds = new Set<ElectroCraftObjectId>();
      const fieldKeys = new Set<string>();
      for (const [fieldIndex, field] of model.fields.entries()) {
        if (fieldIds.has(field.id)) {
          context.addIssue({
            code: 'custom',
            path: ['models', modelIndex, 'fields', fieldIndex, 'id'],
            message: 'duplicate data field id',
          });
        }
        if (fieldKeys.has(field.key)) {
          context.addIssue({
            code: 'custom',
            path: ['models', modelIndex, 'fields', fieldIndex, 'key'],
            message: 'duplicate data field key',
          });
        }
        fieldIds.add(field.id);
        fieldKeys.add(field.key);
      }
    }

    for (const [modelIndex, model] of schema.models.entries()) {
      for (const [fieldIndex, field] of model.fields.entries()) {
        if (field.relationModelRef !== null && !modelIds.has(field.relationModelRef)) {
          context.addIssue({
            code: 'custom',
            path: ['models', modelIndex, 'fields', fieldIndex, 'relationModelRef'],
            message: 'relationModelRef must reference a model in the same data schema',
          });
        }
      }
    }
  });

export type ElectroCraftDataSchema = z.infer<typeof electroCraftDataSchemaSchema>;

export interface DataOwnershipReferenceDiagnostic {
  code: 'missing-source-ref' | 'missing-model-ref' | 'missing-field-ref' | 'source-schema-drift';
  ownerId: ElectroCraftObjectId;
  ref: ElectroCraftObjectId;
}

export function validateDataSchemaReferences(
  schema: ElectroCraftDataSchema,
  sources: readonly ElectroCraftDataSourceDefinition[],
): DataOwnershipReferenceDiagnostic[] {
  const source = sources.find(({ id }) => id === schema.sourceRef);
  if (!source) {
    return [{ code: 'missing-source-ref', ownerId: schema.id, ref: schema.sourceRef }];
  }
  return [];
}

export function getDataModel(
  schema: ElectroCraftDataSchema,
  modelRef: ElectroCraftObjectId,
): ElectroCraftDataModel | null {
  return schema.models.find(({ id }) => id === modelRef) ?? null;
}

export function getDataField(
  model: ElectroCraftDataModel,
  fieldRef: ElectroCraftObjectId,
): ElectroCraftDataField | null {
  return model.fields.find(({ id }) => id === fieldRef) ?? null;
}
