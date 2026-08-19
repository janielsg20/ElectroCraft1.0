import { describe, expect, it } from 'vitest';
import { appShellLayout } from '../../../apps/studio/src/shell/app-shell-layout';
import {
  mobileEditorDestinations,
  responsiveEditorContract,
  resolveLaptopPanelStrategy,
} from '../../../apps/studio/src/shell/editor-layout-model';

describe('M03.6 responsive editor layout contract', () => {
  it('pins tablet rail and mobile dock dimensions without changing M03.5 desktop geometry', () => {
    expect(appShellLayout.tabletRailPx).toBe(56);
    expect(responsiveEditorContract).toEqual({
      laptopCanvasOverlayBelowPx: 1152,
      tabletRailPx: 56,
      mobileDockHeightPx: 58,
    });
  });

  it('keeps the mobile navigation destinations exact and ordered', () => {
    expect(mobileEditorDestinations).toEqual(['components', 'screens', 'canvas', 'properties', 'more']);
  });

  it('switches laptop secondary tools to overlay only when the canvas becomes narrow', () => {
    expect(resolveLaptopPanelStrategy(1024)).toBe('overlay');
    expect(resolveLaptopPanelStrategy(1100)).toBe('overlay');
    expect(resolveLaptopPanelStrategy(1151)).toBe('overlay');
    expect(resolveLaptopPanelStrategy(1152)).toBe('split');
    expect(resolveLaptopPanelStrategy(1279)).toBe('split');
  });

  it('fails closed for invalid responsive widths', () => {
    expect(() => resolveLaptopPanelStrategy(-1)).toThrow(/finite non-negative/);
    expect(() => resolveLaptopPanelStrategy(Number.NaN)).toThrow(/finite non-negative/);
    expect(() => resolveLaptopPanelStrategy(Number.POSITIVE_INFINITY)).toThrow(/finite non-negative/);
  });
});
