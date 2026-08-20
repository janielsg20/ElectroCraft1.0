import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { ThemePreference } from './design-system-foundation';

type ResolvedTheme = Exclude<ThemePreference, 'system'>;
export type RuntimeDensity = 'high' | 'comfortable';

interface ThemeContextValue {
  readonly theme: ThemePreference;
  readonly resolvedTheme: ResolvedTheme;
  readonly setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: ThemePreference): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

export interface ThemeProviderProps extends PropsWithChildren {
  readonly defaultTheme?: ThemePreference;
  readonly theme?: ThemePreference;
  readonly density?: RuntimeDensity;
}

export function ThemeProvider({
  defaultTheme = 'system',
  theme: controlledTheme,
  density = 'high',
  children,
}: ThemeProviderProps) {
  const [uncontrolledTheme, setUncontrolledTheme] = useState<ThemePreference>(defaultTheme);
  const theme = controlledTheme ?? uncontrolledTheme;
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(theme));

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const nextResolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      const root = document.documentElement;

      setResolvedTheme(nextResolved);
      root.dataset.ecTheme = nextResolved;
      root.dataset.ecThemePreference = theme;
      root.dataset.ecDensity = density;
      root.classList.toggle('dark', nextResolved === 'dark');
    };

    applyTheme();

    if (theme !== 'system') return undefined;

    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [density, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme: setUncontrolledTheme }),
    [resolvedTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
