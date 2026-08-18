import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

export const electroCraftLayoutModeSchema = z.enum(['flow', 'stack', 'row', 'grid', 'overlay']);
export type ElectroCraftLayoutMode = z.infer<typeof electroCraftLayoutModeSchema>;

export const electroCraftAlignmentSchema = z.enum(['start', 'center', 'end', 'stretch']);
export const electroCraftJustifySchema = z.enum(['start', 'center', 'end', 'space-between', 'space-around']);

export const electroCraftLengthUnitSchema = z.enum(['px', 'rem', 'percent', 'vh', 'vw', 'unitless']);

const electroCraftTokenLengthSchema = z.strictObject({
  kind: z.literal('token'),
  token: z.string().trim().min(1).max(120),
});

const electroCraftNumericLengthSchema = z.strictObject({
  kind: z.literal('value'),
  value: z.number().finite(),
  unit: electroCraftLengthUnitSchema,
});

export const electroCraftLengthSchema = z.discriminatedUnion('kind', [
  electroCraftTokenLengthSchema,
  electroCraftNumericLengthSchema,
]);
export type ElectroCraftLength = z.infer<typeof electroCraftLengthSchema>;

const electroCraftTokenColorSchema = z.strictObject({
  kind: z.literal('token'),
  token: z.string().trim().min(1).max(120),
});

const electroCraftRgbaColorSchema = z.strictObject({
  kind: z.literal('rgba'),
  red: z.number().int().min(0).max(255),
  green: z.number().int().min(0).max(255),
  blue: z.number().int().min(0).max(255),
  alpha: z.number().min(0).max(1),
});

export const electroCraftColorSchema = z.discriminatedUnion('kind', [
  electroCraftTokenColorSchema,
  electroCraftRgbaColorSchema,
]);
export type ElectroCraftColor = z.infer<typeof electroCraftColorSchema>;

export const electroCraftStyleDeclarationSchema = z.strictObject({
  width: electroCraftLengthSchema.nullable(),
  height: electroCraftLengthSchema.nullable(),
  minWidth: electroCraftLengthSchema.nullable(),
  maxWidth: electroCraftLengthSchema.nullable(),
  gap: electroCraftLengthSchema.nullable(),
  padding: electroCraftLengthSchema.nullable(),
  margin: electroCraftLengthSchema.nullable(),
  fontSize: electroCraftLengthSchema.nullable(),
  fontWeight: z.number().int().min(100).max(900).nullable(),
  textAlign: z.enum(['start', 'center', 'end', 'justify']).nullable(),
  foreground: electroCraftColorSchema.nullable(),
  background: electroCraftColorSchema.nullable(),
  opacity: z.number().min(0).max(1).nullable(),
});
export type ElectroCraftStyleDeclaration = z.infer<typeof electroCraftStyleDeclarationSchema>;

export const electroCraftStyleOverrideSchema = electroCraftStyleDeclarationSchema.partial();
export const electroCraftBreakpointSchema = z.enum(['mobile', 'tablet', 'laptop', 'desktop']);
export const electroCraftPlatformSchema = z.enum(['web', 'native', 'ios', 'android']);

export const electroCraftStyleSchema = z.strictObject({
  schemaVersion: z.literal(1),
  base: electroCraftStyleDeclarationSchema,
  responsive: z.partialRecord(electroCraftBreakpointSchema, electroCraftStyleOverrideSchema),
  platform: z.partialRecord(electroCraftPlatformSchema, electroCraftStyleOverrideSchema),
});
export type ElectroCraftStyle = z.infer<typeof electroCraftStyleSchema>;

export const electroCraftLayoutSchema = z
  .strictObject({
    mode: electroCraftLayoutModeSchema,
    gap: electroCraftLengthSchema.nullable(),
    align: electroCraftAlignmentSchema,
    justify: electroCraftJustifySchema,
    wrap: z.boolean(),
    columns: z.number().int().min(1).max(24).nullable(),
  })
  .superRefine((layout, context) => {
    if (layout.mode === 'grid' && layout.columns === null) {
      context.addIssue({
        code: 'custom',
        path: ['columns'],
        message: 'grid layout requires columns',
      });
    }
    if (layout.mode !== 'grid' && layout.columns !== null) {
      context.addIssue({
        code: 'custom',
        path: ['columns'],
        message: 'columns are only valid for grid layout',
      });
    }
  });
export type ElectroCraftLayout = z.infer<typeof electroCraftLayoutSchema>;

export const electroCraftComponentFieldKindSchema = z.enum(['text', 'number', 'boolean', 'select']);

