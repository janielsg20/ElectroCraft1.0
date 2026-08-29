import { Button, Loader, getStudioIcon } from '@electrocraft/design-system';
import { useEffect, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { NavigationBuilder } from './navigation-builder';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';
import './navigation-workspace.css';

const NavigationIcon = getStudioIcon('studio.sidebar.navigation');
const AddIcon = getStudioIcon('action.add');
const RetryIcon = getStudioIcon('action.refresh');

export type NavigationWorkspaceMode = 'screens' | 'navigation';

export function NavigationWorkspace({ mode }: { readonly mode: NavigationWorkspaceMode }) {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );

  useEffect(() => {
    void navigationWorkspaceRuntime.load();
  }, []);

  const graph = snapshot.graph;
  const hasScreen = navigationWorkspaceRuntime.screenDocuments().length > 0;
  const hasNavigation = Boolean(graph && graph.navigations.length > 0 && graph.routes.length > 0);

  return (
    <section className="ec-navigation-workspace" data-navigation-workspace={mode} aria-labelledby="ec-navigation-title">
      <header className="ec-navigation-workspace-header">
        <div className="ec-navigation-workspace-title">
          <span aria-hidden="true">
            <NavigationIcon />
          </span>
          <div>
            <p>App</p>
            <div className="ec-navigation-title-row">
              <h2 id="ec-navigation-title">Navegación</h2>
              <HelpTrigger helpId="help.navigation.builder" />
            </div>
          </div>
        </div>
      </header>

      <p className="ec-navigation-summary">
        Pila, Pestañas, Menú lateral, Modal y Pantallas comparten un único árbol portable para Web, Android e iOS.
      </p>

      {snapshot.state === 'loading' ? (
        <div className="ec-navigation-loading" role="status" aria-live="polite">
          <Loader label="Cargando Navigation Builder" size="sm" />
          <span>Cargando estructura de Navegación…</span>
        </div>
      ) : null}

      {snapshot.state === 'error' ? (
        <div className="ec-navigation-error" role="alert">
          <strong>No se pudo abrir Navigation Graph.</strong>
          <p>{snapshot.message}</p>
          <Button size="sm" variant="outline" onClick={() => void navigationWorkspaceRuntime.load()}>
            <RetryIcon aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : null}

      {snapshot.state !== 'loading' && snapshot.state !== 'error' && !snapshot.project ? (
        <div className="ec-navigation-empty">
          <strong>Abre un proyecto para configurar Navegación.</strong>
          <p>El Navigation Graph se guarda junto con los demás objetos canónicos del proyecto.</p>
          <Button asChild size="sm">
            <a href="/">Abrir Proyectos</a>
          </Button>
        </div>
      ) : null}

      {snapshot.state !== 'loading' && snapshot.state !== 'error' && snapshot.project && !hasNavigation ? (
        <div className="ec-navigation-empty">
          <strong>No hay una navegación configurada.</strong>
          <p>
            {hasScreen
              ? 'Crea la Ruta inicial y una Pila raíz portable; después podrás anidar Pestañas, Menú lateral y Modal.'
              : 'Crea primero una Pantalla desde Construir > Pantallas.'}
          </p>
          <Button
            size="sm"
            disabled={!hasScreen || snapshot.state === 'saving'}
            title={!hasScreen ? 'Se requiere una Pantalla antes de crear la Navegación.' : undefined}
            onClick={() => void navigationWorkspaceRuntime.createInitialNavigation()}
          >
            <AddIcon aria-hidden="true" />
            Crear navegación inicial
          </Button>
        </div>
      ) : null}

      {snapshot.state !== 'loading' && snapshot.state !== 'error' && hasNavigation ? <NavigationBuilder /> : null}

      {snapshot.lastSavedMessage ? (
        <p className="ec-navigation-success" role="status" aria-live="polite">
          {snapshot.lastSavedMessage}
        </p>
      ) : null}

      {snapshot.graph && snapshot.graph.diagnostics.length > 0 ? (
        <section className="ec-navigation-diagnostics" aria-labelledby="navigation-diagnostics-title">
          <h3 id="navigation-diagnostics-title">Diagnósticos recuperables</h3>
          <ul>
            {snapshot.graph.diagnostics.map((diagnostic, index) => (
              <li key={`${diagnostic.code}-${diagnostic.ref ?? index}`}>
                <code>{diagnostic.code}</code>
                {diagnostic.ref ? ` · ${diagnostic.ref}` : ''}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
