import * as z from 'zod';
import { electroCraftObjectIdSchema } from '../contracts/object-id';
import {
  electroCraftRouteDefinitionV2Schema,
  type ElectroCraftRouteDefinition,
  type ElectroCraftRouteGuard,
} from './index';

export const electroCraftRouteAccessModeSchema = z.enum(['public', 'authenticated', 'permission', 'condition']);
export type ElectroCraftRouteAccessMode = z.infer<typeof electroCraftRouteAccessModeSchema>;

export const electroCraftRouteAccessConfigSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    mode: electroCraftRouteAccessModeSchema,
    policyRef: electroCraftObjectIdSchema.nullable(),
    conditionActionRef: electroCraftObjectIdSchema.nullable(),
    redirectRouteRef: electroCraftObjectIdSchema.nullable(),
  })
  .superRefine((config, context) => {
    if (config.mode === 'public') {
      if (config.policyRef !== null || config.conditionActionRef !== null) {
        context.addIssue({
          code: 'custom',
          path: ['mode'],
          message: 'public access cannot reference permission/condition guards',
        });
      }
      return;
    }
    if (config.redirectRouteRef === null) {
      context.addIssue({
        code: 'custom',
        path: ['redirectRouteRef'],
        message: 'protected access requires a redirect route',
      });
    }
    if (config.mode === 'permission' && config.policyRef === null) {
      context.addIssue({ code: 'custom', path: ['policyRef'], message: 'permission access requires policyRef' });
    }
    if (config.mode !== 'permission' && config.policyRef !== null) {
      context.addIssue({
        code: 'custom',
        path: ['policyRef'],
        message: 'policyRef is only valid for permission access',
      });
    }
    if (config.mode === 'condition' && config.conditionActionRef === null) {
      context.addIssue({
        code: 'custom',
        path: ['conditionActionRef'],
        message: 'condition access requires conditionActionRef',
      });
    }
    if (config.mode !== 'condition' && config.conditionActionRef !== null) {
      context.addIssue({
        code: 'custom',
        path: ['conditionActionRef'],
        message: 'conditionActionRef is only valid for condition access',
      });
    }
  });
export type ElectroCraftRouteAccessConfig = z.infer<typeof electroCraftRouteAccessConfigSchema>;

export function routeAccessConfigFromGuards(routeInput: unknown): ElectroCraftRouteAccessConfig {
  const route = electroCraftRouteDefinitionV2Schema.parse(routeInput);
  const guard = route.guards[0];
  if (!guard) {
    return electroCraftRouteAccessConfigSchema.parse({
      schemaVersion: 1,
      mode: 'public',
      policyRef: null,
      conditionActionRef: null,
      redirectRouteRef: null,
    });
  }
  if (guard.kind === 'authentication') {
    return electroCraftRouteAccessConfigSchema.parse({
      schemaVersion: 1,
      mode: 'authenticated',
      policyRef: null,
      conditionActionRef: null,
      redirectRouteRef: guard.redirectRouteRef,
    });
  }
  if (guard.kind === 'permission') {
    return electroCraftRouteAccessConfigSchema.parse({
      schemaVersion: 1,
      mode: 'permission',
      policyRef: guard.policyRef,
      conditionActionRef: null,
      redirectRouteRef: guard.redirectRouteRef,
    });
  }
  return electroCraftRouteAccessConfigSchema.parse({
    schemaVersion: 1,
    mode: 'condition',
    policyRef: null,
    conditionActionRef: guard.actionRef,
    redirectRouteRef: guard.redirectRouteRef,
  });
}

export interface RouteGuardRedirectDiagnostic {
  readonly code: 'guard-redirect-loop';
  readonly routeRef: string;
  readonly redirectRouteRef: string;
}

function firstRedirect(route: ElectroCraftRouteDefinition) {
  return route.guards.find(({ redirectRouteRef }) => redirectRouteRef !== null)?.redirectRouteRef ?? null;
}

export function validateRouteGuardRedirectLoops(
  routesInput: readonly ElectroCraftRouteDefinition[],
): readonly RouteGuardRedirectDiagnostic[] {
  const routes = routesInput.map((route) => electroCraftRouteDefinitionV2Schema.parse(route));
  const routesById = new Map(routes.map((route) => [route.id, route] as const));
  const diagnostics: RouteGuardRedirectDiagnostic[] = [];
  const reported = new Set<string>();

  for (const route of routes) {
    const visited = new Set<string>([route.id]);
    let current: ElectroCraftRouteDefinition | undefined = route;
    while (current) {
      const redirect = firstRedirect(current);
      if (!redirect) break;
      if (visited.has(redirect)) {
        const key = `${route.id}:${redirect}`;
        if (!reported.has(key)) {
          diagnostics.push({ code: 'guard-redirect-loop', routeRef: route.id, redirectRouteRef: redirect });
          reported.add(key);
        }
        break;
      }
      visited.add(redirect);
      current = routesById.get(redirect);
    }
  }
  return Object.freeze(diagnostics);
}

export function routeGuardFromAccessConfig(
  route: ElectroCraftRouteDefinition,
  config: ElectroCraftRouteAccessConfig,
  guardId: string,
): ElectroCraftRouteGuard | null {
  if (config.mode === 'public') return null;
  const kind =
    config.mode === 'authenticated' ? 'authentication' : config.mode === 'permission' ? 'permission' : 'custom';
  return {
    id: guardId as ElectroCraftRouteGuard['id'],
    kind,
    policyRef: config.mode === 'permission' ? config.policyRef : null,
    actionRef: config.mode === 'condition' ? config.conditionActionRef : null,
    redirectRouteRef: config.redirectRouteRef,
    metadata: { source: 'm07.6-access', routeRef: route.id },
  };
}
