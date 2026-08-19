import { describe, expect, it } from 'vitest';
import { normalizeZoomPercent, resolveStudioViewportBreakpoint } from '../../../apps/studio/src/shell/topbar-model';

describe('M03.4 Topbar model', () => {
  it('resolves the exact responsive breakpoint bands', () => {
    expect(resolveStudioViewportBreakpoint(360)).toBe('mobile');
    expect(resolveStudioViewportBreakpoint(767)).toBe('mobile');
    expect(resolveStudioViewportBreakpoint(768)).toBe('tablet');
    expect(resolveStudioViewportBreakpoint(1023)).toBe('tablet');
    expect(resolveStudioViewportBreakpoint(1024)).toBe('laptop');
    expect(resolveStudioViewportBreakpoint(1279)).toBe('laptop');
    expect(resolveStudioViewportBreakpoint(1280)).toBe('desktop');
    expect(resolveStudioViewportBreakpoint(Number.NaN)).toBe('desktop');
  });

  it('normalizes zoom to the supported 25-200 range', () => {
    expect(normalizeZoomPercent(100.4)).toBe(100);
    expect(normalizeZoomPercent(5)).toBe(25);
    expect(normalizeZoomPercent(280)).toBe(200);
    expect(normalizeZoomPercent(Number.NaN)).toBe(100);
  });
});
