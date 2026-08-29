import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applyRouteAccessConfig, evaluateRouteAccessPreview } from '@electrocraft/application';
import {
  electroCraftRouteAccessConfigSchema,
  electroCraftRouteDefinitionV2Schema,
  routeAccessConfigFromGuards,
  validateRouteGuardRedirectLoops,
} from '@electrocraft/domain';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

function loginRoute() {
  const source = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
  return electroCraftRouteDefinitionV2Schema.parse({
    ...source,
    id: 'ec_route_0000000000006',
    version: 1,
    key: 'login',
    name: 'Iniciar sesión',
    path: '/login',
    params: [],
    guards: [],
    deepLink: { enabled: true, aliases: [], metadata: {} },
    actionRefs: [],
    stateRefs: [],
  });
}

describe('M07.6 route guards', () => {
  it('supports public, authenticated, permission and condition contracts', () => {
    expect(
      electroCraftRouteAccessConfigSchema.parse({
        schemaVersion: 1,
        mode: 'public',
        policyRef: null,
        conditionActionRef: null,
        redirectRouteRef: null,
      }).mode,
    ).toBe('public');
    expect(
      electroCraftRouteAccessConfigSchema.parse({
        schemaVersion: 1,
        mode: 'authenticated',
        policyRef: null,
        conditionActionRef: null,
        redirectRouteRef: 'ec_route_0000000000006',
      }).mode,
    ).toBe('authenticated');
    expect(
      electroCraftRouteAccessConfigSchema.parse({
        schemaVersion: 1,
        mode: 'permission',
        policyRef: 'ec_policy_000000000000k',
        conditionActionRef: null,
        redirectRouteRef: 'ec_route_0000000000006',
      }).mode,
    ).toBe('permission');
    expect(
      electroCraftRouteAccessConfigSchema.parse({
        schemaVersion: 1,
        mode: 'condition',
        policyRef: null,
        conditionActionRef: 'ec_action-graph_000000000000f',
        redirectRouteRef: 'ec_route_0000000000006',
      }).mode,
    ).toBe('condition');
  });

  it('applies authentication without implementing auth inside F07 and previews fail-closed', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    const login = loginRoute();
    const protectedRoute = applyRouteAccessConfig({
      route,
      routes: [route, login],
      config: {
        schemaVersion: 1,
        mode: 'authenticated',
        policyRef: null,
        conditionActionRef: null,
        redirectRouteRef: login.id,
      },
    });
    expect(routeAccessConfigFromGuards(protectedRoute)).toMatchObject({
      mode: 'authenticated',
      redirectRouteRef: login.id,
    });
    expect(
      evaluateRouteAccessPreview(protectedRoute, {
        authenticated: false,
        allowedPolicyRefs: [],
        passedConditionActionRefs: [],
      }),
    ).toEqual({ allowed: false, reason: 'authentication-required', redirectRouteRef: login.id });
    expect(
      evaluateRouteAccessPreview(protectedRoute, {
        authenticated: true,
        allowedPolicyRefs: [],
        passedConditionActionRefs: [],
      }).allowed,
    ).toBe(true);
  });

  it('uses permission references fail-closed in Preview', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    const login = loginRoute();
    const protectedRoute = applyRouteAccessConfig({
      route,
      routes: [route, login],
      config: {
        schemaVersion: 1,
        mode: 'permission',
        policyRef: 'ec_policy_000000000000k',
        conditionActionRef: null,
        redirectRouteRef: login.id,
      },
    });
    expect(
      evaluateRouteAccessPreview(protectedRoute, {
        authenticated: true,
        allowedPolicyRefs: [],
        passedConditionActionRefs: [],
      }).reason,
    ).toBe('permission-denied');
    expect(
      evaluateRouteAccessPreview(protectedRoute, {
        authenticated: true,
        allowedPolicyRefs: ['ec_policy_000000000000k'],
        passedConditionActionRefs: [],
      }).allowed,
    ).toBe(true);
  });

  it('prevents self redirects and multi-route redirect loops', () => {
    const route = electroCraftRouteDefinitionV2Schema.parse(fixture('route-v2'));
    const login = loginRoute();
    expect(() =>
      applyRouteAccessConfig({
        route,
        routes: [route, login],
        config: {
          schemaVersion: 1,
          mode: 'authenticated',
          policyRef: null,
          conditionActionRef: null,
          redirectRouteRef: route.id,
        },
      }),
    ).toThrow(/sí misma/);

    const first = applyRouteAccessConfig({
      route,
      routes: [route, login],
      config: {
        schemaVersion: 1,
        mode: 'authenticated',
        policyRef: null,
        conditionActionRef: null,
        redirectRouteRef: login.id,
      },
    });
    const secondUnsafe = electroCraftRouteDefinitionV2Schema.parse({
      ...login,
      guards: [
        {
          id: 'ec_route-guard_0000000000002',
          kind: 'authentication',
          policyRef: null,
          actionRef: null,
          redirectRouteRef: route.id,
          metadata: {},
        },
      ],
    });
    expect(validateRouteGuardRedirectLoops([first, secondUnsafe]).map(({ code }) => code)).toContain(
      'guard-redirect-loop',
    );
  });

  it('explains in Spanish that menu visibility is not security enforcement', () => {
    const ui = readFileSync(resolve('apps/studio/src/features/navigation/route-guard-editor.tsx'), 'utf8');
    for (const label of ['Acceso', 'Público', 'Requiere iniciar sesión', 'Permiso', 'Si no tiene acceso', 'Redirigir a']) {
      expect(ui).toContain(label);
    }
    expect(ui).toContain('Ocultar un elemento de Navegación no es control de seguridad');
    expect(ui).toContain('F12 conecta el evaluador real');
  });
});
