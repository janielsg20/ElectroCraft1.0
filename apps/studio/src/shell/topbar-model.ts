export type StudioViewportBreakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export function resolveStudioViewportBreakpoint(width: number): StudioViewportBreakpoint {
  if (!Number.isFinite(width) || width <= 0) return 'desktop';
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1280) return 'laptop';
  return 'desktop';
}

export function normalizeZoomPercent(value: number): number {
  if (!Number.isFinite(value)) return 100;
  return Math.min(200, Math.max(25, Math.round(value)));
}
