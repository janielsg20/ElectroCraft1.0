import { afterEach, describe, expect, it } from 'vitest';
import { puckAdvancedSelectionControls } from '@electrocraft/editor-puck';

let disconnect: (() => void) | null = null;

afterEach(() => {
  disconnect?.();
  disconnect = null;
  puckAdvancedSelectionControls.clear();
});

describe('M06.5 advanced selection controls', () => {
  it('keeps multi-selection session-only and collapses when Puck primary selection changes', () => {
    puckAdvancedSelectionControls.syncPrimary('node-a');
    puckAdvancedSelectionControls.toggle('node-b');
    expect(puckAdvancedSelectionControls.getSnapshot().selectedIds).toEqual(['node-a', 'node-b']);

    puckAdvancedSelectionControls.syncPrimary('node-c');
    expect(puckAdvancedSelectionControls.getSnapshot()).toMatchObject({
      primaryId: 'node-c',
      selectedIds: ['node-c'],
    });
  });

  it('delegates group and ungroup without storing a Puck Data or AppState copy', () => {
    const calls: string[] = [];
    disconnect = puckAdvancedSelectionControls.connect({
      group(ids) {
        calls.push(`group:${ids.join(',')}`);
        return 'group-1';
      },
      ungroup(id) {
        calls.push(`ungroup:${id}`);
        return ['node-a', 'node-b'];
      },
      resize() {
        throw new Error('unexpected resize');
      },
    });

    puckAdvancedSelectionControls.syncPrimary('node-a');
    puckAdvancedSelectionControls.toggle('node-b');
    expect(puckAdvancedSelectionControls.group()).toBe('group-1');
    expect(puckAdvancedSelectionControls.getSnapshot().selectedIds).toEqual(['group-1']);
    expect(puckAdvancedSelectionControls.ungroup()).toEqual(['node-a', 'node-b']);
    expect(calls).toEqual(['group:node-a,node-b', 'ungroup:group-1']);
  });

  it('delegates canonical resize and exposes adapter failures as diagnostics', () => {
    const sizes: unknown[] = [];
    disconnect = puckAdvancedSelectionControls.connect({
      group: () => 'unused',
      ungroup: () => [],
      resize(id, width, height) {
        sizes.push({ id, width, height });
        if (width === 999) throw new Error('resize bloqueado');
      },
    });

    puckAdvancedSelectionControls.syncPrimary('node-a');
    puckAdvancedSelectionControls.resize(320, 180);
    expect(sizes).toEqual([{ id: 'node-a', width: 320, height: 180 }]);

    expect(() => puckAdvancedSelectionControls.resize(999, null)).toThrow(/resize bloqueado/);
    expect(puckAdvancedSelectionControls.getSnapshot().message).toBe('resize bloqueado');
  });
});
