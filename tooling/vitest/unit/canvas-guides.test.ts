import { describe, expect, it } from 'vitest';
import { resolvePuckCanvasSnap } from '@electrocraft/editor-puck';

describe('Canvas guides and snapping', () => {
  it('prioritizes guide, sibling, parent and grid in that order', () => {
    const candidates = [
      { value: 100, source: 'parent' as const, label: 'Padre' },
      { value: 100, source: 'sibling' as const, label: 'Hermano' },
      { value: 100, source: 'guide' as const, label: 'Guía' },
    ];

    expect(resolvePuckCanvasSnap(103, candidates, { threshold: 6, gridSize: 8 })).toMatchObject({
      value: 100,
      source: 'guide',
      snapped: true,
      distance: -3,
      label: 'Guía',
    });
  });

  it('uses the grid only when no higher priority candidate is in threshold', () => {
    expect(resolvePuckCanvasSnap(31, [], { threshold: 3, gridSize: 8 })).toMatchObject({
      value: 32,
      source: 'grid',
      snapped: true,
    });
  });

  it('returns the raw value when snapping is disabled', () => {
    expect(resolvePuckCanvasSnap(31, [{ value: 32, source: 'guide' }], { enabled: false })).toEqual({
      value: 31,
      snapped: false,
      source: null,
      distance: 0,
      label: null,
    });
  });
});
