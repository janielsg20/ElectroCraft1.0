import type { ThemePreference } from '@electrocraft/design-system';
import type { FrameworkThemeId } from '@electrocraft/design-system/framework-themes';

export const EDITOR_APPEARANCE_STORAGE_KEY = 'electrocraft.studio.appearance.v1' as const;
export const STUDIO_APPEARANCE_PRESETS_STORAGE_KEY = 'electrocraft.studio.appearance-presets.v1' as const;
export const DEFAULT_STUDIO_PRODUCT_DESIGN = 'custom' as const;

export type StudioAppearanceTone = ThemePreference;
export type StudioAppearanceAccent = 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose';
export type StudioSemanticColors = 'balanced' | 'muted' | 'vivid';
export type StudioTypographyFamily = 'system' | 'humanist' | 'geometric' | 'mono';
export type StudioTypographyScale = 'compact' | 'standard' | 'large';
export type StudioIconSize = 'compact' | 'standard' | 'large';
export type StudioIconStyle = 'outline' | 'strong';
export type StudioRadii = 'square' | 'subtle' | 'rounded';
export type StudioElevation = 'flat' | 'subtle' | 'raised';
export type StudioAppearanceDensity = 'high' | 'comfortable';
export type StudioControlSize = 'compact' | 'standard' | 'large';
export type StudioButtonShape = 'square' | 'rounded' | 'pill';
export type StudioFieldShape = 'square' | 'rounded';
export type StudioMenuAppearance = 'solid' | 'soft' | 'glass';
export type StudioSpacingScale = 'compact' | 'standard' | 'spacious';
export type StudioCanvasDensity = 'compact' | 'comfortable' | 'spacious';
export type StudioAnimationIntensity = 'none' | 'reduced' | 'standard' | 'high';
export type StudioContrastPreference = 'standard' | 'high';
export type StudioThemeFramework = FrameworkThemeId;
export type StudioProductDesignId =
  | typeof DEFAULT_STUDIO_PRODUCT_DESIGN
  | 'market:studio-carbon'
  | 'market:canvas-atelier'
  | 'market:cms-editorial'
  | 'market:commerce-desk'
  | 'market:data-command'
  | 'market:linear-neutral'
  | 'market:aurora-glass'
  | 'market:neo-builder'
  | 'market:soft-graphite'
  | 'market:zen-canvas';

export interface StudioAppearanceProfile {
  readonly name: string;
  readonly productDesign?: StudioProductDesignId;
  readonly framework: StudioThemeFramework;
  readonly tone: StudioAppearanceTone;
  readonly accent: StudioAppearanceAccent;
  readonly semanticColors: StudioSemanticColors;
  readonly typographyFamily: StudioTypographyFamily;
  readonly typographyScale: StudioTypographyScale;
  readonly iconSize: StudioIconSize;
  readonly iconStyle: StudioIconStyle;
  readonly radii: StudioRadii;
  readonly elevation: StudioElevation;
  readonly density: StudioAppearanceDensity;
  readonly controlSize: StudioControlSize;
  readonly buttonShape: StudioButtonShape;
  readonly fieldShape: StudioFieldShape;
  readonly menuAppearance: StudioMenuAppearance;
  readonly spacingScale: StudioSpacingScale;
  readonly canvasDensity: StudioCanvasDensity;
  readonly animationIntensity: StudioAnimationIntensity;
  readonly contrastPreference: StudioContrastPreference;
}

// Backward-compatible aliases retained for the first M03.9 implementation and tests.
export type EditorAppearanceProfile = StudioAppearanceProfile;
export type EditorAppearanceTone = StudioAppearanceTone;
export type EditorAppearanceAccent = StudioAppearanceAccent;
export type EditorAppearanceDensity = StudioAppearanceDensity;
export type EditorCanvasDensity = StudioCanvasDensity;

export interface EditorAppearanceStorage {
  readonly read: () => string | null;
  readonly write: (serialized: string) => void;
  readonly remove: () => void;
}

export interface StudioAppearancePresetStorage {
  readonly read: () => string | null;
  readonly write: (serialized: string) => void;
}

export interface StudioAppearancePreset {
  readonly id: string;
  readonly label: string;
  readonly kind: 'built-in' | 'personal';
  readonly framework: StudioThemeFramework;
  readonly description: string;
  readonly profile: StudioAppearanceProfile;
}

