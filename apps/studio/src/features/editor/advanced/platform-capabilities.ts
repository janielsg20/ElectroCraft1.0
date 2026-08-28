import {
  createDeterministicObjectId,
  electroCraftRegistryDefinitionSchema,
  electroPlatformCapabilityDefinitionSchema,
  type ElectroCraftComponentDefinition,
  type ElectroCraftRegistryDefinition,
  type ElectroPlatformCapabilityDefinition,
} from '@electrocraft/domain';

export const studioEditorPlatformCapabilities = Object.freeze([
  electroPlatformCapabilityDefinitionSchema.parse({
    schemaVersion: 1,
    id: 'editor.platform-overrides',
    version: 1,
    label: 'Estilo por plataforma',
    support: [
      {
        target: 'react-web',
        mode: 'supported',
        adapter: null,
        reason: null,
      },
      {
        target: 'android-expo',
        mode: 'adapted',
        adapter: 'react-native-style',
        reason: 'ElectroCraft adapta la declaración portable a estilos React Native.',
      },
      {
        target: 'ios-expo',
        mode: 'adapted',
        adapter: 'react-native-style',
        reason: 'ElectroCraft adapta la declaración portable a estilos React Native.',
      },
    ],
    metadata: { owner: 'editor-puck', phase: 'M06.3' },
  }),
] satisfies readonly ElectroPlatformCapabilityDefinition[]);

export function createStudioEditorPlatformRegistry(
  definitions: readonly ElectroCraftComponentDefinition[],
): readonly ElectroCraftRegistryDefinition[] {
  return Object.freeze(
    definitions.map((definition) =>
      electroCraftRegistryDefinitionSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('registry', `studio-component:${definition.key}`),
        version: definition.version,
        kind: 'component',
        key: definition.key,
        label: definition.label,
        origin: 'core',
        capabilityRefs: ['editor.platform-overrides'],
        metadata: { owner: 'studio-core-editor' },
      }),
    ),
  );
}
