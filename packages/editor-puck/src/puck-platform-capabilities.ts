import {
  electroCraftRegistryDefinitionSchema,
  electroPlatformCapabilityDefinitionSchema,
  type ElectroCraftComponentDefinition,
  type ElectroCraftRegistryDefinition,
  type ElectroPlatformCapabilityDefinition,
} from '@electrocraft/domain';
import type { PuckCanonicalConfig } from './puck-component-adapter';

export const ELECTROCRAFT_PUCK_REGISTRY_DEFINITION_METADATA = 'electrocraftRegistryDefinition';
export const ELECTROCRAFT_PUCK_CAPABILITY_DEFINITIONS_METADATA = 'electrocraftCapabilityDefinitions';

export interface PuckPlatformCapabilityRegistry {
  readonly definitions: readonly ElectroCraftRegistryDefinition[];
  readonly capabilities: readonly ElectroPlatformCapabilityDefinition[];
}

/**
 * Adds application-registry declarations to Puck Config metadata only. Registry
 * definitions remain application-owned and are never copied into the canonical
 * ElectroCraftDocument or persisted as editor internals.
 */
export function projectPlatformCapabilitiesToPuckConfig(
  config: PuckCanonicalConfig,
  componentDefinitions: readonly ElectroCraftComponentDefinition[],
  registry: PuckPlatformCapabilityRegistry,
): PuckCanonicalConfig {
  const definitionsByKey = new Map(
    registry.definitions
      .map((definition) => electroCraftRegistryDefinitionSchema.parse(definition))
      .filter((definition) => definition.kind === 'component')
      .map((definition) => [definition.key, definition] as const),
  );
  const capabilitiesById = new Map(
    registry.capabilities.map((definition) => {
      const parsed = electroPlatformCapabilityDefinitionSchema.parse(definition);
      return [parsed.id, parsed] as const;
    }),
  );
  const knownComponentKeys = new Set(componentDefinitions.map((definition) => definition.key));

  const components = { ...config.components };
  for (const [componentKey, component] of Object.entries(components)) {
    if (!knownComponentKeys.has(componentKey)) continue;
    const registryDefinition = definitionsByKey.get(componentKey);
    if (!registryDefinition) continue;

    const capabilityDefinitions = registryDefinition.capabilityRefs
      .map((capabilityId) => capabilitiesById.get(capabilityId))
      .filter((definition): definition is ElectroPlatformCapabilityDefinition => Boolean(definition));

    components[componentKey] = {
      ...component,
      metadata: {
        ...component.metadata,
        [ELECTROCRAFT_PUCK_REGISTRY_DEFINITION_METADATA]: registryDefinition,
        [ELECTROCRAFT_PUCK_CAPABILITY_DEFINITIONS_METADATA]: capabilityDefinitions,
      },
    };
  }

  return { ...config, components };
}
