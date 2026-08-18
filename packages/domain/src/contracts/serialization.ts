import {
  electroCraftActionGraphSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftPermissionPolicySchema,
  electroCraftRoleSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
  type ElectroCraftActionGraph,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftPermissionPolicy,
  type ElectroCraftRole,
  type ElectroCraftRouteDefinition,
  type ElectroCraftStateDefinition,
} from './app-behavior';
import {
  electroCraftComponentDefinitionSchema,
  importElectroCraftComponentDefinition,
  validateComponentDefinitionReferences,
  type ElectroCraftComponentDefinition,
  type ElectroCraftComponentDefinitionImportResult,
} from './component-definition';
import {
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
} from './data-definition';
import {
  electroCraftDocumentSchema,
  importElectroCraftDocument,
  type ElectroCraftDocument,
  type ElectroCraftDocumentImportResult,
} from './document';
import {
  electroCraftProjectDefinitionSchema,
  importElectroCraftProjectDefinition,
  validateProjectDefinitionSemantics,
  type ElectroCraftProjectDefinition,
  type ElectroCraftProjectDefinitionImportResult,
} from './project-definition';
import { electroCraftQueryDefinitionSchema, type ElectroCraftQueryDefinition } from './query-definition';
import {
  electroCraftBlueprintPackageSchema,
  electroCraftRegistryDefinitionSchema,
  electroCraftThemeSchema,
  electroPlatformCapabilityDefinitionSchema,
  type ElectroCraftBlueprintPackage,
  type ElectroCraftRegistryDefinition,
  type ElectroCraftTheme,
  type ElectroPlatformCapabilityDefinition,
} from './theme-blueprint';

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sortJsonValue(item));
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, sortJsonValue(record[key])]),
    );
  }
  return value;
}

export function stableCanonicalStringify(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function parseJson(serialized: string): unknown {
  if (!serialized.trim()) throw new SyntaxError('canonical payload cannot be empty');
  return JSON.parse(serialized) as unknown;
}

function validateImportedProject(
  result: ElectroCraftProjectDefinitionImportResult,
): ElectroCraftProjectDefinitionImportResult {
  const diagnostics = validateProjectDefinitionSemantics(result.project);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid project semantics: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }
  return result;
}

export function serializeElectroCraftProjectDefinition(input: unknown): string {
  const project = electroCraftProjectDefinitionSchema.parse(input);
  const diagnostics = validateProjectDefinitionSemantics(project);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid project semantics: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }
  return stableCanonicalStringify(project);
}

export function deserializeElectroCraftProjectDefinitionWithMigration(
  serialized: string,
): ElectroCraftProjectDefinitionImportResult {
  return validateImportedProject(importElectroCraftProjectDefinition(parseJson(serialized)));
}

export function deserializeElectroCraftProjectDefinition(serialized: string): ElectroCraftProjectDefinition {
  return deserializeElectroCraftProjectDefinitionWithMigration(serialized).project;
}

export function serializeElectroCraftDocument(input: unknown): string {
  return stableCanonicalStringify(electroCraftDocumentSchema.parse(input));
}

export function deserializeElectroCraftDocument(serialized: string): ElectroCraftDocumentImportResult {
  return importElectroCraftDocument(parseJson(serialized));
}

export function serializeElectroCraftComponentDefinition(input: unknown): string {
  const definition = electroCraftComponentDefinitionSchema.parse(input);
  const diagnostics = validateComponentDefinitionReferences(definition);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid component references: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }
  return stableCanonicalStringify(definition);
}

export function deserializeElectroCraftComponentDefinition(
  serialized: string,
): ElectroCraftComponentDefinitionImportResult {
  const result = importElectroCraftComponentDefinition(parseJson(serialized));
  const diagnostics = validateComponentDefinitionReferences(result.definition);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid component references: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }
  return result;
}

export function serializeElectroCraftDataSourceDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftDataSourceDefinitionSchema.parse(input));
}

export function deserializeElectroCraftDataSourceDefinition(serialized: string): ElectroCraftDataSourceDefinition {
  return electroCraftDataSourceDefinitionSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftDataSchema(input: unknown): string {
  return stableCanonicalStringify(electroCraftDataSchemaSchema.parse(input));
}

export function deserializeElectroCraftDataSchema(serialized: string): ElectroCraftDataSchema {
  return electroCraftDataSchemaSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftQueryDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftQueryDefinitionSchema.parse(input));
}

export function deserializeElectroCraftQueryDefinition(serialized: string): ElectroCraftQueryDefinition {
  return electroCraftQueryDefinitionSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftActionGraph(input: unknown): string {
  return stableCanonicalStringify(electroCraftActionGraphSchema.parse(input));
}

export function deserializeElectroCraftActionGraph(serialized: string): ElectroCraftActionGraph {
  return electroCraftActionGraphSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftStateDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftStateDefinitionSchema.parse(input));
}

export function deserializeElectroCraftStateDefinition(serialized: string): ElectroCraftStateDefinition {
  return electroCraftStateDefinitionSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftRouteDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftRouteDefinitionSchema.parse(input));
}

export function deserializeElectroCraftRouteDefinition(serialized: string): ElectroCraftRouteDefinition {
  return electroCraftRouteDefinitionSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftNavigationDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftNavigationDefinitionSchema.parse(input));
}

