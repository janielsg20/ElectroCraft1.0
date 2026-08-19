import { ThemeProvider } from '@electrocraft/design-system';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import {
  createBrowserEditorAppearanceStorage,
  loadEditorAppearanceProfile,
  persistEditorAppearanceProfile,
  resetEditorAppearanceProfile,
  resolveEditorAppearanceProfile,
  type EditorAppearanceProfile,
  type EditorAppearanceStorage,
} from './theme';

interface StudioAppearanceContextValue {
  readonly appliedProfile: EditorAppearanceProfile;
  readonly previewProfile: EditorAppearanceProfile | null;
  readonly resolvedProfile: EditorAppearanceProfile;
  readonly preview: (profile: EditorAppearanceProfile) => void;
  readonly apply: (profile?: EditorAppearanceProfile) => void;
  readonly revert: () => void;
  readonly reset: () => void;
}

const StudioAppearanceContext = createContext<StudioAppearanceContextValue | null>(null);

const accentTokens = Object.freeze({
  indigo: Object.freeze({ primary: 'oklch(0.52 0.22 260)', ring: 'oklch(0.62 0.19 258)' }),
  blue: Object.freeze({ primary: 'oklch(0.55 0.2 245)', ring: 'oklch(0.65 0.16 245)' }),
  emerald: Object.freeze({ primary: 'oklch(0.55 0.16 155)', ring: 'oklch(0.65 0.13 155)' }),
  amber: Object.freeze({ primary: 'oklch(0.64 0.16 75)', ring: 'oklch(0.72 0.13 75)' }),
  rose: Object.freeze({ primary: 'oklch(0.58 0.2 18)', ring: 'oklch(0.68 0.15 18)' }),
});

export interface StudioAppearanceProviderProps extends PropsWithChildren {
  readonly storage?: EditorAppearanceStorage;
}

export function StudioAppearanceProvider({ storage, children }: StudioAppearanceProviderProps) {
  const storagePort = useMemo(() => storage ?? createBrowserEditorAppearanceStorage(), [storage]);
  const [appliedProfile, setAppliedProfile] = useState<EditorAppearanceProfile>(() =>
    loadEditorAppearanceProfile(storagePort),
  );
  const [previewProfile, setPreviewProfile] = useState<EditorAppearanceProfile | null>(null);
  const resolvedProfile = resolveEditorAppearanceProfile(previewProfile, appliedProfile);

  useEffect(() => {
    const root = document.documentElement;
    const tokens = accentTokens[resolvedProfile.accent];

    root.dataset.ecAppearanceProfile = resolvedProfile.name;
    root.dataset.ecAccent = resolvedProfile.accent;
    root.dataset.ecCanvasDensity = resolvedProfile.canvasDensity;
    root.style.setProperty('--ec-studio-accent-primary', tokens.primary);
    root.style.setProperty('--ec-studio-accent-ring', tokens.ring);

    return () => {
      delete root.dataset.ecAppearanceProfile;
      delete root.dataset.ecAccent;
      delete root.dataset.ecCanvasDensity;
      root.style.removeProperty('--ec-studio-accent-primary');
      root.style.removeProperty('--ec-studio-accent-ring');
    };
  }, [resolvedProfile]);

  const value = useMemo<StudioAppearanceContextValue>(
    () => ({
      appliedProfile,
      previewProfile,
      resolvedProfile,
      preview: setPreviewProfile,
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
    }),
    [appliedProfile, previewProfile, resolvedProfile, storagePort],
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
