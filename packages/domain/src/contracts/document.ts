import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';
import { electroCraftBindingRefSchema } from './query-definition';
import {
  electroCraftLayoutSchema,
  electroCraftStyleSchema,
  type ElectroCraftLayout,
  type ElectroCraftStyle,
} from './component-definition';

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
  layout: ElectroCraftLayout | null;
  style: ElectroCraftStyle | null;
  children: ElectroCraftDocumentNode[];
}

export const electroCraftDocumentNodeSchema: z.ZodType<ElectroCraftDocumentNode> = z.lazy(() =>
  z.strictObject({
    id: electroCraftObjectIdSchema,
    componentRef: z.string().trim().min(1).max(200),
    props: z.record(z.string(), jsonValueSchema),
    layout: electroCraftLayoutSchema.nullable().default(null),
    style: electroCraftStyleSchema.nullable().default(null),
    children: z.array(electroCraftDocumentNodeSchema),
  }),
);

interface LegacyElectroCraftDocumentNode {
  id: ElectroCraftObjectId;
  componentRef: string;
  props: Record<string, JsonValue>;
  children: LegacyElectroCraftDocumentNode[];
}

const legacyElectroCraftDocumentNodeSchema: z.ZodType<LegacyElectroCraftDocumentNode> = z.lazy(() =>
  z.strictObject({
    id: electroCraftObjectIdSchema,
    componentRef: z.string().trim().min(1).max(200),
    props: z.record(z.string(), jsonValueSchema),
    children: z.array(legacyElectroCraftDocumentNodeSchema),
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

export const electroCraftDisplayConditionSchema = z.strictObject({
  subject: z.enum(['route', 'document', 'role', 'capability']),
  operator: z.enum(['equals', 'not-equals', 'includes']),
  value: z.string().trim().min(1).max(240),
});
export type ElectroCraftDisplayCondition = z.infer<typeof electroCraftDisplayConditionSchema>;

export const electroCraftTemplateMetaSchema = z.strictObject({
  slot: z.enum(['page', 'section', 'header', 'footer', 'modal']),
  priority: z.number().int().min(-10_000).max(10_000),
  displayConditions: z.array(electroCraftDisplayConditionSchema).max(100),
});
export type ElectroCraftTemplateMeta = z.infer<typeof electroCraftTemplateMetaSchema>;

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
    schemaVersion: z.literal(4),
    ...documentBaseShape,
    formMeta: electroCraftFormMetaSchema.nullable(),
    templateMeta: electroCraftTemplateMetaSchema.nullable(),
  })
  .superRefine((document, context) => {
    if (document.kind === 'form' && document.formMeta === null) {
      context.addIssue({ code: 'custom', path: ['formMeta'], message: 'form document requires formMeta' });
    }
    if (document.kind !== 'form' && document.formMeta !== null) {
      context.addIssue({ code: 'custom', path: ['formMeta'], message: 'formMeta is only valid for form documents' });
    }
    if (document.kind === 'template' && document.templateMeta === null) {
      context.addIssue({ code: 'custom', path: ['templateMeta'], message: 'template document requires templateMeta' });
    }
    if (document.kind !== 'template' && document.templateMeta !== null) {
      context.addIssue({
        code: 'custom',
        path: ['templateMeta'],
        message: 'templateMeta is only valid for template documents',
      });
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

const legacyDocumentBaseShape = {
  ...documentBaseShape,
  root: legacyElectroCraftDocumentNodeSchema,
} as const;

const legacyDocumentV3Schema = z.strictObject({
  schemaVersion: z.literal(3),
  ...legacyDocumentBaseShape,
  formMeta: electroCraftFormMetaSchema.nullable(),
  templateMeta: electroCraftTemplateMetaSchema.nullable(),
});

const legacyDocumentV2Schema = z.strictObject({
  schemaVersion: z.literal(2),
  ...legacyDocumentBaseShape,
  formMeta: electroCraftFormMetaSchema.nullable(),
});

const legacyDocumentV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  ...legacyDocumentBaseShape,
});

export const legacyPageDocumentSchema = z.strictObject({
  schemaVersion: z.literal(0).optional(),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  kind: z.literal('page'),
  root: legacyElectroCraftDocumentNodeSchema,
  references: electroCraftDocumentReferencesSchema,
  metadata: electroCraftMetadataSchema,
});

export interface ElectroCraftDocumentImportResult {
  document: ElectroCraftDocument;
  migratedFrom: 'page' | 1 | 2 | 3 | null;
}

function migrateLegacyNode(node: LegacyElectroCraftDocumentNode): ElectroCraftDocumentNode {
  return electroCraftDocumentNodeSchema.parse({
    ...node,
    layout: null,
    style: null,
    children: node.children.map(migrateLegacyNode),
  });
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

function emptyLegacyTemplateMeta(): ElectroCraftTemplateMeta {
  return {
    slot: 'page',
    priority: 0,
    displayConditions: [],
  };
}

export function importElectroCraftDocument(input: unknown): ElectroCraftDocumentImportResult {
  const canonical = electroCraftDocumentSchema.safeParse(input);
  if (canonical.success) {
    return { document: canonical.data, migratedFrom: null };
  }

  const legacyV3 = legacyDocumentV3Schema.safeParse(input);
  if (legacyV3.success) {
    const document = electroCraftDocumentSchema.parse({
      ...legacyV3.data,
      schemaVersion: 4,
      root: migrateLegacyNode(legacyV3.data.root),
    });
    return { document, migratedFrom: 3 };
  }

  const legacyV2 = legacyDocumentV2Schema.safeParse(input);
  if (legacyV2.success) {
    const document = electroCraftDocumentSchema.parse({
      ...legacyV2.data,
      schemaVersion: 4,
      root: migrateLegacyNode(legacyV2.data.root),
      templateMeta: legacyV2.data.kind === 'template' ? emptyLegacyTemplateMeta() : null,
    });
    return { document, migratedFrom: 2 };
  }

  const legacyV1 = legacyDocumentV1Schema.safeParse(input);
  if (legacyV1.success) {
    const document = electroCraftDocumentSchema.parse({
      ...legacyV1.data,
      schemaVersion: 4,
      root: migrateLegacyNode(legacyV1.data.root),
      formMeta: legacyV1.data.kind === 'form' ? emptyLegacyFormMeta() : null,
      templateMeta: legacyV1.data.kind === 'template' ? emptyLegacyTemplateMeta() : null,
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
    schemaVersion: 4,
    kind: 'screen',
    root: migrateLegacyNode(legacy.root),
    formMeta: null,
    templateMeta: null,
  });

  return { document, migratedFrom: 'page' };
}