export const DEFAULT_EDITOR_APPEARANCE_PROFILE: StudioAppearanceProfile = Object.freeze({
  name: 'ElectroCraft',
  productDesign: DEFAULT_STUDIO_PRODUCT_DESIGN,
  framework: 'electrocraft',
  tone: 'system',
  accent: 'indigo',
  semanticColors: 'balanced',
  typographyFamily: 'system',
  typographyScale: 'standard',
  iconSize: 'standard',
  iconStyle: 'outline',
  radii: 'subtle',
  elevation: 'subtle',
  density: 'high',
  controlSize: 'standard',
  buttonShape: 'rounded',
  fieldShape: 'rounded',
  menuAppearance: 'solid',
  spacingScale: 'compact',
  canvasDensity: 'comfortable',
  animationIntensity: 'standard',
  contrastPreference: 'standard',
});

export const ACCESSIBLE_EDITOR_APPEARANCE_DEFAULTS: StudioAppearanceProfile = Object.freeze({
  ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
  typographyScale: 'standard',
  iconSize: 'standard',
  density: 'high',
  controlSize: 'standard',
  spacingScale: 'compact',
  animationIntensity: 'reduced',
  contrastPreference: 'high',
});

const tones = new Set<StudioAppearanceTone>(['light', 'dark', 'system']);
const accents = new Set<StudioAppearanceAccent>(['indigo', 'blue', 'emerald', 'amber', 'rose']);
const semanticColors = new Set<StudioSemanticColors>(['balanced', 'muted', 'vivid']);
const typographyFamilies = new Set<StudioTypographyFamily>(['system', 'humanist', 'geometric', 'mono']);
const typographyScales = new Set<StudioTypographyScale>(['compact', 'standard', 'large']);
const iconSizes = new Set<StudioIconSize>(['compact', 'standard', 'large']);
const iconStyles = new Set<StudioIconStyle>(['outline', 'strong']);
const radii = new Set<StudioRadii>(['square', 'subtle', 'rounded']);
const elevations = new Set<StudioElevation>(['flat', 'subtle', 'raised']);
const densities = new Set<StudioAppearanceDensity>(['high', 'comfortable']);
const controlSizes = new Set<StudioControlSize>(['compact', 'standard', 'large']);
const buttonShapes = new Set<StudioButtonShape>(['square', 'rounded', 'pill']);
const fieldShapes = new Set<StudioFieldShape>(['square', 'rounded']);
const menuAppearances = new Set<StudioMenuAppearance>(['solid', 'soft', 'glass']);
const spacingScales = new Set<StudioSpacingScale>(['compact', 'standard', 'spacious']);
const canvasDensities = new Set<StudioCanvasDensity>(['compact', 'comfortable', 'spacious']);
const animationIntensities = new Set<StudioAnimationIntensity>(['none', 'reduced', 'standard', 'high']);
const contrastPreferences = new Set<StudioContrastPreference>(['standard', 'high']);
const productDesigns = new Set<StudioProductDesignId>([
  DEFAULT_STUDIO_PRODUCT_DESIGN,
  'market:studio-carbon',
  'market:canvas-atelier',
  'market:cms-editorial',
  'market:commerce-desk',
  'market:data-command',
  'market:linear-neutral',
  'market:aurora-glass',
  'market:neo-builder',
  'market:soft-graphite',
  'market:zen-canvas',
]);
const themeFrameworks = new Set<StudioThemeFramework>([
  'electrocraft',
  'aceternity-magic',
  'daisyui',
  'headlessui',
  'ark-base',
  'heroui',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizedName(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 48) : fallback;
}

function normalizedString<Value extends string>(value: unknown, values: ReadonlySet<Value>, fallback: Value): Value {
  return values.has(value as Value) ? (value as Value) : fallback;
}

export function normalizeEditorAppearanceProfile(value: unknown): StudioAppearanceProfile {
  if (!isRecord(value)) return DEFAULT_EDITOR_APPEARANCE_PROFILE;

  return Object.freeze({
    name: normalizedName(value.name, DEFAULT_EDITOR_APPEARANCE_PROFILE.name),
    productDesign: normalizedString(value.productDesign, productDesigns, DEFAULT_STUDIO_PRODUCT_DESIGN),
    framework: normalizedString(value.framework, themeFrameworks, DEFAULT_EDITOR_APPEARANCE_PROFILE.framework),
    tone: normalizedString(value.tone, tones, DEFAULT_EDITOR_APPEARANCE_PROFILE.tone),
    accent: normalizedString(value.accent, accents, DEFAULT_EDITOR_APPEARANCE_PROFILE.accent),
    semanticColors: normalizedString(
      value.semanticColors,
      semanticColors,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.semanticColors,
    ),
    typographyFamily: normalizedString(
      value.typographyFamily,
      typographyFamilies,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.typographyFamily,
    ),
    typographyScale: normalizedString(
      value.typographyScale,
      typographyScales,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.typographyScale,
    ),
    iconSize: normalizedString(value.iconSize, iconSizes, DEFAULT_EDITOR_APPEARANCE_PROFILE.iconSize),
    iconStyle: normalizedString(value.iconStyle, iconStyles, DEFAULT_EDITOR_APPEARANCE_PROFILE.iconStyle),
    radii: normalizedString(value.radii, radii, DEFAULT_EDITOR_APPEARANCE_PROFILE.radii),
    elevation: normalizedString(value.elevation, elevations, DEFAULT_EDITOR_APPEARANCE_PROFILE.elevation),
    density: normalizedString(value.density, densities, DEFAULT_EDITOR_APPEARANCE_PROFILE.density),
    controlSize: normalizedString(value.controlSize, controlSizes, DEFAULT_EDITOR_APPEARANCE_PROFILE.controlSize),
    buttonShape: normalizedString(value.buttonShape, buttonShapes, DEFAULT_EDITOR_APPEARANCE_PROFILE.buttonShape),
    fieldShape: normalizedString(value.fieldShape, fieldShapes, DEFAULT_EDITOR_APPEARANCE_PROFILE.fieldShape),
    menuAppearance: normalizedString(
      value.menuAppearance,
      menuAppearances,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.menuAppearance,
    ),
    spacingScale: normalizedString(value.spacingScale, spacingScales, DEFAULT_EDITOR_APPEARANCE_PROFILE.spacingScale),
    canvasDensity: normalizedString(
      value.canvasDensity,
      canvasDensities,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.canvasDensity,
    ),
    animationIntensity: normalizedString(
      value.animationIntensity,
      animationIntensities,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.animationIntensity,
    ),
    contrastPreference: normalizedString(
      value.contrastPreference,
      contrastPreferences,
      DEFAULT_EDITOR_APPEARANCE_PROFILE.contrastPreference,
    ),
  });
}

export function serializeEditorAppearanceProfile(profile: StudioAppearanceProfile) {
  return JSON.stringify(normalizeEditorAppearanceProfile(profile));
}

export function deserializeEditorAppearanceProfile(serialized: string): StudioAppearanceProfile {
  try {
    return normalizeEditorAppearanceProfile(JSON.parse(serialized) as unknown);
  } catch {
    return DEFAULT_EDITOR_APPEARANCE_PROFILE;
  }
}

export function createBrowserEditorAppearanceStorage(): EditorAppearanceStorage {
  return Object.freeze({
    read: () => {
      try {
        return window.localStorage.getItem(EDITOR_APPEARANCE_STORAGE_KEY);
      } catch {
        return null;
      }
    },
    write: (serialized: string) => {
      try {
        window.localStorage.setItem(EDITOR_APPEARANCE_STORAGE_KEY, serialized);
      } catch {
        // Storage is an optional adapter. Runtime appearance remains usable in memory.
      }
    },
    remove: () => {
      try {
        window.localStorage.removeItem(EDITOR_APPEARANCE_STORAGE_KEY);
      } catch {
        // Reset still succeeds in memory when storage is unavailable.
      }
    },
  });
}

export function createBrowserStudioAppearancePresetStorage(): StudioAppearancePresetStorage {
  return Object.freeze({
    read: () => {
      try {
        return window.localStorage.getItem(STUDIO_APPEARANCE_PRESETS_STORAGE_KEY);
      } catch {
        return null;
      }
    },
    write: (serialized: string) => {
      try {
        window.localStorage.setItem(STUDIO_APPEARANCE_PRESETS_STORAGE_KEY, serialized);
      } catch {
        // Presets are optional workspace preferences; failure is recoverable.
      }
    },
  });
}

export function loadEditorAppearanceProfile(storage: EditorAppearanceStorage): StudioAppearanceProfile {
  try {
    const serialized = storage.read();
    return serialized ? deserializeEditorAppearanceProfile(serialized) : DEFAULT_EDITOR_APPEARANCE_PROFILE;
  } catch {
    return DEFAULT_EDITOR_APPEARANCE_PROFILE;
  }
}

export function persistEditorAppearanceProfile(storage: EditorAppearanceStorage, profile: StudioAppearanceProfile) {
  const normalized = normalizeEditorAppearanceProfile(profile);
  try {
    storage.write(serializeEditorAppearanceProfile(normalized));
  } catch {
    // Persistence failure must never block the Studio session.
  }
  return normalized;
}

export function resetEditorAppearanceProfile(current: StudioAppearanceProfile): StudioAppearanceProfile {
  return Object.freeze({
    ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
    name: normalizedName(current.name, DEFAULT_EDITOR_APPEARANCE_PROFILE.name),
  });
}

export function restoreAccessibleEditorAppearanceDefaults(current: StudioAppearanceProfile): StudioAppearanceProfile {
  return Object.freeze({
    ...ACCESSIBLE_EDITOR_APPEARANCE_DEFAULTS,
    name: normalizedName(current.name, ACCESSIBLE_EDITOR_APPEARANCE_DEFAULTS.name),
  });
}

export function resolveEditorAppearanceProfile(
  preview: StudioAppearanceProfile | null,
  applied: StudioAppearanceProfile | null,
): StudioAppearanceProfile {
  return preview ?? applied ?? DEFAULT_EDITOR_APPEARANCE_PROFILE;
}

export function resolveStudioAnimationIntensity(
  requested: StudioAnimationIntensity,
  systemReducedMotion: boolean,
): StudioAnimationIntensity {
  if (!systemReducedMotion) return requested;
  return requested === 'none' ? 'none' : 'reduced';
}

export function getStudioAppearanceAccessibilityWarnings(profile: StudioAppearanceProfile): readonly string[] {
  const warnings: string[] = [];

  if (profile.semanticColors === 'muted' && profile.contrastPreference === 'standard') {
    warnings.push('Los colores semánticos atenuados requieren contraste alto para mantener legibilidad consistente.');
  }

  if (profile.typographyScale === 'compact' && profile.controlSize === 'compact' && profile.density === 'high') {
    warnings.push('Tipografía y controles compactos simultáneos reducen la legibilidad en densidad alta.');
  }

  return Object.freeze(warnings);
}

export const BUILT_IN_STUDIO_APPEARANCE_PRESETS: readonly StudioAppearancePreset[] = Object.freeze([
  Object.freeze({
    id: 'built-in:electrocraft',
    label: 'ElectroCraft',
    kind: 'built-in' as const,
    framework: 'electrocraft' as const,
    description: 'shadcn/ui + Radix · compacto, técnico y equilibrado.',
    profile: DEFAULT_EDITOR_APPEARANCE_PROFILE,
  }),
  Object.freeze({
    id: 'built-in:focus',
    label: 'Enfoque',
    kind: 'built-in' as const,
    framework: 'electrocraft' as const,
    description: 'shadcn/ui + Radix · menor movimiento y máximo foco.',
    profile: Object.freeze({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Enfoque',
      semanticColors: 'muted',
      contrastPreference: 'high',
      elevation: 'flat',
      animationIntensity: 'reduced',
    }),
  }),
  Object.freeze({
    id: 'built-in:accessible',
    label: 'Accesible',
    kind: 'built-in' as const,
    framework: 'electrocraft' as const,
    description: 'shadcn/ui + Radix · contraste alto y movimiento reducido.',
    profile: Object.freeze({ ...ACCESSIBLE_EDITOR_APPEARANCE_DEFAULTS, name: 'Accesible' }),
  }),
  Object.freeze({
    id: 'built-in:aceternity-magic',
    label: 'Aurora Motion',
    kind: 'built-in' as const,
    framework: 'aceternity-magic' as const,
    description: 'Aceternity UI + Magic UI · profundidad oscura, luz ambiental y motion.',
    profile: Object.freeze({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Aurora Motion',
      framework: 'aceternity-magic',
      tone: 'dark',
      semanticColors: 'vivid',
      typographyFamily: 'geometric',
      radii: 'rounded',
      elevation: 'raised',
      controlSize: 'compact',
      menuAppearance: 'glass',
      canvasDensity: 'compact',
      animationIntensity: 'high',
      contrastPreference: 'high',
    }),
  }),
  Object.freeze({
    id: 'built-in:daisyui',
    label: 'Daisy Pop',
    kind: 'built-in' as const,
    framework: 'daisyui' as const,
    description: 'daisyUI · componentes expresivos, color semántico y formas amigables.',
    profile: Object.freeze({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Daisy Pop',
      framework: 'daisyui',
      accent: 'emerald',
      semanticColors: 'vivid',
      typographyFamily: 'humanist',
      iconStyle: 'strong',
      radii: 'rounded',
      elevation: 'raised',
      controlSize: 'compact',
      buttonShape: 'pill',
      menuAppearance: 'soft',
    }),
  }),
  Object.freeze({
    id: 'built-in:headlessui',
    label: 'Headless Precision',
    kind: 'built-in' as const,
    framework: 'headlessui' as const,
    description: 'Headless UI · minimalista, neutral y optimizado para teclado.',
    profile: Object.freeze({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Headless Precision',
      framework: 'headlessui',
      accent: 'blue',
      semanticColors: 'balanced',
      radii: 'subtle',
      elevation: 'flat',
      controlSize: 'compact',
      buttonShape: 'square',
      fieldShape: 'square',
      animationIntensity: 'reduced',
      contrastPreference: 'high',
    }),
  }),
  Object.freeze({
    id: 'built-in:ark-base',
    label: 'Ark Base Modular',
    kind: 'built-in' as const,
    framework: 'ark-base' as const,
    description: 'Ark UI + Base UI · composición headless modular y geometría precisa.',
    profile: Object.freeze({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Ark Base Modular',
      framework: 'ark-base',
      accent: 'amber',
      typographyFamily: 'mono',
      typographyScale: 'compact',
      radii: 'square',
      elevation: 'flat',
      controlSize: 'compact',
      buttonShape: 'square',
      fieldShape: 'square',
      animationIntensity: 'reduced',
      contrastPreference: 'high',
    }),
  }),
  Object.freeze({
    id: 'built-in:heroui',
    label: 'Hero / Next Modern',
    kind: 'built-in' as const,
    framework: 'heroui' as const,
    description: 'HeroUI (antes NextUI) · superficies suaves, glass y acciones premium.',
    profile: Object.freeze({
      ...DEFAULT_EDITOR_APPEARANCE_PROFILE,
      name: 'Hero / Next Modern',
      framework: 'heroui',
      accent: 'rose',
      semanticColors: 'vivid',
      typographyFamily: 'geometric',
      radii: 'rounded',
      elevation: 'raised',
      controlSize: 'compact',
      buttonShape: 'pill',
      fieldShape: 'rounded',
      menuAppearance: 'glass',
      animationIntensity: 'standard',
      contrastPreference: 'high',
    }),
  }),
]);

function normalizePersonalPreset(value: unknown): StudioAppearancePreset | null {
  if (!isRecord(value) || typeof value.id !== 'string' || value.id.length === 0) return null;
  const profile = normalizeEditorAppearanceProfile(value.profile);
  return Object.freeze({
    id: value.id.slice(0, 96),
    label: normalizedName(value.label, profile.name),
    kind: 'personal' as const,
    framework: profile.framework,
    description: `Preset personal · ${profile.framework}.`,
    profile,
  });
}

export function deserializePersonalStudioAppearancePresets(serialized: string): readonly StudioAppearancePreset[] {
  try {
    const parsed = JSON.parse(serialized) as unknown;
    if (!Array.isArray(parsed)) return Object.freeze([]);
    return Object.freeze(
      parsed.map(normalizePersonalPreset).filter((preset): preset is StudioAppearancePreset => preset !== null),
    );
  } catch {
    return Object.freeze([]);
  }
}

export function loadPersonalStudioAppearancePresets(
  storage: StudioAppearancePresetStorage,
): readonly StudioAppearancePreset[] {
  try {
    const serialized = storage.read();
    return serialized ? deserializePersonalStudioAppearancePresets(serialized) : Object.freeze([]);
  } catch {
    return Object.freeze([]);
  }
}

export function persistPersonalStudioAppearancePresets(
  storage: StudioAppearancePresetStorage,
  presets: readonly StudioAppearancePreset[],
): readonly StudioAppearancePreset[] {
  const normalized = Object.freeze(
    presets.map(normalizePersonalPreset).filter((preset): preset is StudioAppearancePreset => preset !== null),
  );
  try {
    storage.write(JSON.stringify(normalized));
  } catch {
    // Preset persistence is recoverable and must not block the editor session.
  }
  return normalized;
}

export function createPersonalStudioAppearancePreset(
  profile: StudioAppearanceProfile,
  id: string,
): StudioAppearancePreset {
  const normalized = normalizeEditorAppearanceProfile(profile);
  return Object.freeze({
    id: `personal:${id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 72) || 'preset'}`,
    label: normalized.name,
    kind: 'personal',
    framework: normalized.framework,
    description: `Preset personal · ${normalized.framework}.`,
    profile: normalized,
  });
}
