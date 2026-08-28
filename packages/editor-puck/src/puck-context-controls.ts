import type { ElectroCraftDocumentNode } from '@electrocraft/domain';

export interface PuckContextBreadcrumb {
  readonly id: string;
  readonly label: string;
}

export interface PuckContextSnapshot {
  readonly connected: boolean;
  readonly blockSaverConnected: boolean;
  readonly selectedId: string | null;
  readonly breadcrumbs: readonly PuckContextBreadcrumb[];
  readonly clipboardAvailable: boolean;
  readonly lockedIds: readonly string[];
  readonly hidden: boolean;
  readonly message: string | null;
}

interface PuckContextDelegates {
  readonly copy: (id: string) => ElectroCraftDocumentNode;
  readonly paste: (node: ElectroCraftDocumentNode) => string;
  readonly duplicate: (id: string) => void;
  readonly remove: (id: string) => void;
  readonly setHidden: (id: string, hidden: boolean) => void;
  readonly refreshPermissions: () => void;
}

type SaveBlock = (node: ElectroCraftDocumentNode) => string;

let delegates: PuckContextDelegates | null = null;
let saveBlock: SaveBlock | null = null;
let clipboard: ElectroCraftDocumentNode | null = null;
const lockedIds = new Set<string>();
let snapshot: PuckContextSnapshot = Object.freeze({
  connected: false,
  blockSaverConnected: false,
  selectedId: null,
  breadcrumbs: Object.freeze([]),
  clipboardAvailable: false,
  lockedIds: Object.freeze([]),
  hidden: false,
  message: null,
});
const listeners = new Set<() => void>();

function publish(patch: Partial<PuckContextSnapshot>) {
  snapshot = Object.freeze({
    ...snapshot,
    ...patch,
    breadcrumbs: Object.freeze([...(patch.breadcrumbs ?? snapshot.breadcrumbs)]),
    lockedIds: Object.freeze([...lockedIds]),
    clipboardAvailable: clipboard !== null,
    blockSaverConnected: saveBlock !== null,
  });
  for (const listener of listeners) listener();
}

function requireDelegates() {
  if (!delegates) throw new Error('El editor Puck no está conectado a las acciones contextuales.');
  return delegates;
}

function selectedId(action: string) {
  if (!snapshot.selectedId) throw new Error(`Selecciona un elemento para ${action}.`);
  return snapshot.selectedId;
}

function run<T>(operation: () => T): T {
  try {
    const result = operation();
    publish({ message: null });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'La acción contextual no pudo completarse.';
    publish({ message });
    throw error;
  }
}

export const puckContextControls = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  connect(nextDelegates: PuckContextDelegates) {
    delegates = nextDelegates;
    publish({ connected: true, message: null });
    return () => {
      if (delegates !== nextDelegates) return;
      delegates = null;
      clipboard = null;
      lockedIds.clear();
      publish({ connected: false, selectedId: null, breadcrumbs: [], hidden: false, message: null });
    };
  },
  connectBlockSaver(nextSaveBlock: SaveBlock) {
    saveBlock = nextSaveBlock;
    publish({ message: null });
    return () => {
      if (saveBlock !== nextSaveBlock) return;
      saveBlock = null;
      publish({ message: null });
    };
  },
  syncContext(context: {
    readonly selectedId: string | null;
    readonly breadcrumbs: readonly PuckContextBreadcrumb[];
    readonly hidden: boolean;
  }) {
    publish({ ...context, message: null });
  },
  isLocked(id: string) {
    return lockedIds.has(id);
  },
  toggleLock() {
    const id = selectedId('bloquear o desbloquear');
    return run(() => {
      if (lockedIds.has(id)) lockedIds.delete(id);
      else lockedIds.add(id);
      requireDelegates().refreshPermissions();
      publish({ message: null });
      return lockedIds.has(id);
    });
  },
  copy() {
    const id = selectedId('copiar');
    return run(() => {
      clipboard = structuredClone(requireDelegates().copy(id));
      publish({ message: null });
      return structuredClone(clipboard);
    });
  },
  paste() {
    if (!clipboard) throw new Error('No hay un subárbol canónico copiado para pegar.');
    return run(() => {
      const id = requireDelegates().paste(structuredClone(clipboard as ElectroCraftDocumentNode));
      publish({ selectedId: id, message: null });
      return id;
    });
  },
  saveAsBlock() {
    const id = selectedId('guardar como bloque');
    return run(() => {
      if (!saveBlock) throw new Error('El guardado de bloques no está conectado al proyecto actual.');
      const node = requireDelegates().copy(id);
      return saveBlock(structuredClone(node));
    });
  },
  duplicate() {
    const id = selectedId('duplicar');
    return run(() => requireDelegates().duplicate(id));
  },
  remove() {
    const id = selectedId('eliminar');
    return run(() => {
      requireDelegates().remove(id);
      lockedIds.delete(id);
      publish({ selectedId: null, breadcrumbs: [], hidden: false, message: null });
    });
  },
  setVisible(visible: boolean) {
    const id = selectedId(visible ? 'mostrar' : 'ocultar');
    return run(() => {
      requireDelegates().setHidden(id, !visible);
      publish({ hidden: !visible, message: null });
    });
  },
});
