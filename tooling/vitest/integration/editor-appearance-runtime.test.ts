import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppearancePanelTrigger } from '../../../apps/studio/src/shell/appearance-panel';
import {
  StudioAppearanceProvider,
  useStudioAppearance,
} from '../../../apps/studio/src/theme-provider';
import type { EditorAppearanceStorage } from '../../../apps/studio/src/theme';

function ProfileProbe() {
  const { appliedProfile, resolvedProfile } = useStudioAppearance();
  return createElement('output', {
    'data-applied-profile': appliedProfile.name,
    'data-resolved-tone': resolvedProfile.tone,
    'data-resolved-accent': resolvedProfile.accent,
    'data-resolved-density': resolvedProfile.density,
    'data-resolved-canvas-density': resolvedProfile.canvasDensity,
  });
}

function storageWithProfile(): EditorAppearanceStorage {
  const serialized = JSON.stringify({
    name: 'Persistido',
    tone: 'dark',
    accent: 'emerald',
    density: 'comfortable',
    canvasDensity: 'compact',
  });
  return {
    read: () => serialized,
    write: () => undefined,
    remove: () => undefined,
  };
}

describe('M03.9 appearance provider integration', () => {
  it('hydrates a persisted editor-session profile through the real provider', () => {
    const markup = renderToStaticMarkup(
      createElement(StudioAppearanceProvider, { storage: storageWithProfile() }, createElement(ProfileProbe)),
    );

    expect(markup).toContain('data-applied-profile="Persistido"');
    expect(markup).toContain('data-resolved-tone="dark"');
    expect(markup).toContain('data-resolved-accent="emerald"');
    expect(markup).toContain('data-resolved-density="comfortable"');
    expect(markup).toContain('data-resolved-canvas-density="compact"');
  });

  it('renders discoverable desktop and mobile triggers through the real Radix Sheet UI', () => {
    const markup = renderToStaticMarkup(
      createElement(
        StudioAppearanceProvider,
        { storage: storageWithProfile() },
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
