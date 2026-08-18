import {
  electroCraftComponentDefinitionSchema,
  importElectroCraftComponentDefinition,
  validateComponentDefinitionReferences,
  type ElectroCraftComponentDefinition,
  type ElectroCraftComponentDefinitionImportResult,
} from './component-definition';
import {
  electroCraftDocumentSchema,
  importElectroCraftDocument,
  type ElectroCraftDocument,
  type ElectroCraftDocumentImportResult,
} from './document';
import {
  electroCraftProjectDefinitionSchema,
  validateProjectDefinitionSemantics,
  type ElectroCraftProjectDefinition,
} from './project-definition';

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortJsonValue(item));
  }
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
  if (!serialized.trim()) {
    throw new SyntaxError('canonical payload cannot be empty');
  }
  return JSON.parse(serialized) as unknown;
}

export function serializeElectroCraftProjectDefinition(input: unknown): string {
  const project = electroCraftProjectDefinitionSchema.parse(input);
  const diagnostics = validateProjectDefinitionSemantics(project);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid project semantics: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }
  return stableCanonicalStringify(project);
}

export function deserializeElectroCraftProjectDefinition(serialized: string): ElectroCraftProjectDefinition {
  const project = electroCraftProjectDefinitionSchema.parse(parseJson(serialized));
  const diagnostics = validateProjectDefinitionSemantics(project);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid project semantics: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }
  return project;
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
