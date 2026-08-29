export interface PuckAdvancedSelectionSnapshot {
  readonly connected: boolean;
  readonly primaryId: string | null;
  readonly selectedIds: readonly string[];
  readonly message: string | null;
}

interface PuckAdvancedSelectionDelegates {
  readonly group: (ids: readonly string[]) => string;
  readonly ungroup: (id: string) => readonly string[];
  readonly resize: (id: string, width: number | null, height: number | null) => void;
}

let delegates: PuckAdvancedSelectionDelegates | null = null;
let snapshot: PuckAdvancedSelectionSnapshot = Object.freeze({
  connected: false,
  primaryId: null,
  selectedIds: Object.freeze([]),
  message: null,
});
const listeners = new Set<() => void>();

function publish(next: PuckAdvancedSelectionSnapshot) {
  snapshot = Object.freeze({ ...next, selectedIds: Object.freeze([...next.selectedIds]) });
  for (const listener of listeners) listener();
}

function unique(ids: readonly string[]) {
  return [...new Set(ids.filter((id) => id.trim().length > 0))];
}

function requireDelegates() {
  if (!delegates) throw new Error('El editor Puck no está conectado a la selección avanzada.');
  return delegates;
}

function runOperation(operation: () => void) {
  try {
    operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'La operación avanzada no pudo completarse.';
    publish({ ...snapshot, message });
    throw error;
  }
}

function onlySelectedId(operation: string) {
  const id = snapshot.selectedIds[0];
  if (snapshot.selectedIds.length !== 1 || !id) {
    throw new Error(`Selecciona un único elemento para ${operation}.`);
  }
  return id;
}

export const puckAdvancedSelectionControls = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  connect(nextDelegates: PuckAdvancedSelectionDelegates) {
    delegates = nextDelegates;
    publish({ ...snapshot, connected: true, message: null });
    return () => {
      if (delegates !== nextDelegates) return;
      delegates = null;
      publish({ ...snapshot, connected: false, message: null });
    };
  },
  syncPrimary(id: string | null) {
    if (snapshot.primaryId === id) return;
    publish({
      ...snapshot,
      primaryId: id,
      selectedIds: id === null ? [] : [id],
      message: null,
    });
  },
  toggle(id: string) {
    const selected = new Set(snapshot.selectedIds);
    if (selected.has(id)) selected.delete(id);
    else selected.add(id);
    publish({ ...snapshot, selectedIds: unique([...selected]), message: null });
  },
  selectOnly(id: string) {
    publish({ ...snapshot, selectedIds: [id], message: null });
  },
  clear() {
    publish({ ...snapshot, selectedIds: [], message: null });
  },
  group() {
    if (snapshot.selectedIds.length < 2) throw new Error('Selecciona al menos dos elementos para agrupar.');
    let groupId = '';
    runOperation(() => {
      groupId = requireDelegates().group(snapshot.selectedIds);
      publish({ ...snapshot, primaryId: groupId, selectedIds: [groupId], message: null });
    });
    return groupId;
  },
  ungroup() {
    const id = onlySelectedId('desagrupar');
    let children: readonly string[] = [];
    runOperation(() => {
      children = requireDelegates().ungroup(id);
      publish({ ...snapshot, primaryId: children[0] ?? null, selectedIds: children, message: null });
    });
    return children;
  },
  resize(width: number | null, height: number | null) {
    const id = onlySelectedId('cambiar su tamaño');
    runOperation(() => {
      requireDelegates().resize(id, width, height);
      publish({ ...snapshot, message: null });
    });
  },
});
