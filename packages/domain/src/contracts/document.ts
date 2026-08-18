import * as z from 'zod';
import {
  electroCraftMetadataSchema,
  jsonValueSchema,
  type JsonValue,
} from './json-value';
import {
  electroCraftObjectIdSchema,
  type ElectroCraftObjectId,
} from './object-id';

export const electroCraftDocumentKindSchema = z.enum([
  'screen',
  'template',
  'form',
  'admin-screen',
  'reusable-component',
]);

export type ElectroCraftDocumentKind = z.infer<
  typeof electroCraftDocumentKindSchema
>;

export interface ElectroCraftDocumentNode {
  id: ElectroCraftObjectId;
  componentRef: string;
  props: Record<string, JsonValue>;
  children: ElectroCraftDocumentNode[];
}

export const electroCraftDocumentNodeSchema: z.ZodType<ElectroCraftDocumentNode> =
  z.lazy(() =>
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

export const electroCraftDocumentSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  kind: electroCraftDocumentKindSchema,
  root: electroCraftDocumentNodeSchema,
  references: electroCraftDocumentReferencesSchema,
  metadata: electroCraftMetadataSchema,
});

export type ElectroCraftDocument = z.infer<typeof electroCraftDocumentSchema>;

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
  migratedFrom: 'page' | null;
}

export function importElectroCraftDocument(
  input: unknown,
): ElectroCraftDocumentImportResult {
  const canonical = electroCraftDocumentSchema.safeParse(input);
  if (canonical.success) {
    return { document: canonical.data, migratedFrom: null };
  }

  const legacyPage = legacyPageDocumentSchema.safeParse(input);
  if (!legacyPage.success) {
    throw canonical.error;
  }

  const { schemaVersion: _legacySchemaVersion, ...legacy } = legacyPage.data;
  const document = electroCraftDocumentSchema.parse({
    ...legacy,
    schemaVersion: 1,
    kind: 'screen',
  });

  return { document, migratedFrom: 'page' };
}
