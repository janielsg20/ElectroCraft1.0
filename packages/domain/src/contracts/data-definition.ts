import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

export const electroCraftDataSourceKindSchema = z.enum(['internal', 'rest', 'graphql', 'sql', 'custom']);
export type ElectroCraftDataSourceKind = z.infer<typeof electroCraftDataSourceKindSchema>;

export const electroCraftDataSourceCapabilitySchema = z.enum([
  'read',
  'create',
  'update',
  'delete',
  'filter',
  'sort',
  'paginate',
  'aggregate',
  'subscribe',
]);

const forbiddenConfigKeyPattern = /^(?:password|passwd|secret|clientsecret|accesstoken|refreshtoken|apikey|authorization|credential)$/i;

function findSecretLikeConfigPath(value: unknown, path: string[] = []): string[] | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSecretLikeConfigPath(value[index], [...path, String(index)]);
      if (found) return found;
    }
    return null;
  }
  if (value === null || typeof value !== 'object') return null;

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenConfigKeyPattern.test(key.replace(/[-_]/g, ''))) {
      return [...path, key];
    }
    const found = findSecretLikeConfigPath(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

export const electroCraftDataSourceDefinitionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    kind: electroCraftDataSourceKindSchema,
    adapterId: z.string().regex(/^[a-z][a-z0-9.-]{1,119}$/),
    authRef: electroCraftObjectIdSchema.nullable(),
    config: z.record(z.string().min(1).max(120), jsonValueSchema),
    capabilities: z.array(electroCraftDataSourceCapabilitySchema).max(9),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((source, context) => {
    const duplicates = source.capabilities.filter((capability, index) => source.capabilities.indexOf(capability) !== index);
    if (duplicates.length > 0) {
      context.addIssue({ code: 'custom', path: ['capabilities'], message: 'data source capabilities must be unique' });
    }
    const secretPath = findSecretLikeConfigPath(source.config);
    if (secretPath) {
      context.addIssue({
        code: 'custom',
        path: ['config', ...secretPath],
        message: 'secrets are not allowed in DataSourceDefinition.config; use authRef',
      });
    }
  });

export type ElectroCraftDataSourceDefinition = z.infer<typeof electroCraftDataSourceDefinitionSchema>;

export const electroCraftDataFieldTypeSchema = z.enum(['text', 'number', 'boolean', 'date', 'datetime', 'json', 'relation']);
export type ElectroCraftDataFieldType = z.infer<typeof electroCraftDataFieldTypeSchema>;

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
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((field, context) => {
    if (field.faceted && !field.indexed) {
      context.addIssue({ code: 'custom', path: ['faceted'], message: 'faceted fields must be indexed' });
    }
    if (field.type === 'relation' && field.relationModelRef === null) {
      context.addIssue({ code: 'custom', path: ['relationModelRef'], message: 'relation field requires relationModelRef' });
    }
    if (field.type !== 'relation' && field.relationModelRef !== null) {
      context.addIssue({
        code: 'custom',
        path: ['relationModelRef'],
        message: 'relationModelRef is only valid for relation fields',
      });
    }
  });

export type ElectroCraftDataField = z.infer<typeof electroCraftDataFieldSchema>;

export const electroCraftDataModelSchema = z.strictObject({
  id: electroCraftObjectIdSchema,
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
  label: z.string().trim().min(1).max(160),
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

export function getDataModel(schema: ElectroCraftDataSchema, modelRef: ElectroCraftObjectId): ElectroCraftDataModel | null {
  return schema.models.find(({ id }) => id === modelRef) ?? null;
}

export function getDataField(model: ElectroCraftDataModel, fieldRef: ElectroCraftObjectId): ElectroCraftDataField | null {
  return model.fields.find(({ id }) => id === fieldRef) ?? null;
}
