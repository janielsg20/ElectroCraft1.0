import { describe, expect, it } from 'vitest';
import { appShellLayout, resolveAppShellViewportMode } from '../../../apps/studio/src/shell/app-shell-layout';

describe('M03.2 AppShell layout contract', () => {
  it('keeps the exact structural dimensions required by F03', () => {
    expect(appShellLayout).toMatchObject({
      rootHeight: '100dvh',
      sidebarExpandedPx: 240,
      sidebarCollapsedPx: 64,
      topbarPx: 52,
      statusbarPx: 26,
    });
  });

  it('resolves desktop, laptop, tablet and mobile thresholds deterministically', () => {
    expect(resolveAppShellViewportMode(1440)).toBe('desktop');
    expect(resolveAppShellViewportMode(1280)).toBe('desktop');
    expect(resolveAppShellViewportMode(1279)).toBe('laptop');
    expect(resolveAppShellViewportMode(1024)).toBe('laptop');
    expect(resolveAppShellViewportMode(1023)).toBe('tablet');
    expect(resolveAppShellViewportMode(768)).toBe('tablet');
    expect(resolveAppShellViewportMode(767)).toBe('mobile');
    expect(resolveAppShellViewportMode(360)).toBe('mobile');
  });

  it('fails closed for invalid viewport widths', () => {
    expect(() => resolveAppShellViewportMode(-1)).toThrow(/finite non-negative/);
    expect(() => resolveAppShellViewportMode(Number.NaN)).toThrow(/finite non-negative/);
    expect(() => resolveAppShellViewportMode(Number.POSITIVE_INFINITY)).toThrow(/finite non-negative/);
  });
});
