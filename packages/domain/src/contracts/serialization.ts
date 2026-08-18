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

function validateImportedProject(result: ElectroCraftProjectDefinitionImportResult): ElectroCraftProjectDefinitionImportResult {
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

export function canonicalDataSourceRoundTrip(source: ElectroCraftDataSourceDefinition): ElectroCraftDataSourceDefinition {
  return deserializeElectroCraftDataSourceDefinition(serializeElectroCraftDataSourceDefinition(source));
}

export function canonicalDataSchemaRoundTrip(schema: ElectroCraftDataSchema): ElectroCraftDataSchema {
  return deserializeElectroCraftDataSchema(serializeElectroCraftDataSchema(schema));
}

export function canonicalQueryRoundTrip(query: ElectroCraftQueryDefinition): ElectroCraftQueryDefinition {
  return deserializeElectroCraftQueryDefinition(serializeElectroCraftQueryDefinition(query));
}
