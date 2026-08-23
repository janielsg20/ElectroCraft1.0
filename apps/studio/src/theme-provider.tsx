import { ThemeProvider } from '@electrocraft/design-system';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import {
  createBrowserStudioThemeStorage,
  loadStudioTheme,
  persistStudioTheme,
  resetStudioTheme,
  type StudioTheme,
  type StudioThemeStorage,
} from './theme';

interface StudioAppearanceContextValue {
  readonly theme: StudioTheme;
  readonly setTheme: (theme: StudioTheme) => void;
  readonly resetTheme: () => void;
}

const StudioAppearanceContext = createContext<StudioAppearanceContextValue | null>(null);

export interface StudioAppearanceProviderProps extends PropsWithChildren {
  readonly storage?: StudioThemeStorage;
}

export function StudioAppearanceProvider({ storage, children }: StudioAppearanceProviderProps) {
  const storagePort = useMemo(() => storage ?? createBrowserStudioThemeStorage(), [storage]);
  const [theme, setThemeState] = useState<StudioTheme>(() => loadStudioTheme(storagePort));

  const setTheme = useCallback(
    (nextTheme: StudioTheme) => {
      setThemeState(persistStudioTheme(storagePort, nextTheme));
    },
    [storagePort],
  );

  const resetTheme = useCallback(() => {
    setThemeState(resetStudioTheme(storagePort));
  }, [storagePort]);

  const value = useMemo<StudioAppearanceContextValue>(
    () => ({ theme, setTheme, resetTheme }),
    [resetTheme, setTheme, theme],
  );

  return (
    <StudioAppearanceContext.Provider value={value}>
      <ThemeProvider theme={theme} density="high">
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
