import {
  electroCraftPlatformSchema,
  electroCraftStyleSchema,
  type ElectroCraftStyle,
  type ElectroCraftStyleDeclaration,
} from './component-definition';

type ElectroCraftPlatform = keyof ElectroCraftStyle['platform'];

export const electroCraftStudioPlatformSchema = electroCraftPlatformSchema.exclude(['native']);
export type ElectroCraftStudioPlatform = 'web' | 'android' | 'ios';

export type ElectroCraftPlatformStyleSource = 'base' | 'native' | ElectroCraftStudioPlatform;

export interface ElectroCraftResolvedPlatformStyleProperty<K extends keyof ElectroCraftStyleDeclaration> {
  readonly property: K;
  readonly value: ElectroCraftStyleDeclaration[K];
  readonly source: ElectroCraftPlatformStyleSource;
  readonly overriddenHere: boolean;
}

function platformLayers(platform: ElectroCraftStudioPlatform): readonly ElectroCraftPlatform[] {
  const canonical = electroCraftStudioPlatformSchema.parse(platform);
  return canonical === 'web' ? ['web'] : ['native', canonical];
}

export function resolvePlatformStyleProperty<K extends keyof ElectroCraftStyleDeclaration>(
  style: ElectroCraftStyle,
  platform: ElectroCraftStudioPlatform,
  property: K,
): ElectroCraftResolvedPlatformStyleProperty<K> {
  const canonical = electroCraftStyleSchema.parse(style);
  let value = canonical.base[property];
  let source: ElectroCraftPlatformStyleSource = 'base';

  for (const layer of platformLayers(platform)) {
    const override = canonical.platform[layer];
    if (override && Object.prototype.hasOwnProperty.call(override, property)) {
      value = override[property] as ElectroCraftStyleDeclaration[K];
      source = layer;
    }
  }

  return Object.freeze({ property, value, source, overriddenHere: source === platform });
}

export function resolvePlatformStyleDeclaration(
  style: ElectroCraftStyle,
  platform: ElectroCraftStudioPlatform,
): ElectroCraftStyleDeclaration {
  const canonical = electroCraftStyleSchema.parse(style);
  return electroCraftStyleSchema.shape.base.parse(
    Object.assign({}, canonical.base, ...platformLayers(platform).map((layer) => canonical.platform[layer] ?? {})),
  );
}

export function setPlatformStyleOverride<K extends keyof ElectroCraftStyleDeclaration>(
  style: ElectroCraftStyle,
  platform: ElectroCraftStudioPlatform,
  property: K,
  value: ElectroCraftStyleDeclaration[K],
): ElectroCraftStyle {
  const canonical = electroCraftStyleSchema.parse(style);
  return electroCraftStyleSchema.parse({
    ...canonical,
    platform: {
      ...canonical.platform,
      [platform]: { ...canonical.platform[platform], [property]: value },
    },
  });
}

export function resetPlatformStyleOverride<K extends keyof ElectroCraftStyleDeclaration>(
  style: ElectroCraftStyle,
  platform: ElectroCraftStudioPlatform,
  property: K,
): ElectroCraftStyle {
  const canonical = electroCraftStyleSchema.parse(style);
  const current = canonical.platform[platform];
  if (!current || !Object.prototype.hasOwnProperty.call(current, property)) return canonical;

  const nextOverride = { ...current };
  delete nextOverride[property];
  const nextPlatform = { ...canonical.platform };
  if (Object.keys(nextOverride).length === 0) delete nextPlatform[platform];
  else nextPlatform[platform] = nextOverride;

  return electroCraftStyleSchema.parse({ ...canonical, platform: nextPlatform });
}
