import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import { createNavigationPreviewRows, evaluateRouteAccessPreview } from '@electrocraft/application';
import type { ElectroCraftRouteDefinition } from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { navigationWorkspaceRuntime } from './navigation-workspace-runtime';
import './navigation-preview.css';

function routeFromLocation(routes: readonly ElectroCraftRouteDefinition[]) {
  if (typeof window === 'undefined') return routes[0] ?? null;
  const routeRef = new URLSearchParams(window.location.search).get('route');
  return routes.find(({ id }) => id === routeRef) ?? routes[0] ?? null;
}

function updatePreviewRoute(routeRef: string) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('route', routeRef);
  window.history.replaceState({}, '', `${url.pathname}${url.search}`);
}

function reasonLabel(reason: ReturnType<typeof evaluateRouteAccessPreview>['reason']) {
  if (reason === 'public') return 'Ruta pública';
  if (reason === 'authentication-required') return 'Requiere iniciar sesión';
  if (reason === 'permission-denied') return 'Permiso denegado';
  if (reason === 'condition-failed') return 'Condición no satisfecha';
  return 'Acceso permitido';
}

export function NavigationPreview() {
  const snapshot = useSyncExternalStore(
    navigationWorkspaceRuntime.subscribe,
    navigationWorkspaceRuntime.getSnapshot,
    navigationWorkspaceRuntime.getSnapshot,
  );
  const [selectedRouteRef, setSelectedRouteRef] = useState<string>('');
  const [authenticated, setAuthenticated] = useState(false);
  const [allowProtectedRefs, setAllowProtectedRefs] = useState(false);

  useEffect(() => {
    void navigationWorkspaceRuntime.load();
  }, []);

  const routes = snapshot.graph?.routes ?? [];
  const route = routes.find(({ id }) => id === selectedRouteRef) ?? routeFromLocation(routes);
  const navigation = snapshot.graph?.navigations[0] ?? null;
  const previewRows = useMemo(() => (navigation ? createNavigationPreviewRows(navigation) : []), [navigation]);
  const decision = route
    ? evaluateRouteAccessPreview(route, {
        authenticated,
        allowedPolicyRefs: allowProtectedRefs
          ? route.guards.flatMap((guard) => (guard.policyRef ? [guard.policyRef] : []))
          : [],
        passedConditionActionRefs: allowProtectedRefs
          ? route.guards.flatMap((guard) => (guard.actionRef ? [guard.actionRef] : []))
          : [],
      })
    : null;
  const redirectRoute = decision?.redirectRouteRef
    ? (routes.find(({ id }) => id === decision.redirectRouteRef) ?? null)
    : null;

  function selectRoute(routeRef: string) {
    setSelectedRouteRef(routeRef);
    updatePreviewRoute(routeRef);
  }

  if (snapshot.state === 'loading' || snapshot.state === 'initial') {
    return (
      <section className="ec-navigation-preview" data-navigation-preview>
        <p role="status">Cargando Preview de navegación…</p>
      </section>
    );
  }

  if (!snapshot.project) {
    return (
      <section className="ec-navigation-preview" data-navigation-preview>
        <h1>Preview</h1>
        <p>Abre un proyecto para probar sus Pantallas y Rutas.</p>
        <Button asChild>
          <a href="/">Abrir Proyectos</a>
        </Button>
      </section>
    );
  }

  if (snapshot.state === 'error') {
    return (
      <section className="ec-navigation-preview" data-navigation-preview>
        <h1>Preview</h1>
        <div className="ec-navigation-preview-error" role="alert">
          <strong>No se pudo cargar la Navegación.</strong>
          <p>{snapshot.message}</p>
          <Button variant="outline" onClick={() => void navigationWorkspaceRuntime.load()}>
            Reintentar
          </Button>
        </div>
      </section>
    );
  }

  if (!route || !navigation) {
    return (
      <section className="ec-navigation-preview" data-navigation-preview>
        <h1>Preview</h1>
        <p>No hay Rutas y Navegación suficientes para ejecutar el Preview.</p>
        <Button asChild>
          <a href="/navigation">Configurar Navegación</a>
        </Button>
      </section>
    );
  }

  return (
    <section className="ec-navigation-preview" data-navigation-preview aria-labelledby="navigation-preview-title">
      <header className="ec-navigation-preview-header">
        <div>
          <p>App · Navegación</p>
          <div className="ec-navigation-preview-title-row">
            <h1 id="navigation-preview-title">Preview</h1>
            <HelpTrigger helpId="help.navigation" />
          </div>
          <span>Stub contractual de F07. No ejecuta autenticación real ni routers de target.</span>
        </div>
        <Button variant="outline" asChild>
          <a href="/navigation">Editar Navegación</a>
        </Button>
      </header>

      <div className="ec-navigation-preview-toolbar" role="group" aria-label="Contexto del Preview">
        <label>
          <span>Ruta</span>
          <Select value={route.id} onValueChange={selectRoute}>
            <SelectTrigger aria-label="Ruta del Preview">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {routes.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name} · {candidate.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="ec-navigation-preview-check">
          <Checkbox checked={authenticated} onCheckedChange={(value) => setAuthenticated(value === true)} />
          <span>Simular usuario autenticado</span>
        </label>
        <label className="ec-navigation-preview-check">
          <Checkbox checked={allowProtectedRefs} onCheckedChange={(value) => setAllowProtectedRefs(value === true)} />
          <span>Simular permiso/condición aprobada</span>
        </label>
      </div>

      <div className="ec-navigation-preview-grid">
        <aside className="ec-navigation-preview-structure" aria-label="Estructura de Navegación">
          <h2>Navegación</h2>
          <ol>
            {previewRows.map((row) => (
              <li
                key={row.id}
                data-initial={row.initial ? 'true' : 'false'}
                data-visible={row.visible ? 'true' : 'false'}
              >
                <span style={{ paddingInlineStart: `${row.depth * 14}px` }}>
                  {row.kind === 'screen' ? 'Pantalla' : row.kind} · {row.label}
                </span>
                {row.initial ? <small>Pantalla inicial</small> : null}
              </li>
            ))}
          </ol>
        </aside>

        <main className="ec-navigation-preview-screen" aria-label="Pantalla simulada">
          <div className="ec-navigation-preview-screen-bar">
            <span>Pantalla</span>
            <strong>{route.name}</strong>
            <code>{route.path}</code>
          </div>
          {decision?.allowed ? (
            <div className="ec-navigation-preview-allowed" role="status">
              <strong>{reasonLabel(decision.reason)}</strong>
              <p>La Ruta puede mostrarse en este contexto de Preview.</p>
              {route.params.length > 0 ? (
                <dl>
                  {route.params.map((param) => (
                    <div key={param.name}>
                      <dt>{param.name}</dt>
                      <dd>
                        {param.valueType} · {param.source}
                        {param.required ? ' · requerido' : ''}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>Sin Parámetros.</p>
              )}
            </div>
          ) : (
            <div className="ec-navigation-preview-blocked" role="alert">
              <strong>{decision ? reasonLabel(decision.reason) : 'Acceso bloqueado'}</strong>
              <p>El Preview aplica Guards en modo fail-closed.</p>
              {redirectRoute ? (
                <Button onClick={() => selectRoute(redirectRoute.id)}>Redirigir a {redirectRoute.name}</Button>
              ) : (
                <span>Sin Ruta de redirección configurada.</span>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}
