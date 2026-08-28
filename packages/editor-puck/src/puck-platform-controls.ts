import {
  electroCraftEditorPlatformSchema,
  type ElectroCraftEditorPlatform,
} from '@electrocraft/domain';

export interface PuckPlatformControlsSnapshot {
  readonly current: ElectroCraftEditorPlatform;
}

let snapshot: PuckPlatformControlsSnapshot = Object.freeze({ current: 'web' });
const listeners = new Set<() => void>();

function publish(next: PuckPlatformControlsSnapshot) {
  snapshot = Object.freeze(next);
  for (const listener of listeners) listener();
}

/**
 * Studio-only platform preview selection. The current platform is transient
 * editor context; only property overrides written through canonical Style are
 * persisted in ElectroCraftDocument.
 */
export const puckPlatformControls = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  select(platform: ElectroCraftEditorPlatform) {
    const current = electroCraftEditorPlatformSchema.parse(platform);
    if (snapshot.current !== current) publish({ current });
  },
});
