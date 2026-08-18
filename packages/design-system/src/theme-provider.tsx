import * as React from 'react';
import {
  defaultElectroCraftStudioAppearance,
  deserializeElectroCraftStudioAppearance,
  electroCraftStudioAppearanceSchema,
  resolveElectroCraftTheme,
  serializeElectroCraftStudioAppearance,
  type ElectroCraftStudioAppearance,
  type ElectroCraftStudioDensity,
  type ElectroCraftStudioThemeMode,
} from './appearance';

const STORAGE_KEY = 'electrocraft.studio.appearance.v1';
const DARK_QUERY = '(prefers-color-scheme: dark)';

interface StudioThemeContextValue {
  appearance: ElectroCraftStudioAppearance;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ElectroCraftStudioThemeMode) => void;
  setDensity: (density: ElectroCraftStudioDensity) => void;
}

const StudioThemeContext = React.createContext<StudioThemeContextValue | null>(null);

function readStoredAppearance(): ElectroCraftStudioAppearance {
  if (typeof window === 'undefined') return defaultElectroCraftStudioAppearance;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultElectroCraftStudioAppearance;
  try {
    return deserializeElectroCraftStudioAppearance(stored);
  } catch {
    return defaultElectroCraftStudioAppearance;
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

export function StudioThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearance, setAppearance] = React.useState<ElectroCraftStudioAppearance>(readStoredAppearance);
  const [prefersDark, setPrefersDark] = React.useState(systemPrefersDark);
  const resolvedTheme = resolveElectroCraftTheme(appearance.theme, prefersDark);

  React.useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const update = () => setPrefersDark(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = appearance.theme;
    root.dataset.density = appearance.density;
    root.style.colorScheme = resolvedTheme;
    window.localStorage.setItem(STORAGE_KEY, serializeElectroCraftStudioAppearance(appearance));
  }, [appearance, resolvedTheme]);

  const value = React.useMemo<StudioThemeContextValue>(
    () => ({
      appearance,
      resolvedTheme,
      setTheme(theme) {
        setAppearance((current) => electroCraftStudioAppearanceSchema.parse({ ...current, theme }));
      },
      setDensity(density) {
        setAppearance((current) => electroCraftStudioAppearanceSchema.parse({ ...current, density }));
      },
    }),
    [appearance, resolvedTheme],
  );

  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>;
}

export function useStudioTheme(): StudioThemeContextValue {
  const context = React.useContext(StudioThemeContext);
  if (!context) throw new Error('useStudioTheme must be used inside StudioThemeProvider');
  return context;
}
