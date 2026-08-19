export const DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION = 1 as const;

export type ThemePreference = 'light' | 'dark' | 'system';
export type DesignSystemDensity = 'high';
export type DesignSystemPrimitiveBase = 'radix';
export type DesignSystemIconLibrary = 'lucide';

export interface DesignSystemFoundationConfigV1 {
  readonly schemaVersion: typeof DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION;
  readonly primitiveBase: DesignSystemPrimitiveBase;
  readonly iconLibrary: DesignSystemIconLibrary;
  readonly theme: ThemePreference;
  readonly density: DesignSystemDensity;
}

interface LegacyDesignSystemFoundationConfigV0 {
  readonly schemaVersion: 0;
  readonly primitiveBase: DesignSystemPrimitiveBase;
  readonly iconLibrary: DesignSystemIconLibrary;
  readonly themeMode: ThemePreference;
  readonly density: DesignSystemDensity;
}

export const defaultDesignSystemFoundationConfig: DesignSystemFoundationConfigV1 = Object.freeze({
  schemaVersion: DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION,
  primitiveBase: 'radix',
  iconLibrary: 'lucide',
  theme: 'system',
  density: 'high',
});

export class DesignSystemFoundationConfigError extends Error {
  readonly code = 'ELECTROCRAFT_DESIGN_SYSTEM_FOUNDATION_INVALID';

  constructor(message: string) {
    super(message);
    this.name = 'DesignSystemFoundationConfigError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function isDesignSystemFoundationConfigV1(value: unknown): value is DesignSystemFoundationConfigV1 {
  if (!isRecord(value)) return false;

  return (
    value.schemaVersion === DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION &&
    value.primitiveBase === 'radix' &&
    value.iconLibrary === 'lucide' &&
    isThemePreference(value.theme) &&
    value.density === 'high'
  );
}

function isLegacyDesignSystemFoundationConfigV0(value: unknown): value is LegacyDesignSystemFoundationConfigV0 {
  if (!isRecord(value)) return false;

  return (
    value.schemaVersion === 0 &&
    value.primitiveBase === 'radix' &&
    value.iconLibrary === 'lucide' &&
    isThemePreference(value.themeMode) &&
    value.density === 'high'
  );
}

export function migrateDesignSystemFoundationConfig(value: unknown): DesignSystemFoundationConfigV1 {
  if (isDesignSystemFoundationConfigV1(value)) {
    return Object.freeze({
      schemaVersion: DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION,
      primitiveBase: value.primitiveBase,
      iconLibrary: value.iconLibrary,
      theme: value.theme,
      density: value.density,
    });
  }

  if (isLegacyDesignSystemFoundationConfigV0(value)) {
    return Object.freeze({
      schemaVersion: DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION,
      primitiveBase: value.primitiveBase,
      iconLibrary: value.iconLibrary,
      theme: value.themeMode,
      density: value.density,
    });
  }

  const version = isRecord(value) ? value.schemaVersion : undefined;
  if (typeof version === 'number' && version > DESIGN_SYSTEM_FOUNDATION_SCHEMA_VERSION) {
    throw new DesignSystemFoundationConfigError(`Unsupported design-system schemaVersion: ${version}`);
  }

  throw new DesignSystemFoundationConfigError('Invalid ElectroCraft design-system foundation config');
}

export function serializeDesignSystemFoundationConfig(config: DesignSystemFoundationConfigV1): string {
  const validated = migrateDesignSystemFoundationConfig(config);

  return JSON.stringify({
    schemaVersion: validated.schemaVersion,
    primitiveBase: validated.primitiveBase,
    iconLibrary: validated.iconLibrary,
    theme: validated.theme,
    density: validated.density,
  });
}

export function deserializeDesignSystemFoundationConfig(serialized: string): DesignSystemFoundationConfigV1 {
  let decoded: unknown;

  try {
    decoded = JSON.parse(serialized);
  } catch {
    throw new DesignSystemFoundationConfigError('Design-system config is not valid JSON');
  }

  return migrateDesignSystemFoundationConfig(decoded);
}
