import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  getStudioIcon,
} from '@electrocraft/design-system';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { editorScreenSelectionRuntime } from './editor-screen-selection-runtime';
import './editor-screen-selector.css';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';

const ScreenIcon = getStudioIcon('studio.sidebar.screens');
const OpenIcon = getStudioIcon('action.open');

function screenDocuments() {
  return navigationWorkspaceRuntime
    .screenDocuments()
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, 'es'));
}

function routePathForScreen(screenId: string) {
  const routes = navigationWorkspaceRuntime.getSnapshot().graph?.routes ?? [];
  return routes.find(({ screenRef }) => screenRef === screenId)?.path ?? 'Sin Ruta';
}

export function EditorScreenTopbarSelect({ fallbackLabel }: { readonly fallbackLabel: string }) {
  const navigation = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const selection = useSyncExternalStore(
    editorScreenSelectionRuntime.subscribe,
    editorScreenSelectionRuntime.getSnapshot,
    editorScreenSelectionRuntime.getSnapshot,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.pathname !== '/editor') return;
    void navigationWorkspaceRuntime.load().then(() => {
      const screens = screenDocuments();
      const selectedExists = selection.screenId ? screens.some(({ id }) => id === selection.screenId) : false;
      if (!selectedExists && screens[0]) editorScreenSelectionRuntime.select(screens[0].id, { replace: true });
    });
  }, [selection.screenId]);

  if (typeof window === 'undefined' || window.location.pathname !== '/editor') {
    return <span>{fallbackLabel}</span>;
  }

  const screens = screenDocuments();
  const selectedId =
    selection.screenId && screens.some(({ id }) => id === selection.screenId)
      ? selection.screenId
      : (screens[0]?.id ?? '');

  if (navigation.state === 'loading' && screens.length === 0) return <span>Cargando Pantalla…</span>;
  if (screens.length === 0) return <span>{fallbackLabel}</span>;

  return (
    <Select value={selectedId} onValueChange={(value) => editorScreenSelectionRuntime.select(value)}>
      <SelectTrigger className="ec-topbar-screen-select" aria-label="Pantalla">
        <SelectValue placeholder="Pantalla" />
      </SelectTrigger>
      <SelectContent>
        {screens.map((screen) => (
          <SelectItem key={screen.id} value={screen.id}>
            {screen.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function EditorScreensContextPanel() {
  const navigation = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const selection = useSyncExternalStore(
    editorScreenSelectionRuntime.subscribe,
    editorScreenSelectionRuntime.getSnapshot,
    editorScreenSelectionRuntime.getSnapshot,
  );

  useEffect(() => {
    void navigationWorkspaceRuntime.load();
  }, []);

  const screens = useMemo(() => screenDocuments(), [navigation.graph, navigation.lastSavedMessage]);

  if (navigation.state === 'loading' && screens.length === 0) {
    return (
      <p className="ec-editor-screen-context-state" role="status">
        Cargando Pantallas…
      </p>
    );
  }
  if (navigation.state === 'error' && screens.length === 0) {
    return (
      <div className="ec-editor-screen-context-state" role="alert">
        <strong>No se pudieron cargar las Pantallas.</strong>
        <p>{navigation.message}</p>
        <Button size="sm" variant="outline" onClick={() => void navigationWorkspaceRuntime.load()}>
          Reintentar
        </Button>
      </div>
    );
  }
  if (screens.length === 0) {
    return (
      <div className="ec-editor-screen-context-state">
        <strong>No hay Pantallas en este proyecto.</strong>
        <p>Crea una Pantalla desde Construir para comenzar a editarla.</p>
        <Button size="sm" variant="outline" asChild>
          <a href="/screens">Abrir Pantallas</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="ec-editor-screen-context" data-editor-screen-context>
      <div className="ec-editor-screen-context-heading">
        <div>
          <strong>Pantallas</strong>
          <span>{screens.length} en el proyecto</span>
        </div>
        <div className="ec-editor-screen-context-actions">
          <HelpTrigger helpId="help.editor.screens" />
          <Button variant="ghost" size="icon" asChild aria-label="Administrar Pantallas" title="Administrar Pantallas">
            <a href="/screens">
              <OpenIcon aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
      <div className="ec-editor-screen-context-list" role="listbox" aria-label="Seleccionar Pantalla">
        {screens.map((screen) => {
          const selected = selection.screenId === screen.id || (!selection.screenId && screens[0]?.id === screen.id);
          return (
            <button
              type="button"
              role="option"
              aria-selected={selected}
              className="ec-editor-screen-context-item"
              data-selected={selected ? 'true' : 'false'}
              key={screen.id}
              onClick={() => editorScreenSelectionRuntime.select(screen.id)}
            >
              <span className="ec-editor-screen-context-icon" aria-hidden="true">
                <ScreenIcon />
              </span>
              <span>
                <strong>{screen.name}</strong>
                <small>{routePathForScreen(screen.id)}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
