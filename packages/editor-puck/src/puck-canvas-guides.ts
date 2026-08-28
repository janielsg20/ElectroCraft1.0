export type PuckCanvasGuideAxis = 'x' | 'y';
export type PuckCanvasSnapSource = 'guide' | 'sibling' | 'parent' | 'grid';

export interface PuckCanvasGuide {
  readonly id: string;
  readonly axis: PuckCanvasGuideAxis;
  readonly position: number;
}

export interface PuckCanvasSnapCandidate {
  readonly value: number;
  readonly source: Exclude<PuckCanvasSnapSource, 'grid'>;
  readonly label?: string;
}

export interface PuckCanvasSnapResult {
  readonly value: number;
  readonly snapped: boolean;
  readonly source: PuckCanvasSnapSource | null;
  readonly distance: number;
  readonly label: string | null;
}

export interface PuckCanvasGuideSnapshot {
  readonly rulersVisible: boolean;
  readonly guidesVisible: boolean;
  readonly snappingEnabled: boolean;
  readonly gridSize: number;
  readonly guides: readonly PuckCanvasGuide[];
  readonly feedback: PuckCanvasSnapResult | null;
}

const sourcePriority: Readonly<Record<PuckCanvasSnapSource, number>> = Object.freeze({
  guide: 0,
  sibling: 1,
  parent: 2,
  grid: 3,
});

export function resolvePuckCanvasSnap(
  value: number,
  candidates: readonly PuckCanvasSnapCandidate[],
  options: Readonly<{ enabled?: boolean; threshold?: number; gridSize?: number }> = {},
): PuckCanvasSnapResult {
  const enabled = options.enabled ?? true;
  const threshold = Math.max(0, options.threshold ?? 6);
  const gridSize = Math.max(1, Math.round(options.gridSize ?? 8));
  if (!enabled) return { value, snapped: false, source: null, distance: 0, label: null };

  const gridValue = Math.round(value / gridSize) * gridSize;
  const allCandidates = [
    ...candidates.map((candidate) => ({ ...candidate, distance: Math.abs(candidate.value - value) })),
    {
      value: gridValue,
      source: 'grid' as const,
      label: `Cuadrícula ${gridSize}px`,
      distance: Math.abs(gridValue - value),
    },
  ]
    .filter((candidate) => candidate.distance <= threshold)
    .sort(
      (left, right) =>
        sourcePriority[left.source] - sourcePriority[right.source] ||
        left.distance - right.distance ||
        left.value - right.value,
    );

  const best = allCandidates[0];
  if (!best) return { value, snapped: false, source: null, distance: 0, label: null };
  return {
    value: best.value,
    snapped: true,
    source: best.source,
    distance: best.value - value,
    label: best.label ?? null,
  };
}

let snapshot: PuckCanvasGuideSnapshot = Object.freeze({
  rulersVisible: true,
  guidesVisible: true,
  snappingEnabled: true,
  gridSize: 8,
  guides: Object.freeze([]),
  feedback: null,
});
const listeners = new Set<() => void>();

function publish(next: PuckCanvasGuideSnapshot) {
  snapshot = Object.freeze({ ...next, guides: Object.freeze([...next.guides]) });
  for (const listener of listeners) listener();
}

function normalizePosition(position: number) {
  return Math.max(0, Math.round(Number.isFinite(position) ? position : 0));
}

export const puckCanvasGuideControls = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  configure(
    value: Partial<Pick<PuckCanvasGuideSnapshot, 'rulersVisible' | 'guidesVisible' | 'snappingEnabled' | 'gridSize'>>,
  ) {
    publish({
      ...snapshot,
      ...value,
      gridSize: Math.min(64, Math.max(1, Math.round(value.gridSize ?? snapshot.gridSize))),
    });
  },
  addGuide(axis: PuckCanvasGuideAxis, position: number) {
    const id = `guide-${axis}-${globalThis.crypto.randomUUID()}`;
    publish({ ...snapshot, guides: [...snapshot.guides, { id, axis, position: normalizePosition(position) }] });
    return id;
  },
  moveGuide(id: string, position: number) {
    publish({
      ...snapshot,
      guides: snapshot.guides.map((guide) =>
        guide.id === id ? { ...guide, position: normalizePosition(position) } : guide,
      ),
    });
  },
  removeGuide(id: string) {
    publish({ ...snapshot, guides: snapshot.guides.filter((guide) => guide.id !== id) });
  },
  clearGuides() {
    publish({ ...snapshot, guides: [], feedback: null });
  },
  setFeedback(feedback: PuckCanvasSnapResult | null) {
    publish({ ...snapshot, feedback });
  },
  snap(value: number, candidates: readonly PuckCanvasSnapCandidate[] = []) {
    const guideCandidates = snapshot.guides.map((guide) => ({
      value: guide.position,
      source: 'guide' as const,
      label: `Guía ${guide.position}px`,
    }));
    const feedback = resolvePuckCanvasSnap(value, [...guideCandidates, ...candidates], {
      enabled: snapshot.snappingEnabled,
      gridSize: snapshot.gridSize,
    });
    publish({ ...snapshot, feedback });
    return feedback;
  },
});
