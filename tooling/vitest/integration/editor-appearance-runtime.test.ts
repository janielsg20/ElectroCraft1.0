import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppearancePanelTrigger } from '../../../apps/studio/src/shell/appearance-panel';
import { StudioAppearanceProvider, useStudioAppearance } from '../../../apps/studio/src/theme-provider';
import type { StudioThemeStorage } from '../../../apps/studio/src/theme';

function ThemeProbe() {
  const { theme } = useStudioAppearance();
  return createElement('output', { 'data-studio-theme': theme });
}

function storageWithDarkTheme(): StudioThemeStorage {
  return {
    read: () => JSON.stringify('dark'),
    write: () => undefined,
    remove: () => undefined,
  };
}

describe('M03.9 Studio theme provider integration', () => {
  it('hydrates a persisted dark mode through the real provider', () => {
    const markup = renderToStaticMarkup(
      createElement(StudioAppearanceProvider, { storage: storageWithDarkTheme() }, createElement(ThemeProbe)),
    );

    expect(markup).toContain('data-studio-theme="dark"');
  });

  it('renders discoverable desktop and mobile triggers through the real Radix Sheet UI', () => {
    const markup = renderToStaticMarkup(
      createElement(
        StudioAppearanceProvider,
        { storage: storageWithDarkTheme() },
        createElement(
          'div',
          null,
          createElement(AppearancePanelTrigger, { presentation: 'topbar' }),
          createElement(AppearancePanelTrigger, { presentation: 'mobile' }),
        ),
      ),
    );

    expect(markup).toContain('data-appearance-trigger="topbar"');
    expect(markup).toContain('data-appearance-trigger="mobile"');
    expect(markup).toContain('Apariencia');
  });
});
