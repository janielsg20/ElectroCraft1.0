import { parseCanonicalJson, stableCanonicalStringify } from '../contracts/canonical-json';
import {
  electroCraftNavigationDefinitionSchema,
  electroCraftRouteDefinitionSchema,
  importElectroCraftNavigationDefinition,
  importElectroCraftRouteDefinition,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftNavigationImportResult,
  type ElectroCraftRouteDefinition,
  type ElectroCraftRouteImportResult,
} from './index';

export function serializeElectroCraftRouteDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftRouteDefinitionSchema.parse(input));
}

export function deserializeElectroCraftRouteDefinitionWithMigration(
  serialized: string,
): ElectroCraftRouteImportResult {
  return importElectroCraftRouteDefinition(parseCanonicalJson(serialized));
}

export function deserializeElectroCraftRouteDefinition(serialized: string): ElectroCraftRouteDefinition {
  return deserializeElectroCraftRouteDefinitionWithMigration(serialized).route;
}

export function serializeElectroCraftNavigationDefinition(input: unknown): string {
  return stableCanonicalStringify(electroCraftNavigationDefinitionSchema.parse(input));
}

export function deserializeElectroCraftNavigationDefinitionWithMigration(
  serialized: string,
): ElectroCraftNavigationImportResult {
  return importElectroCraftNavigationDefinition(parseCanonicalJson(serialized));
}

export function deserializeElectroCraftNavigationDefinition(serialized: string): ElectroCraftNavigationDefinition {
  return deserializeElectroCraftNavigationDefinitionWithMigration(serialized).navigation;
}

export function canonicalRouteDefinitionRoundTrip(route: ElectroCraftRouteDefinition): ElectroCraftRouteDefinition {
  return deserializeElectroCraftRouteDefinition(serializeElectroCraftRouteDefinition(route));
}

export function canonicalNavigationDefinitionRoundTrip(
  navigation: ElectroCraftNavigationDefinition,
): ElectroCraftNavigationDefinition {
  return deserializeElectroCraftNavigationDefinition(serializeElectroCraftNavigationDefinition(navigation));
}
