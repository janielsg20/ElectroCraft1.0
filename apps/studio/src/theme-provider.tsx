import { ThemeProvider } from '@electrocraft/design-system';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { MARKET_STUDIO_APPEARANCE_PRESETS } from './market-appearance-presets';
import './shell/appearance-market.css';
import {
  BUILT_IN_STUDIO_APPEARANCE_PRESETS,
  createBrowserEditorAppearanceStorage,
  createBrowserStudioAppearancePresetStorage,
  createPersonalStudioAppearancePreset,
  getStudioAppearanceAccessibilityWarnings,
  loadEditorAppearanceProfile,
  loadPersonalStudioAppearancePresets,
  persistEditorAppearanceProfile,
  persistPersonalStudioAppearancePresets,
  resetEditorAppearanceProfile,
  resolveEditorAppearanceProfile,
  resolveStudioAnimationIntensity,
  restoreAccessibleEditorAppearanceDefaults,
  type EditorAppearanceStorage,
  type StudioAppearancePreset,
  type StudioAppearancePresetStorage,
  type StudioAppearanceProfile,
} from './theme';

interface StudioAppearanceContextValue {
  readonly appliedProfile: StudioAppearanceProfile;
  readonly previewProfile: StudioAppearanceProfile | null;
  readonly resolvedProfile: StudioAppearanceProfile;
  readonly personalPresets: readonly StudioAppearancePreset[];
  readonly presets: readonly StudioAppearancePreset[];
  readonly accessibilityWarnings: readonly string[];
  readonly systemReducedMotion: boolean;
  readonly resolvedAnimationIntensity: StudioAppearanceProfile['animationIntensity'];
  readonly preview: (profile: StudioAppearanceProfile) => void;
  readonly previewPreset: (presetId: string) => void;
  readonly apply: (profile?: StudioAppearanceProfile) => void;
  readonly revert: () => void;
  readonly reset: () => void;
  readonly restoreAccessibleDefaults: () => void;
  readonly savePersonalPreset: () => StudioAppearancePreset;
}

const StudioAppearanceContext = createContext<StudioAppearanceContextValue | null>(null);

const appearanceDatasetKeys = [
  'ecAppearanceProfile',
  'ecFramework',
  'ecAccent',
  'ecSemanticColors',
  'ecTypographyFamily',
  'ecTypographyScale',
  'ecIconSize',
  'ecIconStyle',
  'ecRadii',
  'ecElevation',
  'ecControlSize',
  'ecButtonShape',
  'ecFieldShape',
  'ecMenuAppearance',
  'ecSpacingScale',
  'ecCanvasDensity',
  'ecMotion',
  'ecContrast',
  'ecSystemReducedMotion',
] as const;

export interface StudioAppearanceProviderProps extends PropsWithChildren {
  readonly storage?: EditorAppearanceStorage;
  readonly presetStorage?: StudioAppearancePresetStorage;
}

