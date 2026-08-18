import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';
import { electroCraftBindingRefSchema } from './query-definition';

export const electroCraftDocumentKindSchema = z.enum([
  'screen',
  'template',
  'form',
  'admin-screen',
  'reusable-component',
]);

export type ElectroCraftDocumentKind = z.infer<typeof electroCraftDocumentKindSchema>;

export interface ElectroCraftDocumentNode {
  id: ElectroCraftObjectId;
  componentRef: string;
  props: Record<string, JsonValue>;
  children: ElectroCraftDocumentNode[];
}

export const electroCraftDocumentNodeSchema: z.ZodType<ElectroCraftDocumentNode> = z.lazy(() =>
  z.strictObject({
    id: electroCraftObjectIdSchema,
    componentRef: z.string().trim().min(1).max(200),
    props: z.record(z.string(), jsonValueSchema),
    children: z.array(electroCraftDocumentNodeSchema),
  }),
);

export const electroCraftDocumentReferencesSchema = z.strictObject({
  documentRefs: z.array(electroCraftObjectIdSchema),
});

export const electroCraftFormMetaSchema = z.strictObject({
  dataSchemaRef: electroCraftObjectIdSchema.nullable(),
  modelRef: electroCraftObjectIdSchema.nullable(),
  submitActionRef: electroCraftObjectIdSchema.nullable(),
  initialValuesBinding: electroCraftBindingRefSchema.nullable(),
  fieldBindings: z.record(z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/), electroCraftBindingRefSchema),
  validationMode: z.enum(['change', 'blur', 'submit']),
});
export type ElectroCraftFormMeta = z.infer<typeof electroCraftFormMetaSchema>;

const documentBaseShape = {
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  kind: electroCraftDocumentKindSchema,
  root: electroCraftDocumentNodeSchema,
  references: electroCraftDocumentReferencesSchema,
  metadata: electroCraftMetadataSchema,
} as const;

export const electroCraftDocumentSchema = z
  .strictObject({
    schemaVersion: z.literal(2),
    ...documentBaseShape,
    formMeta: electroCraftFormMetaSchema.nullable(),
  })
  .superRefine((document, context) => {
    if (document.kind === 'form' && document.formMeta === null) {
      context.addIssue({ code: 'custom', path: ['formMeta'], message: 'form document requires formMeta' });
    }
    if (document.kind !== 'form' && document.formMeta !== null) {
      context.addIssue({ code: 'custom', path: ['formMeta'], message: 'formMeta is only valid for form documents' });
    }
    if (document.kind === 'form' && document.formMeta !== null) {
      const hasDataSchema = document.formMeta.dataSchemaRef !== null;
      const hasModel = document.formMeta.modelRef !== null;
      if (hasDataSchema !== hasModel) {
        context.addIssue({
          code: 'custom',
          path: ['formMeta'],
          message: 'form dataSchemaRef and modelRef must be both set or both null',
        });
      }
    }
  });

export type ElectroCraftDocument = z.infer<typeof electroCraftDocumentSchema>;

const legacyDocumentV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  ...documentBaseShape,
});

export const legacyPageDocumentSchema = z.strictObject({
  schemaVersion: z.literal(0).optional(),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  kind: z.literal('page'),
  root: electroCraftDocumentNodeSchema,
  references: electroCraftDocumentReferencesSchema,
  metadata: electroCraftMetadataSchema,
});

export interface ElectroCraftDocumentImportResult {
  document: ElectroCraftDocument;
  migratedFrom: 'page' | 1 | null;
}

function emptyLegacyFormMeta(): ElectroCraftFormMeta {
  return {
    dataSchemaRef: null,
    modelRef: null,
    submitActionRef: null,
    initialValuesBinding: null,
    fieldBindings: {},
    validationMode: 'submit',
  };
}

export function importElectroCraftDocument(input: unknown): ElectroCraftDocumentImportResult {
  const canonical = electroCraftDocumentSchema.safeParse(input);
  if (canonical.success) {
    return { document: canonical.data, migratedFrom: null };
  }

  const legacyV1 = legacyDocumentV1Schema.safeParse(input);
  if (legacyV1.success) {
    const document = electroCraftDocumentSchema.parse({
      ...legacyV1.data,
      schemaVersion: 2,
      formMeta: legacyV1.data.kind === 'form' ? emptyLegacyFormMeta() : null,
    });
    return { document, migratedFrom: 1 };
  }

  const legacyPage = legacyPageDocumentSchema.safeParse(input);
  if (!legacyPage.success) {
    throw canonical.error;
  }

  const { schemaVersion: _legacySchemaVersion, ...legacy } = legacyPage.data;
  const document = electroCraftDocumentSchema.parse({
    ...legacy,
    schemaVersion: 2,
    kind: 'screen',
    formMeta: null,
  });

  return { document, migratedFrom: 'page' };
}
