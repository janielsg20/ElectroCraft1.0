import * as z from 'zod';
import { electroCraftDocumentSchema, type ElectroCraftDocument } from './document';
import { electroCraftMetadataSchema } from './json-value';
import { ElectroCraftMigrationRegistry, type ElectroCraftMigrationResult } from './migration-registry';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';
import {
  electroCraftCapabilityIdSchema,
  electroCraftCapabilitySupportModeSchema,
  electroCraftOriginBlueprintSchema,
} from './theme-blueprint';

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

const projectDataShape = {
  dataSourceRefs: z.array(electroCraftObjectIdSchema),
  dataSchemaRefs: z.array(electroCraftObjectIdSchema),
  queryRefs: z.array(electroCraftObjectIdSchema),
} as const;

export const electroCraftProjectDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(3),
  ...projectBaseShape,
  ...projectDataShape,
  originBlueprint: electroCraftOriginBlueprintSchema.nullable(),
  requiredCapabilities: z.array(electroCraftCapabilityIdSchema).max(200),
  targetCapabilityOverrides: z.partialRecord(
    electroCraftTargetIdSchema,
    z.record(electroCraftCapabilityIdSchema, electroCraftCapabilitySupportModeSchema),
  ),
  userRegistryDefinitionRefs: z.array(electroCraftObjectIdSchema).max(2_000),
});

export type ElectroCraftProjectDefinition = z.infer<typeof electroCraftProjectDefinitionSchema>;

const legacyProjectDefinitionV2Schema = z.strictObject({
  schemaVersion: z.literal(2),
  ...projectBaseShape,
  ...projectDataShape,
});

const legacyProjectDefinitionV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  ...projectBaseShape,
});

const electroCraftProjectSchemaVersionHeaderSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export interface ElectroCraftProjectDefinitionImportResult {
  project: ElectroCraftProjectDefinition;
  migratedFrom: 1 | 2 | null;
}

function emptyM02_5ProjectFields() {
  return {
    originBlueprint: null,
    requiredCapabilities: [],
    targetCapabilityOverrides: {},
    userRegistryDefinitionRefs: [],
  } as const;
}

export function createElectroCraftProjectMigrationRegistry(): ElectroCraftMigrationRegistry {
  const registry = new ElectroCraftMigrationRegistry();
  registry.register({
    id: 'project-v1-to-v2-data-ownership',
    fromVersion: 1,
    toVersion: 2,
    migrate(input) {
      const project = legacyProjectDefinitionV1Schema.parse(input);
      return legacyProjectDefinitionV2Schema.parse({
        ...project,
        schemaVersion: 2,
        dataSourceRefs: [],
        dataSchemaRefs: [],
        queryRefs: [],
      });
    },
  });
  registry.register({
    id: 'project-v2-to-v3-theme-blueprint-capabilities',
    fromVersion: 2,
    toVersion: 3,
    migrate(input) {
      const project = legacyProjectDefinitionV2Schema.parse(input);
      return electroCraftProjectDefinitionSchema.parse({
        ...project,
        schemaVersion: 3,
        ...emptyM02_5ProjectFields(),
      });
    },
  });
  return registry;
}

const projectMigrationRegistry = createElectroCraftProjectMigrationRegistry();

export function migrateElectroCraftProjectDefinitionPayload(
  input: unknown,
  targetVersion = 3,
): ElectroCraftMigrationResult {
  const header = electroCraftProjectSchemaVersionHeaderSchema.parse(input);
  if (targetVersion < header.schemaVersion || targetVersion > 3) {
    throw new TypeError(`unsupported project migration target v${targetVersion}`);
  }
  if (header.schemaVersion === targetVersion) {
    const value = targetVersion === 3 ? electroCraftProjectDefinitionSchema.parse(input) : structuredClone(input);
    return {
      value,
      fromVersion: header.schemaVersion,
      toVersion: targetVersion,
      appliedStepIds: [],
    };
  }
  return projectMigrationRegistry.migrate(input, header.schemaVersion, targetVersion);
}

export function importElectroCraftProjectDefinition(input: unknown): ElectroCraftProjectDefinitionImportResult {
  const canonical = electroCraftProjectDefinitionSchema.safeParse(input);
  if (canonical.success) return { project: canonical.data, migratedFrom: null };

  const header = electroCraftProjectSchemaVersionHeaderSchema.safeParse(input);
  if (!header.success || header.data.schemaVersion === 3) throw canonical.error;

  const migration = migrateElectroCraftProjectDefinitionPayload(input, 3);
  return {
    project: electroCraftProjectDefinitionSchema.parse(migration.value),
    migratedFrom: header.data.schemaVersion,
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
  | 'duplicate-required-capability'
  | 'duplicate-user-registry-definition-ref'
  | 'capability-override-not-required'
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
    ['duplicate-required-capability', project.requiredCapabilities],
    ['duplicate-user-registry-definition-ref', project.userRegistryDefinitionRefs],
  ] as const;

  for (const [code, values] of lists) {
    for (const duplicate of duplicateValues(values)) {
      diagnostics.push({ code, ownerId: project.id, ref: duplicate });
    }
  }

  const requiredCapabilities = new Set(project.requiredCapabilities);
  for (const overrides of Object.values(project.targetCapabilityOverrides)) {
    if (!overrides) continue;
    for (const capabilityId of Object.keys(overrides)) {
      if (!requiredCapabilities.has(capabilityId)) {
        diagnostics.push({ code: 'capability-override-not-required', ownerId: project.id, ref: capabilityId });
      }
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
