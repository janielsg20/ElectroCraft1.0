import { describe, expect, it } from 'vitest';
import { appShellLayout, resolveAppShellViewportMode } from '../../../apps/studio/src/shell/app-shell-layout';
import {
  mobileEditorDestinations,
  resolveEditorLayoutMode,
  resolveLaptopPanelStrategy,
} from '../../../apps/studio/src/shell/editor-layout-model';
import { getStudioSidebarNavigationItem } from '../../../apps/studio/src/shell/sidebar-navigation';

describe('M03.6 responsive shell runtime integration', () => {
  it('aligns AppShell and editor viewport modes across the exact responsive bands', () => {
    for (const [width, mode] of [
      [360, 'mobile'],
      [767, 'mobile'],
      [768, 'tablet'],
      [900, 'tablet'],
      [1023, 'tablet'],
      [1024, 'laptop'],
      [1180, 'laptop'],
      [1279, 'laptop'],
      [1280, 'desktop'],
      [1440, 'desktop'],
    ] as const) {
      expect(resolveAppShellViewportMode(width)).toBe(mode);
      expect(resolveEditorLayoutMode(width)).toBe(mode);
    }
  });

  it('keeps the tablet rail and laptop overlay strategy separate from mobile routing', () => {
    expect(appShellLayout.tabletRailPx).toBe(56);
    expect(resolveLaptopPanelStrategy(1100)).toBe('overlay');
    expect(resolveLaptopPanelStrategy(1180)).toBe('split');
    expect(mobileEditorDestinations).toHaveLength(5);
  });

  it('resolves Pantallas from the canonical Sidebar registry for the mobile dock', () => {
    expect(getStudioSidebarNavigationItem('screens')).toMatchObject({
      id: 'screens',
      label: 'Pantallas',
      href: '/screens',
      iconId: 'studio.sidebar.screens',
    });
  });
});
