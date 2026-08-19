export const appShellLayout = Object.freeze({
  rootHeight: '100dvh',
  sidebarExpandedPx: 240,
  sidebarCollapsedPx: 64,
  tabletRailPx: 56,
  topbarPx: 52,
  statusbarPx: 26,
  breakpoints: Object.freeze({
    mobileMaxPx: 767,
    tabletMaxPx: 1023,
    laptopMaxPx: 1279,
  }),
});

export type AppShellViewportMode = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export function resolveAppShellViewportMode(viewportWidth: number): AppShellViewportMode {
  if (!Number.isFinite(viewportWidth) || viewportWidth < 0) {
    throw new RangeError('AppShell viewport width must be a finite non-negative number.');
  }

  if (viewportWidth <= appShellLayout.breakpoints.mobileMaxPx) {
    return 'mobile';
  }

  if (viewportWidth <= appShellLayout.breakpoints.tabletMaxPx) {
    return 'tablet';
  }

  if (viewportWidth <= appShellLayout.breakpoints.laptopMaxPx) {
    return 'laptop';
  }

  return 'desktop';
}
