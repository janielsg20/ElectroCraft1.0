import * as z from 'zod';
import { electroCraftDocumentSchema, type ElectroCraftDocument } from './document';
import { electroCraftMetadataSchema } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

export const electroCraftTargetIdSchema = z.enum([
  'local',
  'react',
  'static',
  'pwa',
  'android',
  'ios',
  'capacitor',
  'lamp',
  'wordpress',
]);

export type ElectroCraftTargetId = z.infer<typeof electroCraftTargetIdSchema>;

export const electroCraftAppSettingsSchema = z.strictObject({
  displayName: z.string().trim().min(1).max(120),
  locale: z.string().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/),
});

const projectBaseShape = {
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  appSettings: electroCraftAppSettingsSchema,
  defaultTargets: z.array(electroCraftTargetIdSchema).min(1).max(9),
  documentRefs: z.array(electroCraftObjectIdSchema),
  routeRefs: z.array(electroCraftObjectIdSchema),
  navigationRefs: z.array(electroCraftObjectIdSchema),
  rootNavigationRef: electroCraftObjectIdSchema.nullable(),
  themeRef: electroCraftObjectIdSchema.nullable(),
  featureFlags: z.record(z.string().min(1), z.boolean()),
  metadata: electroCraftMetadataSchema,
} as const;

export const electroCraftProjectDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(2),
  ...projectBaseShape,
  dataSourceRefs: z.array(electroCraftObjectIdSchema),
  dataSchemaRefs: z.array(electroCraftObjectIdSchema),
  queryRefs: z.array(electroCraftObjectIdSchema),
});

export type ElectroCraftProjectDefinition = z.infer<typeof electroCraftProjectDefinitionSchema>;

const legacyProjectDefinitionV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  ...projectBaseShape,
});

export interface ElectroCraftProjectDefinitionImportResult {
  project: ElectroCraftProjectDefinition;
  migratedFrom: 1 | null;
}

export function importElectroCraftProjectDefinition(input: unknown): ElectroCraftProjectDefinitionImportResult {
  const canonical = electroCraftProjectDefinitionSchema.safeParse(input);
  if (canonical.success) return { project: canonical.data, migratedFrom: null };

  const legacy = legacyProjectDefinitionV1Schema.safeParse(input);
  if (!legacy.success) throw canonical.error;

  return {
    project: electroCraftProjectDefinitionSchema.parse({
      ...legacy.data,
      schemaVersion: 2,
      dataSourceRefs: [],
      dataSchemaRefs: [],
      queryRefs: [],
    }),
    migratedFrom: 1,
  };
}

export type CanonicalReferenceDiagnosticCode =
  | 'duplicate-default-target'
  | 'duplicate-document-ref'
  | 'duplicate-route-ref'
  | 'duplicate-navigation-ref'
  | 'duplicate-data-source-ref'
  | 'duplicate-data-schema-ref'
  | 'duplicate-query-ref'
  | 'root-navigation-not-listed'
  | 'duplicate-document-id'
  | 'missing-document-ref';

export interface CanonicalReferenceDiagnostic {
  code: CanonicalReferenceDiagnosticCode;
  ownerId: ElectroCraftObjectId;
  ref?: string;
}

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates].sort();
}

export function validateProjectDefinitionSemantics(
  project: ElectroCraftProjectDefinition,
): CanonicalReferenceDiagnostic[] {
  const diagnostics: CanonicalReferenceDiagnostic[] = [];
  const lists = [
    ['duplicate-default-target', project.defaultTargets],
    ['duplicate-document-ref', project.documentRefs],
    ['duplicate-route-ref', project.routeRefs],
    ['duplicate-navigation-ref', project.navigationRefs],
    ['duplicate-data-source-ref', project.dataSourceRefs],
    ['duplicate-data-schema-ref', project.dataSchemaRefs],
    ['duplicate-query-ref', project.queryRefs],
  ] as const;

  for (const [code, values] of lists) {
    for (const duplicate of duplicateValues(values)) {
      diagnostics.push({ code, ownerId: project.id, ref: duplicate });
    }
  }

  if (project.rootNavigationRef !== null && !project.navigationRefs.includes(project.rootNavigationRef)) {
    diagnostics.push({
      code: 'root-navigation-not-listed',
      ownerId: project.id,
      ref: project.rootNavigationRef,
    });
  }

  return diagnostics;
}

export function validateProjectDocumentReferences(
  projectInput: unknown,
  documentInputs: readonly unknown[],
): CanonicalReferenceDiagnostic[] {
  const project = electroCraftProjectDefinitionSchema.parse(projectInput);
  const documents = documentInputs.map((document) => electroCraftDocumentSchema.parse(document));
  const diagnostics = validateProjectDefinitionSemantics(project);
  const documentsById = new Map<ElectroCraftObjectId, ElectroCraftDocument>();

  for (const document of documents) {
    if (documentsById.has(document.id)) {
      diagnostics.push({
        code: 'duplicate-document-id',
        ownerId: project.id,
        ref: document.id,
      });
    }
    documentsById.set(document.id, document);
  }

  const requiredDocumentRefs = new Set<ElectroCraftObjectId>(project.documentRefs);
  for (const document of documents) {
    for (const ref of document.references.documentRefs) requiredDocumentRefs.add(ref);
  }

  for (const ref of [...requiredDocumentRefs].sort()) {
    if (!documentsById.has(ref)) {
      diagnostics.push({ code: 'missing-document-ref', ownerId: project.id, ref });
    }
  }

  return diagnostics;
}
