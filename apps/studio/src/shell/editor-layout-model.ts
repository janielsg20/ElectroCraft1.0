export const editorPaneContract = Object.freeze({
  context: Object.freeze({ defaultSize: 288, minSize: 240, maxSize: 380 }),
  inspector: Object.freeze({ defaultSize: 320, minSize: 280, maxSize: 440 }),
  statusHeight: 26,
});

export const responsiveEditorContract = Object.freeze({
  laptopCanvasOverlayBelowPx: 1152,
  tabletRailPx: 56,
  mobileDockHeightPx: 58,
});

export const mobileEditorDestinations = Object.freeze([
  'components',
  'screens',
  'canvas',
  'properties',
  'more',
] as const);

export type MobileEditorDestination = (typeof mobileEditorDestinations)[number];
export type EditorLayoutMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export type LaptopPanelStrategy = 'split' | 'overlay';

export function resolveEditorLayoutMode(width: number): EditorLayoutMode {
  if (width >= 1280) return 'desktop';
  if (width >= 1024) return 'laptop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

export function resolveLaptopPanelStrategy(width: number): LaptopPanelStrategy {
  if (!Number.isFinite(width) || width < 0) {
    throw new RangeError('Editor viewport width must be a finite non-negative number.');
  }
  return width < responsiveEditorContract.laptopCanvasOverlayBelowPx ? 'overlay' : 'split';
}
