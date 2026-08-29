import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@electrocraft/design-system';
import {
  electroCraftRouteAccessConfigSchema,
  routeAccessConfigFromGuards,
  type ElectroCraftRouteAccessMode,
  type ElectroCraftRouteDefinition,
} from '@electrocraft/domain';
import { useEffect, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { routeGuardRuntime } from './route-guard-runtime';
import './route-guard-editor.css';

export function RouteGuardEditor({
  route,
  routes,
}: {
  readonly route: ElectroCraftRouteDefinition;
  readonly routes: readonly ElectroCraftRouteDefinition[];
}) {
  const initial = routeAccessConfigFromGuards(route);
  const fallbackRedirect = routes.find(({ id }) => id !== route.id)?.id ?? '';
  const [mode, setMode] = useState<ElectroCraftRouteAccessMode>(initial.mode);
  const [policyRef, setPolicyRef] = useState(initial.policyRef ?? '');
  const [conditionActionRef, setConditionActionRef] = useState(initial.conditionActionRef ?? '');
  const [redirectRouteRef, setRedirectRouteRef] = useState(initial.redirectRouteRef ?? fallbackRedirect);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = routeAccessConfigFromGuards(route);
    setMode(next.mode);
    setPolicyRef(next.policyRef ?? '');
    setConditionActionRef(next.conditionActionRef ?? '');
    setRedirectRouteRef(next.redirectRouteRef ?? routes.find(({ id }) => id !== route.id)?.id ?? '');
  }, [route, routes]);

  async function save() {
    setError(null);
    setMessage(null);
    try {
      const config = electroCraftRouteAccessConfigSchema.parse({
        schemaVersion: 1,
        mode,
        policyRef: mode === 'permission' ? policyRef.trim() || null : null,
        conditionActionRef: mode === 'condition' ? conditionActionRef.trim() || null : null,
        redirectRouteRef: mode === 'public' ? null : redirectRouteRef || null,
      });
      const result = await routeGuardRuntime.save(route.id, config);
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el Acceso de la Ruta.');
    }
  }

  return (
    <section className="ec-route-guard-editor" aria-labelledby="route-access-title" data-route-guard-editor>
      <div className="ec-route-guard-title-row">
        <h4 id="route-access-title">Acceso</h4>
        <HelpTrigger helpId="help.navigation.guards" />
      </div>
      <label>
        <span>Acceso</span>
        <Select value={mode} onValueChange={(value) => setMode(value as ElectroCraftRouteAccessMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Público</SelectItem>
            <SelectItem value="authenticated">Requiere iniciar sesión</SelectItem>
            <SelectItem value="permission">Permiso</SelectItem>
            <SelectItem value="condition">Condición</SelectItem>
          </SelectContent>
        </Select>
      </label>

      {mode === 'permission' ? (
        <label>
          <span>Permiso</span>
          <Input
            value={policyRef}
            onChange={(event) => setPolicyRef(event.target.value)}
            placeholder="ec_policy_…"
            aria-describedby="route-permission-help"
          />
          <small id="route-permission-help">Referencia al PermissionPolicy; F12 conecta el evaluador real.</small>
        </label>
      ) : null}

      {mode === 'condition' ? (
        <label>
          <span>Condición</span>
          <Input
            value={conditionActionRef}
            onChange={(event) => setConditionActionRef(event.target.value)}
            placeholder="ec_action-graph_…"
          />
        </label>
      ) : null}

      {mode !== 'public' ? (
        <label>
          <span>Si no tiene acceso · Redirigir a</span>
          <Select value={redirectRouteRef} onValueChange={setRedirectRouteRef}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Ruta" />
            </SelectTrigger>
            <SelectContent>
              {routes
                .filter(({ id }) => id !== route.id)
                .map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name} · {candidate.path}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </label>
      ) : null}

      <p className="ec-route-guard-warning">
        Ocultar un elemento de Navegación no es control de seguridad. El enforcement usa Guards y, desde F12, el
        evaluador real de autenticación/permisos.
      </p>
      <Button onClick={() => void save()} disabled={mode !== 'public' && !redirectRouteRef}>
        Guardar Acceso
      </Button>
      {error ? (
        <p className="ec-route-guard-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="ec-route-guard-success" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
