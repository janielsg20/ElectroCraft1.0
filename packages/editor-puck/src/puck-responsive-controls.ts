import {
  ELECTROCRAFT_RESPONSIVE_PRESETS,
  electroCraftResponsiveConfigurationSchema,
  type ElectroCraftBreakpointDefinition,
  type ElectroCraftBreakpointId,
} from '@electrocraft/domain';
import type { Viewports } from '@puckeditor/core';

export interface PuckResponsiveControlsSnapshot {
  readonly connected: boolean;
  readonly currentId: ElectroCraftBreakpointId | null;
  readonly breakpoints: readonly ElectroCraftBreakpointDefinition[];
}

type SetViewport = (viewport: { width: number | '100%'; height: number | 'auto' }) => void;
type SetBreakpoints = (breakpoints: readonly ElectroCraftBreakpointDefinition[]) => void;

let setViewport: SetViewport | null = null;
let persistBreakpoints: SetBreakpoints | null = null;
let snapshot: PuckResponsiveControlsSnapshot = Object.freeze({
  connected: false,
  currentId: null,
  breakpoints: ELECTROCRAFT_RESPONSIVE_PRESETS.breakpoints,
});
const listeners = new Set<() => void>();

function publish(next: PuckResponsiveControlsSnapshot) {
  snapshot = Object.freeze(next);
  for (const listener of listeners) listener();
}

export const puckResponsiveControls = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  connect(delegates: { readonly setViewport: SetViewport; readonly setBreakpoints: SetBreakpoints }) {
    setViewport = delegates.setViewport;
    persistBreakpoints = delegates.setBreakpoints;
    publish({ ...snapshot, connected: true });
    return () => {
      if (setViewport === delegates.setViewport) {
        setViewport = null;
        persistBreakpoints = null;
        publish({ ...snapshot, connected: false });
      }
    };
  },
  select(id: ElectroCraftBreakpointId) {
    const breakpoint = snapshot.breakpoints.find((candidate) => candidate.id === id);
    if (!breakpoint) throw new Error(`Breakpoint responsive desconocido: ${id}`);
    if (!setViewport) throw new Error('El editor Puck no está conectado al control responsive.');
    setViewport({ width: breakpoint.width, height: breakpoint.height ?? 'auto' });
    publish({ ...snapshot, currentId: id });
  },
  syncCurrent(width: number | '100%') {
    const currentId =
      width === '100%' ? null : (snapshot.breakpoints.find((candidate) => candidate.width === width)?.id ?? null);
    if (snapshot.currentId !== currentId) publish({ ...snapshot, currentId });
  },
  setBreakpoints(breakpoints: readonly ElectroCraftBreakpointDefinition[]) {
    const parsed = electroCraftResponsiveConfigurationSchema.parse({ schemaVersion: 1, breakpoints });
    publish({ ...snapshot, breakpoints: parsed.breakpoints });
  },
  addCustom(breakpoint: Omit<ElectroCraftBreakpointDefinition, 'custom'>) {
    if (!persistBreakpoints) throw new Error('El editor Puck no está conectado al control responsive.');
    const parsed = electroCraftResponsiveConfigurationSchema.parse({
      schemaVersion: 1,
      breakpoints: [...snapshot.breakpoints, { ...breakpoint, custom: true }],
    });
    persistBreakpoints(parsed.breakpoints);
  },
  updateCustom(
    id: ElectroCraftBreakpointId,
    patch: Partial<Pick<ElectroCraftBreakpointDefinition, 'id' | 'label' | 'width' | 'height' | 'orientation'>>,
  ) {
    if (!persistBreakpoints) throw new Error('El editor Puck no está conectado al control responsive.');
    const current = snapshot.breakpoints.find((breakpoint) => breakpoint.id === id);
    if (!current?.custom) throw new Error(`Solo se pueden modificar breakpoints personalizados: ${id}`);
    const parsed = electroCraftResponsiveConfigurationSchema.parse({
      schemaVersion: 1,
      breakpoints: snapshot.breakpoints.map((breakpoint) =>
        breakpoint.id === id ? { ...breakpoint, ...patch, custom: true } : breakpoint,
      ),
    });
    persistBreakpoints(parsed.breakpoints);
  },
});

export function findCanonicalBreakpointForPuckViewport(
  viewports: Viewports,
  width: number | '100%',
): ElectroCraftBreakpointId | null {
  if (width === '100%') return null;
  const index = viewports.findIndex((viewport) => viewport.width === width);
  return index < 0 ? null : (snapshot.breakpoints[index]?.id ?? null);
}