export function StudioAppearanceProvider({ storage, presetStorage, children }: StudioAppearanceProviderProps) {
  const storagePort = useMemo(() => storage ?? createBrowserEditorAppearanceStorage(), [storage]);
  const presetStoragePort = useMemo(
    () => presetStorage ?? createBrowserStudioAppearancePresetStorage(),
    [presetStorage],
  );
  const [appliedProfile, setAppliedProfile] = useState<StudioAppearanceProfile>(() =>
    loadEditorAppearanceProfile(storagePort),
  );
  const [previewProfile, setPreviewProfile] = useState<StudioAppearanceProfile | null>(null);
  const [personalPresets, setPersonalPresets] = useState<readonly StudioAppearancePreset[]>(() =>
    loadPersonalStudioAppearancePresets(presetStoragePort),
  );
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const resolvedProfile = resolveEditorAppearanceProfile(previewProfile, appliedProfile);
  const resolvedAnimationIntensity = resolveStudioAnimationIntensity(
    resolvedProfile.animationIntensity,
    systemReducedMotion,
  );
  const presets = useMemo(
    () =>
      Object.freeze([
        ...BUILT_IN_STUDIO_APPEARANCE_PRESETS,
        ...MARKET_STUDIO_APPEARANCE_PRESETS,
        ...personalPresets,
      ]),
    [personalPresets],
  );
  const accessibilityWarnings = useMemo(
    () => getStudioAppearanceAccessibilityWarnings(resolvedProfile),
    [resolvedProfile],
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ecAppearanceProfile = resolvedProfile.name;
    root.dataset.ecFramework = resolvedProfile.framework;
    root.dataset.ecAccent = resolvedProfile.accent;
    root.dataset.ecSemanticColors = resolvedProfile.semanticColors;
    root.dataset.ecTypographyFamily = resolvedProfile.typographyFamily;
    root.dataset.ecTypographyScale = resolvedProfile.typographyScale;
    root.dataset.ecIconSize = resolvedProfile.iconSize;
    root.dataset.ecIconStyle = resolvedProfile.iconStyle;
    root.dataset.ecRadii = resolvedProfile.radii;
    root.dataset.ecElevation = resolvedProfile.elevation;
    root.dataset.ecControlSize = resolvedProfile.controlSize;
    root.dataset.ecButtonShape = resolvedProfile.buttonShape;
    root.dataset.ecFieldShape = resolvedProfile.fieldShape;
    root.dataset.ecMenuAppearance = resolvedProfile.menuAppearance;
    root.dataset.ecSpacingScale = resolvedProfile.spacingScale;
    root.dataset.ecCanvasDensity = resolvedProfile.canvasDensity;
    root.dataset.ecMotion = resolvedAnimationIntensity;
    root.dataset.ecContrast = resolvedProfile.contrastPreference;
    root.dataset.ecSystemReducedMotion = systemReducedMotion ? 'true' : 'false';

    return () => {
      for (const key of appearanceDatasetKeys) delete root.dataset[key];
    };
  }, [resolvedAnimationIntensity, resolvedProfile, systemReducedMotion]);

  const value = useMemo<StudioAppearanceContextValue>(
    () => ({
      appliedProfile,
      previewProfile,
      resolvedProfile,
      personalPresets,
      presets,
      accessibilityWarnings,
      systemReducedMotion,
      resolvedAnimationIntensity,
      preview: setPreviewProfile,
      previewPreset: (presetId) => {
        const preset = presets.find((candidate) => candidate.id === presetId);
        if (preset) setPreviewProfile(preset.profile);
      },
      apply: (profile = previewProfile ?? appliedProfile) => {
        const persisted = persistEditorAppearanceProfile(storagePort, profile);
        setAppliedProfile(persisted);
        setPreviewProfile(null);
      },
      revert: () => setPreviewProfile(null),
      reset: () => {
        const resetProfile = resetEditorAppearanceProfile(previewProfile ?? appliedProfile);
        const persisted = persistEditorAppearanceProfile(storagePort, resetProfile);
        setAppliedProfile(persisted);
        setPreviewProfile(null);
      },
      restoreAccessibleDefaults: () => {
        setPreviewProfile(restoreAccessibleEditorAppearanceDefaults(previewProfile ?? appliedProfile));
      },
      savePersonalPreset: () => {
        const preset = createPersonalStudioAppearancePreset(
          resolvedProfile,
          `${Date.now()}-${personalPresets.length + 1}`,
        );
        const next = persistPersonalStudioAppearancePresets(presetStoragePort, [...personalPresets, preset]);
        setPersonalPresets(next);
        return preset;
      },
    }),
    [
      accessibilityWarnings,
      appliedProfile,
      personalPresets,
      presetStoragePort,
      presets,
      previewProfile,
      resolvedAnimationIntensity,
      resolvedProfile,
      storagePort,
      systemReducedMotion,
    ],
  );

  return (
    <StudioAppearanceContext.Provider value={value}>
      <ThemeProvider theme={resolvedProfile.tone} density={resolvedProfile.density}>
        {children}
      </ThemeProvider>
    </StudioAppearanceContext.Provider>
  );
}

export function useOptionalStudioAppearance() {
  return useContext(StudioAppearanceContext);
}

export function useStudioAppearance() {
  const context = useOptionalStudioAppearance();
  if (!context) throw new Error('useStudioAppearance must be used inside StudioAppearanceProvider');
  return context;
}
