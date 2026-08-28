import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultElectroCraftStyle, electroCraftDocumentNodeSchema } from '@electrocraft/domain';
import { puckContextControls } from '@electrocraft/editor-puck';

let disconnect: (() => void) | null = null;

afterEach(() => {
  disconnect?.();
  disconnect = null;
});

const node = electroCraftDocumentNodeSchema.parse({
  id: 'ec_node_0000000000606',
  componentRef: 'Text',
  props: { text: 'Contexto' },
  layout: null,
  style: createDefaultElectroCraftStyle(),
  children: [],
});

describe('M06.6 context controls', () => {
  it('stores only a canonical subtree in the session clipboard', () => {
    let pasted = null as unknown;
    disconnect = puckContextControls.connect({
      copy: () => node,
      paste(value) {
        pasted = value;
        return 'ec_node_0000000000607';
      },
      duplicate() {},
      remove() {},
      setHidden() {},
      refreshPermissions() {},
    });
    puckContextControls.syncContext({
      selectedId: node.id,
      breadcrumbs: [{ id: 'root', label: 'Página' }, { id: node.id, label: 'Texto' }],
      hidden: false,
    });

    expect(puckContextControls.copy()).toEqual(node);
    expect(puckContextControls.getSnapshot().clipboardAvailable).toBe(true);
    expect(puckContextControls.paste()).toBe('ec_node_0000000000607');
    expect(pasted).toEqual(node);
  });

  it('keeps lock state session-only and refreshes Puck dynamic permissions', () => {
    let refreshes = 0;
    disconnect = puckContextControls.connect({
      copy: () => node,
      paste: () => node.id,
      duplicate() {},
      remove() {},
      setHidden() {},
      refreshPermissions() {
        refreshes += 1;
      },
    });
    puckContextControls.syncContext({ selectedId: node.id, breadcrumbs: [], hidden: false });

    expect(puckContextControls.toggleLock()).toBe(true);
    expect(puckContextControls.isLocked(node.id)).toBe(true);
    expect(puckContextControls.toggleLock()).toBe(false);
    expect(refreshes).toBe(2);
  });

  it('delegates canonical visibility and exposes recoverable errors', () => {
    const hidden: boolean[] = [];
    disconnect = puckContextControls.connect({
      copy: () => node,
      paste: () => node.id,
      duplicate() {
        throw new Error('duplicado bloqueado');
      },
      remove() {},
      setHidden(_id, value) {
        hidden.push(value);
      },
      refreshPermissions() {},
    });
    puckContextControls.syncContext({ selectedId: node.id, breadcrumbs: [], hidden: false });

    puckContextControls.setVisible(false);
    puckContextControls.setVisible(true);
    expect(hidden).toEqual([true, false]);
    expect(() => puckContextControls.duplicate()).toThrow(/duplicado bloqueado/);
    expect(puckContextControls.getSnapshot().message).toBe('duplicado bloqueado');
  });
});
