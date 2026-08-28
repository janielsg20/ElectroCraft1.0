import * as z from 'zod';
import {
  electroCraftStyleSchema,
  type ElectroCraftStyle,
  type ElectroCraftStyleDeclaration,
} from './component-definition';
import {
  type ElectroCraftCapabilitySupportMode,
  type ElectroCraftRegistryDefinition,
  type ElectroPlatformCapabilityDefinition,
} from './theme-blueprint';

export const electroCraftEditorPlatformSchema = z.enum(['web', 'android', 'ios']);
export type ElectroCraftEditorPlatform = z.infer<typeof electroCraftEditorPlatformSchema>;

export const ELECTROCRAFT_EDITOR_PLATFORM_TARGET = Object.freeze({
  web: 'react-web',
  android: 'android-expo',
  ios: 'ios-expo',
} satisfies Readonly<Record<ElectroCraftEditorPlatform, string>>);

export type ElectroCraftPlatformStyleProperty = keyof ElectroCraftStyleDeclaration;
export type ElectroCraftPlatformValueSource =
  | Readonly<{ kind: 'responsive' }>
  | Readonly<{ kind: 'native' }>
  | Readonly<{ kind: 'platform'; platform: ElectroCraftEditorPlatform }>;

export interface ElectroCraftDeclaredPlatformCapability {
  readonly capabilityId: string;
  readonly version: number | null;
  readonly label: string;
  readonly target: string;
  readonly mode: ElectroCraftCapabilitySupportMode;
  readonly source: 'registry' | 'missing';
  readonly adapter: string | null;
  readonly reason: string | null;
}

function hasOwn<T extends object>(value: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

export function resolvePlatformStyleProperty<K extends ElectroCraftPlatformStyleProperty>(
  style: ElectroCraftStyle,
  responsiveDeclaration: ElectroCraftStyleDeclaration,
  platform: ElectroCraftEditorPlatform,
  property: K,
): Readonly<{ value: ElectroCraftStyleDeclaration[K]; source: ElectroCraftPlatformValueSource }> {
  const exact = style.platform[platform];
  if (exact && hasOwn(exact, property)) {
    return {
      value: exact[property] as ElectroCraftStyleDeclaration[K],
      source: { kind: 'platform', platform },
    };
  }

  if (platform !== 'web') {
    const native = style.platform.native;
    if (native && hasOwn(native, property)) {
      return {
        value: native[property] as ElectroCraftStyleDeclaration[K],
        source: { kind: 'native' },
      };
    }
  }

  return { value: responsiveDeclaration[property], source: { kind: 'responsive' } };
}

export function resolvePlatformStyleDeclaration(
  style: ElectroCraftStyle,
  responsiveDeclaration: ElectroCraftStyleDeclaration,
  platform: ElectroCraftEditorPlatform,
): ElectroCraftStyleDeclaration {
  const declaration = {} as ElectroCraftStyleDeclaration;
  for (const property of Object.keys(responsiveDeclaration) as ElectroCraftPlatformStyleProperty[]) {
    declaration[property] = resolvePlatformStyleProperty(style, responsiveDeclaration, platform, property).value as never;
  }
  return declaration;
}

export function setPlatformStyleOverride<K extends ElectroCraftPlatformStyleProperty>(
  style: ElectroCraftStyle,
  platform: ElectroCraftEditorPlatform,
  property: K,
  value: ElectroCraftStyleDeclaration[K],
): ElectroCraftStyle {
  return electroCraftStyleSchema.parse({
    ...style,
    platform: {
      ...style.platform,
      [platform]: {
        ...style.platform[platform],
        [property]: value,
      },
    },
  });
}

export function resetPlatformStyleOverride(
  style: ElectroCraftStyle,
  platform: ElectroCraftEditorPlatform,
  property: ElectroCraftPlatformStyleProperty,
): ElectroCraftStyle {
  const current = { ...style.platform[platform] };
  delete current[property];
  const platformOverrides = { ...style.platform };
  if (Object.keys(current).length === 0) delete platformOverrides[platform];
  else platformOverrides[platform] = current;
  return electroCraftStyleSchema.parse({ ...style, platform: platformOverrides });
}

export function resolveDeclaredPlatformCapabilities(
  registryDefinition: ElectroCraftRegistryDefinition | null,
  capabilityDefinitions: readonly ElectroPlatformCapabilityDefinition[],
  platform: ElectroCraftEditorPlatform,
): readonly ElectroCraftDeclaredPlatformCapability[] {
  if (!registryDefinition) return Object.freeze([]);
  const target = ELECTROCRAFT_EDITOR_PLATFORM_TARGET[platform];

  return Object.freeze(
    registryDefinition.capabilityRefs.map((capabilityId) => {
      const definition = capabilityDefinitions.find((candidate) => candidate.id === capabilityId);
      if (!definition) {
        return Object.freeze({
          capabilityId,
          version: null,
          label: capabilityId,
          target,
          mode: 'blocked' as const,
          source: 'missing' as const,
          adapter: null,
          reason: 'La capacidad declarada no existe en el registry cargado.',
        });
      }

      const support = definition.support.find((candidate) => candidate.target === target);
      if (!support) {
        return Object.freeze({
          capabilityId,
          version: definition.version,
          label: definition.label,
          target,
          mode: 'blocked' as const,
          source: 'registry' as const,
          adapter: null,
          reason: `La capacidad no declara soporte para ${target}.`,
        });
      }

      return Object.freeze({
        capabilityId,
        version: definition.version,
        label: definition.label,
        target,
        mode: support.mode,
        source: 'registry' as const,
        adapter: support.adapter,
        reason: support.reason,
      });
    }),
  );
}

export function summarizeDeclaredPlatformCapabilities(
  capabilities: readonly ElectroCraftDeclaredPlatformCapability[],
): ElectroCraftCapabilitySupportMode | null {
  if (capabilities.length === 0) return null;
  if (capabilities.some((capability) => capability.mode === 'blocked')) return 'blocked';
  if (capabilities.some((capability) => capability.mode === 'adapted')) return 'adapted';
  return 'supported';
}