export function deserializeElectroCraftNavigationDefinition(serialized: string): ElectroCraftNavigationDefinition {
  return electroCraftNavigationDefinitionSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftRole(input: unknown): string {
  return stableCanonicalStringify(electroCraftRoleSchema.parse(input));
}

export function deserializeElectroCraftRole(serialized: string): ElectroCraftRole {
  return electroCraftRoleSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftPermissionPolicy(input: unknown): string {
  return stableCanonicalStringify(electroCraftPermissionPolicySchema.parse(input));
}

export function deserializeElectroCraftPermissionPolicy(serialized: string): ElectroCraftPermissionPolicy {
  return electroCraftPermissionPolicySchema.parse(parseJson(serialized));
}

export function serializeElectroCraftTheme(input: unknown): string {
  return stableCanonicalStringify(electroCraftThemeSchema.parse(input));
}

export function deserializeElectroCraftTheme(serialized: string): ElectroCraftTheme {
  return electroCraftThemeSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftBlueprintPackage(input: unknown): string {
  return stableCanonicalStringify(electroCraftBlueprintPackageSchema.parse(input));
}

export function deserializeElectroCraftBlueprintPackage(serialized: string): ElectroCraftBlueprintPackage {
  return electroCraftBlueprintPackageSchema.parse(parseJson(serialized));
}

export function serializeElectroCraftRegistryDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftRegistryDefinitionSchema.parse(input));
}

export function deserializeElectroCraftRegistryDefinition(serialized: string): ElectroCraftRegistryDefinition {
  return electroCraftRegistryDefinitionSchema.parse(parseJson(serialized));
}

export function serializeElectroPlatformCapabilityDefinition(input: unknown): string {
  return stableCanonicalStringify(electroPlatformCapabilityDefinitionSchema.parse(input));
}

export function deserializeElectroPlatformCapabilityDefinition(
  serialized: string,
): ElectroPlatformCapabilityDefinition {
  return electroPlatformCapabilityDefinitionSchema.parse(parseJson(serialized));
}

export function canonicalProjectRoundTrip(project: ElectroCraftProjectDefinition): ElectroCraftProjectDefinition {
  return deserializeElectroCraftProjectDefinition(serializeElectroCraftProjectDefinition(project));
}

export function canonicalDocumentRoundTrip(document: ElectroCraftDocument): ElectroCraftDocument {
  return deserializeElectroCraftDocument(serializeElectroCraftDocument(document)).document;
}

export function canonicalComponentDefinitionRoundTrip(
  definition: ElectroCraftComponentDefinition,
): ElectroCraftComponentDefinition {
  return deserializeElectroCraftComponentDefinition(serializeElectroCraftComponentDefinition(definition)).definition;
}

export function canonicalDataSourceRoundTrip(
  source: ElectroCraftDataSourceDefinition,
): ElectroCraftDataSourceDefinition {
  return deserializeElectroCraftDataSourceDefinition(serializeElectroCraftDataSourceDefinition(source));
}

export function canonicalDataSchemaRoundTrip(schema: ElectroCraftDataSchema): ElectroCraftDataSchema {
  return deserializeElectroCraftDataSchema(serializeElectroCraftDataSchema(schema));
}

export function canonicalQueryRoundTrip(query: ElectroCraftQueryDefinition): ElectroCraftQueryDefinition {
  return deserializeElectroCraftQueryDefinition(serializeElectroCraftQueryDefinition(query));
}

export function canonicalActionGraphRoundTrip(graph: ElectroCraftActionGraph): ElectroCraftActionGraph {
  return deserializeElectroCraftActionGraph(serializeElectroCraftActionGraph(graph));
}

export function canonicalStateDefinitionRoundTrip(
  definition: ElectroCraftStateDefinition,
): ElectroCraftStateDefinition {
  return deserializeElectroCraftStateDefinition(serializeElectroCraftStateDefinition(definition));
}

export function canonicalRouteDefinitionRoundTrip(route: ElectroCraftRouteDefinition): ElectroCraftRouteDefinition {
  return deserializeElectroCraftRouteDefinition(serializeElectroCraftRouteDefinition(route));
}

export function canonicalNavigationDefinitionRoundTrip(
  navigation: ElectroCraftNavigationDefinition,
): ElectroCraftNavigationDefinition {
  return deserializeElectroCraftNavigationDefinition(serializeElectroCraftNavigationDefinition(navigation));
}

export function canonicalRoleRoundTrip(role: ElectroCraftRole): ElectroCraftRole {
  return deserializeElectroCraftRole(serializeElectroCraftRole(role));
}

export function canonicalPermissionPolicyRoundTrip(policy: ElectroCraftPermissionPolicy): ElectroCraftPermissionPolicy {
  return deserializeElectroCraftPermissionPolicy(serializeElectroCraftPermissionPolicy(policy));
}

export function canonicalThemeRoundTrip(theme: ElectroCraftTheme): ElectroCraftTheme {
  return deserializeElectroCraftTheme(serializeElectroCraftTheme(theme));
}

export function canonicalBlueprintPackageRoundTrip(
  blueprint: ElectroCraftBlueprintPackage,
): ElectroCraftBlueprintPackage {
  return deserializeElectroCraftBlueprintPackage(serializeElectroCraftBlueprintPackage(blueprint));
}

export function canonicalRegistryDefinitionRoundTrip(
  definition: ElectroCraftRegistryDefinition,
): ElectroCraftRegistryDefinition {
  return deserializeElectroCraftRegistryDefinition(serializeElectroCraftRegistryDefinition(definition));
}