export const electroCraftComponentFieldOptionSchema = z.strictObject({
  label: z.string().trim().min(1).max(120),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export const electroCraftComponentFieldSchema = z
  .strictObject({
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(120),
    kind: electroCraftComponentFieldKindSchema,
    required: z.boolean(),
    options: z.array(electroCraftComponentFieldOptionSchema).max(100),
  })
  .superRefine((field, context) => {
    if (field.kind === 'select' && field.options.length === 0) {
      context.addIssue({ code: 'custom', path: ['options'], message: 'select field requires options' });
    }
    if (field.kind !== 'select' && field.options.length > 0) {
      context.addIssue({ code: 'custom', path: ['options'], message: 'options are only valid for select fields' });
    }
  });
export type ElectroCraftComponentField = z.infer<typeof electroCraftComponentFieldSchema>;

export const electroCraftComponentReferencesSchema = z.strictObject({
  componentRefs: z.array(electroCraftObjectIdSchema),
  assetRefs: z.array(electroCraftObjectIdSchema),
  actionRefs: z.array(electroCraftObjectIdSchema),
});
export type ElectroCraftComponentReferences = z.infer<typeof electroCraftComponentReferencesSchema>;

const componentDefinitionBaseShape = {
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
  label: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(120),
  fields: z.array(electroCraftComponentFieldSchema).max(100),
  defaultProps: z.record(z.string(), jsonValueSchema),
  layout: electroCraftLayoutSchema,
  style: electroCraftStyleSchema,
  references: electroCraftComponentReferencesSchema,
  metadata: electroCraftMetadataSchema,
} as const;

export const electroCraftComponentDefinitionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    ...componentDefinitionBaseShape,
  })
  .superRefine((definition, context) => {
    const fieldKeys = new Set<string>();
    for (const field of definition.fields) {
      if (fieldKeys.has(field.key)) {
        context.addIssue({ code: 'custom', path: ['fields'], message: `duplicate field key: ${field.key}` });
      }
      fieldKeys.add(field.key);
    }

    for (const propKey of Object.keys(definition.defaultProps)) {
      if (!fieldKeys.has(propKey)) {
        context.addIssue({ code: 'custom', path: ['defaultProps', propKey], message: 'default prop has no field' });
      }
    }
  });
export type ElectroCraftComponentDefinition = z.infer<typeof electroCraftComponentDefinitionSchema>;

const legacyComponentDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(0).optional(),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
  label: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(120),
  fields: z.array(electroCraftComponentFieldSchema).max(100),
  defaultProps: z.record(z.string(), jsonValueSchema),
  layoutMode: z.enum(['flow', 'vertical', 'horizontal', 'grid', 'overlay']),
  gridColumns: z.number().int().min(1).max(24).nullable(),
  style: electroCraftStyleSchema,
  references: electroCraftComponentReferencesSchema,
  metadata: electroCraftMetadataSchema,
});

export interface ElectroCraftComponentDefinitionImportResult {
  definition: ElectroCraftComponentDefinition;
  migratedFrom: 0 | null;
}

function migratedLayout(mode: z.infer<typeof legacyComponentDefinitionSchema>['layoutMode'], columns: number | null) {
  const canonicalMode: ElectroCraftLayoutMode = mode === 'vertical' ? 'stack' : mode === 'horizontal' ? 'row' : mode;
  return {
    mode: canonicalMode,
    gap: null,
    align: 'stretch' as const,
    justify: 'start' as const,
    wrap: false,
    columns: canonicalMode === 'grid' ? (columns ?? 1) : null,
  };
}

export function importElectroCraftComponentDefinition(input: unknown): ElectroCraftComponentDefinitionImportResult {
  const canonical = electroCraftComponentDefinitionSchema.safeParse(input);
  if (canonical.success) {
    return { definition: canonical.data, migratedFrom: null };
  }

  const legacy = legacyComponentDefinitionSchema.safeParse(input);
  if (!legacy.success) {
    throw canonical.error;
  }

  const { schemaVersion: _schemaVersion, layoutMode, gridColumns, ...rest } = legacy.data;
  const definition = electroCraftComponentDefinitionSchema.parse({
    ...rest,
    schemaVersion: 1,
    layout: migratedLayout(layoutMode, gridColumns),
  });

  return { definition, migratedFrom: 0 };
}

export interface ElectroCraftComponentReferenceDiagnostic {
  code: 'duplicate-reference';
  ownerId: ElectroCraftObjectId;
  ref: ElectroCraftObjectId;
}

export function validateComponentDefinitionReferences(
  definition: ElectroCraftComponentDefinition,
): ElectroCraftComponentReferenceDiagnostic[] {
  const refs = [
    ...definition.references.componentRefs,
    ...definition.references.assetRefs,
    ...definition.references.actionRefs,
  ];
  const seen = new Set<ElectroCraftObjectId>();
  const diagnostics: ElectroCraftComponentReferenceDiagnostic[] = [];
  for (const ref of refs) {
    if (seen.has(ref)) {
      diagnostics.push({ code: 'duplicate-reference', ownerId: definition.id, ref });
    }
    seen.add(ref);
  }
  return diagnostics;
}

export type ElectroCraftComponentDefaultProps = Record<string, JsonValue>;
