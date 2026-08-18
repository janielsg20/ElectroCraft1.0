import {
  collectNavigationRouteRefs,
  electroCraftActionGraphSchema,
  electroCraftDocumentSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftPermissionPolicySchema,
  electroCraftRoleSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
  type AppBehaviorReferenceDiagnostic,
  type ElectroCraftActionGraph,
  type ElectroCraftDocument,
  type ElectroCraftNavigationDefinition,
  type ElectroCraftPermissionPolicy,
  type ElectroCraftRole,
  type ElectroCraftRouteDefinition,
  type ElectroCraftStateDefinition,
} from '@electrocraft/domain';

export interface AppBehaviorGraph {
  documents: readonly ElectroCraftDocument[];
  routes: readonly ElectroCraftRouteDefinition[];
  navigations: readonly ElectroCraftNavigationDefinition[];
  actionGraphs: readonly ElectroCraftActionGraph[];
  states: readonly ElectroCraftStateDefinition[];
  policies: readonly ElectroCraftPermissionPolicy[];
  roles: readonly ElectroCraftRole[];
}

export function parseAppBehaviorGraph(input: {
  documents: readonly unknown[];
  routes: readonly unknown[];
  navigations: readonly unknown[];
  actionGraphs: readonly unknown[];
  states: readonly unknown[];
  policies: readonly unknown[];
  roles: readonly unknown[];
}): AppBehaviorGraph {
  return {
    documents: input.documents.map((value) => electroCraftDocumentSchema.parse(value)),
    routes: input.routes.map((value) => electroCraftRouteDefinitionSchema.parse(value)),
    navigations: input.navigations.map((value) => electroCraftNavigationDefinitionSchema.parse(value)),
    actionGraphs: input.actionGraphs.map((value) => electroCraftActionGraphSchema.parse(value)),
    states: input.states.map((value) => electroCraftStateDefinitionSchema.parse(value)),
    policies: input.policies.map((value) => electroCraftPermissionPolicySchema.parse(value)),
    roles: input.roles.map((value) => electroCraftRoleSchema.parse(value)),
  };
}

export function validateAppBehaviorGraph(graph: AppBehaviorGraph): AppBehaviorReferenceDiagnostic[] {
  const diagnostics: AppBehaviorReferenceDiagnostic[] = [];
  const documentIds = new Set(graph.documents.map(({ id }) => id));
  const routeIds = new Set(graph.routes.map(({ id }) => id));
  const actionIds = new Set(graph.actionGraphs.map(({ id }) => id));
  const stateIds = new Set(graph.states.map(({ id }) => id));
  const policyIds = new Set(graph.policies.map(({ id }) => id));

  for (const route of graph.routes) {
    if (!documentIds.has(route.screenRef)) {
      diagnostics.push({ code: 'missing-screen-ref', ownerId: route.id, ref: route.screenRef });
    }
    if (route.parentRouteRef !== null && !routeIds.has(route.parentRouteRef)) {
      diagnostics.push({ code: 'missing-parent-route-ref', ownerId: route.id, ref: route.parentRouteRef });
    }
    for (const ref of route.actionRefs) {
      if (!actionIds.has(ref)) diagnostics.push({ code: 'missing-route-action-ref', ownerId: route.id, ref });
    }
    for (const ref of route.stateRefs) {
      if (!stateIds.has(ref)) diagnostics.push({ code: 'missing-route-state-ref', ownerId: route.id, ref });
    }
    for (const ref of route.permissionPolicyRefs) {
      if (!policyIds.has(ref)) diagnostics.push({ code: 'missing-route-policy-ref', ownerId: route.id, ref });
    }
  }

  for (const navigation of graph.navigations) {
    for (const ref of collectNavigationRouteRefs(navigation.items)) {
      if (!routeIds.has(ref)) diagnostics.push({ code: 'missing-navigation-route-ref', ownerId: navigation.id, ref });
    }
  }

  for (const actionGraph of graph.actionGraphs) {
    for (const node of actionGraph.nodes) {
      for (const ref of node.stateRefs) {
        if (!stateIds.has(ref)) diagnostics.push({ code: 'missing-action-state-ref', ownerId: actionGraph.id, ref });
      }
      for (const ref of node.routeRefs) {
        if (!routeIds.has(ref)) diagnostics.push({ code: 'missing-action-route-ref', ownerId: actionGraph.id, ref });
      }
    }
  }

  for (const role of graph.roles) {
    for (const ref of role.permissionPolicyRefs) {
      if (!policyIds.has(ref)) diagnostics.push({ code: 'missing-role-policy-ref', ownerId: role.id, ref });
    }
  }

  return diagnostics;
}
