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
  electroCraftExternalUrlActionConfigSchema,
  electroCraftNavigateActionConfigSchema,
  type ElectroCraftRouteDefinition,
  type ElectroCraftRouteParamDefinition,
} from '@electrocraft/domain';
import { useMemo, useState } from 'react';
import { HelpTrigger } from '../../help/help-ui';
import { routeNavigationActionRuntime } from './route-navigation-action-runtime';
import { RouteGuardEditor } from './route-guard-editor';
import './route-action-editor.css';

function parseLiteral(param: ElectroCraftRouteParamDefinition, raw: string) {
  if (param.valueType === 'string') return raw;
  if (param.valueType === 'number') {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new TypeError(`El parámetro ${param.name} requiere un número.`);
    return value;
  }
  if (raw !== 'true' && raw !== 'false') throw new TypeError(`El parámetro ${param.name} requiere true o false.`);
  return raw === 'true';
}

export function RouteActionEditor({
  sourceRoute,
  routes,
}: {
  readonly sourceRoute: ElectroCraftRouteDefinition;
  readonly routes: readonly ElectroCraftRouteDefinition[];
}) {
  const [actionType, setActionType] = useState<'navigate' | 'external-url'>('navigate');
  const [mode, setMode] = useState<'push' | 'replace' | 'back'>('push');
  const [destinationRouteId, setDestinationRouteId] = useState<string>(routes[0]?.id ?? sourceRoute.id);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [externalUrl, setExternalUrl] = useState('https://');
  const [externalMode, setExternalMode] = useState<'same-context' | 'new-context'>('new-context');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const destinationRoute = useMemo(
    () => routes.find(({ id }) => id === destinationRouteId) ?? null,
    [destinationRouteId, routes],
  );

  async function saveNavigate() {
    setError(null);
    setMessage(null);
    try {
      const config = electroCraftNavigateActionConfigSchema.parse({
        schemaVersion: 1,
        action: 'navigate',
        mode,
        destination: mode === 'back' ? null : { kind: 'route', routeRef: destinationRouteId },
        params:
          mode === 'back' || !destinationRoute
            ? []
            : destinationRoute.params.flatMap((param) => {
                const raw = paramValues[param.name]?.trim() ?? '';
                if (!raw) return [];
                return [{ param: param.name, value: { source: 'literal', value: parseLiteral(param, raw) } }];
              }),
      });
      const result = await routeNavigationActionRuntime.createNavigateAction(sourceRoute.id, config);
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la Acción Navegar.');
    }
  }

  async function saveExternal() {
    setError(null);
    setMessage(null);
    try {
      const config = electroCraftExternalUrlActionConfigSchema.parse({
        schemaVersion: 1,
        action: 'external-url',
        url: externalUrl,
        mode: externalMode,
      });
      const result = await routeNavigationActionRuntime.createExternalUrlAction(sourceRoute.id, config);
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el enlace externo.');
    }
  }

  return (
    <div className="ec-route-action-editor" data-route-action-editor>
      <section className="ec-route-detail" aria-labelledby="route-detail-title">
        <div className="ec-route-detail-heading">
          <h4 id="route-detail-title">Ruta</h4>
          <HelpTrigger helpId="help.navigation.routes" />
        </div>
        <dl>
          <dt>Path</dt>
          <dd>
            <code>{sourceRoute.path}</code>
          </dd>
          <dt>Parámetros</dt>
          <dd>{sourceRoute.params.length}</dd>
          <dt>Enlace profundo</dt>
          <dd>{sourceRoute.deepLink.enabled ? 'Activo' : 'Desactivado'}</dd>
          <dt>Guards</dt>
          <dd>{sourceRoute.guards.length}</dd>
          <dt>Acciones</dt>
          <dd>{sourceRoute.actionRefs.length}</dd>
        </dl>
        {sourceRoute.params.length > 0 ? (
          <ul className="ec-route-param-list" aria-label="Parámetros de Ruta">
            {sourceRoute.params.map((param) => (
              <li key={param.name}>
                <code>{param.name}</code>
                <span>
                  {param.source} · {param.valueType}
                  {param.required ? ' · requerido' : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {sourceRoute.deepLink.aliases.length > 0 ? (
          <ul className="ec-route-deep-link-list" aria-label="Enlaces profundos">
            {sourceRoute.deepLink.aliases.map((alias) => (
              <li key={alias}>
                <code>{alias}</code>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="ec-route-action-form" aria-labelledby="route-action-title">
        <h4 id="route-action-title">Inspector · Acciones · Navegar</h4>
        <label>
          <span>Acción</span>
          <Select value={actionType} onValueChange={(value) => setActionType(value as 'navigate' | 'external-url')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="navigate">Navegar</SelectItem>
              <SelectItem value="external-url">Abrir enlace externo</SelectItem>
            </SelectContent>
          </Select>
        </label>

        {actionType === 'navigate' ? (
          <>
            <label>
              <span>Modo</span>
              <Select value={mode} onValueChange={(value) => setMode(value as 'push' | 'replace' | 'back')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Destino</SelectItem>
                  <SelectItem value="replace">Reemplazar</SelectItem>
                  <SelectItem value="back">Volver</SelectItem>
                </SelectContent>
              </Select>
            </label>
            {mode !== 'back' ? (
              <label>
                <span>Destino</span>
                <Select value={destinationRouteId} onValueChange={setDestinationRouteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Ruta" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} · {route.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            ) : null}

            {mode !== 'back' && destinationRoute?.params.length ? (
              <fieldset>
                <legend>Parámetros</legend>
                {destinationRoute.params.map((param) => (
                  <label key={param.name}>
                    <span>
                      {param.name}
                      {param.required ? ' *' : ''} · {param.valueType}
                    </span>
                    {param.valueType === 'boolean' ? (
                      <Select
                        value={paramValues[param.name] ?? ''}
                        onValueChange={(value) => setParamValues((current) => ({ ...current, [param.name]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={param.required ? 'Seleccionar' : 'Sin valor'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">true</SelectItem>
                          <SelectItem value="false">false</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={param.valueType === 'number' ? 'number' : 'text'}
                        value={paramValues[param.name] ?? ''}
                        onChange={(event) =>
                          setParamValues((current) => ({ ...current, [param.name]: event.target.value }))
                        }
                        placeholder={param.required ? 'Requerido' : 'Opcional'}
                      />
                    )}
                  </label>
                ))}
              </fieldset>
            ) : null}
            <Button onClick={() => void saveNavigate()}>Guardar Acción Navegar</Button>
          </>
        ) : (
          <>
            <label>
              <span>URL externa</span>
              <Input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} inputMode="url" />
            </label>
            <label>
              <span>Apertura</span>
              <Select
                value={externalMode}
                onValueChange={(value) => setExternalMode(value as 'same-context' | 'new-context')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same-context">Mismo contexto</SelectItem>
                  <SelectItem value="new-context">Nuevo contexto</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <Button onClick={() => void saveExternal()}>Guardar enlace externo</Button>
          </>
        )}

        {error ? (
          <p className="ec-route-action-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="ec-route-action-success" role="status">
            {message}
          </p>
        ) : null}
      </section>

      <RouteGuardEditor route={sourceRoute} routes={routes} />
    </div>
  );
}
