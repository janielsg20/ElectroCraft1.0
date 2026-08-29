import {
  createDeterministicObjectId,
  electroCraftRouteAccessConfigSchema,
  electroCraftRouteDefinitionV2Schema,
  routeGuardFromAccessConfig,
  validateRouteGuardRedirectLoops,
  type ElectroCraftRouteAccessConfig,
  type ElectroCraftRouteDefinition,
} from '@electrocraft/domain';

export function applyRouteAccessConfig(input: {
  readonly route: ElectroCraftRouteDefinition;
  readonly config: ElectroCraftRouteAccessConfig;
  readonly routes: readonly ElectroCraftRouteDefinition[];
}): ElectroCraftRouteDefinition {
  const route = electroCraftRouteDefinitionV2Schema.parse(input.route);
  const config = electroCraftRouteAccessConfigSchema.parse(input.config);
  if (config.redirectRouteRef === route.id) throw new TypeError('Una Ruta no puede redirigirse a sí misma.');
  if (config.redirectRouteRef && !input.routes.some(({ id }) => id === config.redirectRouteRef)) {
    throw new TypeError('La Ruta de redirección no existe.');
  }

  const guardId = createDeterministicObjectId('route-guard', `${route.id}:access`);
  const guard = routeGuardFromAccessConfig(route, config, guardId);
  const nextRoute = electroCraftRouteDefinitionV2Schema.parse({
    ...route,
    version: route.version + 1,
    guards: guard ? [guard] : [],
  });
  const routes = input.routes.map((current) => (current.id === route.id ? nextRoute : current));
  const loops = validateRouteGuardRedirectLoops(routes);
  if (loops.length > 0) {
    throw new TypeError(`La redirección crearía un ciclo: ${loops.map(({ routeRef }) => routeRef).join(', ')}`);
  }
  return nextRoute;
}

export interface PreviewRouteAccessContext {
  readonly authenticated: boolean;
  readonly allowedPolicyRefs: readonly string[];
  readonly passedConditionActionRefs: readonly string[];
}

export interface PreviewRouteAccessDecision {
  readonly allowed: boolean;
  readonly reason: 'public' | 'authentication-required' | 'permission-denied' | 'condition-failed' | 'allowed';
  readonly redirectRouteRef: string | null;
}

/**
 * F07 contract adapter only. F12 will connect the real auth/permission evaluator.
 * This remains fail-closed for protected guards and never hides UI as enforcement.
 */
export function evaluateRouteAccessPreview(
  routeInput: ElectroCraftRouteDefinition,
  context: PreviewRouteAccessContext,
): PreviewRouteAccessDecision {
  const route = electroCraftRouteDefinitionV2Schema.parse(routeInput);
  const guard = route.guards[0];
  if (!guard) return Object.freeze({ allowed: true, reason: 'public', redirectRouteRef: null });

  if (guard.kind === 'authentication' && !context.authenticated) {
    return Object.freeze({
      allowed: false,
      reason: 'authentication-required',
      redirectRouteRef: guard.redirectRouteRef,
    });
  }
  if (guard.kind === 'permission') {
    const allowed = guard.policyRef !== null && context.allowedPolicyRefs.includes(guard.policyRef);
    if (!allowed) {
      return Object.freeze({ allowed: false, reason: 'permission-denied', redirectRouteRef: guard.redirectRouteRef });
    }
  }
  if (guard.kind === 'custom') {
    const allowed = guard.actionRef !== null && context.passedConditionActionRefs.includes(guard.actionRef);
    if (!allowed) {
      return Object.freeze({ allowed: false, reason: 'condition-failed', redirectRouteRef: guard.redirectRouteRef });
    }
  }
  return Object.freeze({ allowed: true, reason: 'allowed', redirectRouteRef: null });
}
