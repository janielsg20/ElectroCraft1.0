import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { ThemePreference } from './design-system-foundation';

type ResolvedTheme = Exclude<ThemePreference, 'system'>;

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
}

export function ThemeProvider({ defaultTheme = 'system', children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemePreference>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(defaultTheme));

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const nextResolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
      const root = document.documentElement;

      setResolvedTheme(nextResolved);
      root.dataset.ecTheme = nextResolved;
      root.dataset.ecThemePreference = theme;
      root.dataset.ecDensity = 'high';
      root.classList.toggle('dark', nextResolved === 'dark');
    };

    applyTheme();

    if (theme !== 'system') return undefined;

    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
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
