import {
  createDeterministicObjectId,
  electroCraftActionGraphSchema,
  electroCraftExternalUrlActionConfigSchema,
  electroCraftNavigateActionConfigSchema,
  electroCraftRouteDefinitionV2Schema,
  electroCraftRouteParamBindingSchema,
  routeParamAcceptsLiteral,
  type ElectroCraftActionGraph,
  type ElectroCraftDocument,
  type ElectroCraftExternalUrlActionConfig,
  type ElectroCraftNavigateActionConfig,
  type ElectroCraftRouteDefinition,
  type ElectroCraftRouteParamBinding,
  type JsonValue,
} from '@electrocraft/domain';

export type RouteParamBindingDiagnosticCode =
  | 'binding-route-mismatch'
  | 'binding-param-missing'
  | 'binding-type-mismatch';

export interface RouteParamBindingDiagnostic {
  readonly code: RouteParamBindingDiagnosticCode;
  readonly param: string;
}

export function validateRouteParamBinding(
  bindingInput: unknown,
  routeInput: unknown,
): readonly RouteParamBindingDiagnostic[] {
  const binding = electroCraftRouteParamBindingSchema.parse(bindingInput);
  const route = electroCraftRouteDefinitionV2Schema.parse(routeInput);
  const diagnostics: RouteParamBindingDiagnostic[] = [];
  if (binding.routeRef !== route.id) diagnostics.push({ code: 'binding-route-mismatch', param: binding.param });
  const param = route.params.find(({ name }) => name === binding.param);
  if (!param) diagnostics.push({ code: 'binding-param-missing', param: binding.param });
  else if (param.valueType !== binding.valueType) diagnostics.push({ code: 'binding-type-mismatch', param: binding.param });
  return Object.freeze(diagnostics);
}

export type NavigateActionDiagnosticCode =
  | 'destination-route-missing'
  | 'destination-screen-missing'
  | 'destination-screen-route-ambiguous'
  | 'required-param-missing'
  | 'unknown-param'
  | 'literal-type-mismatch'
  | 'binding-route-missing'
  | 'binding-param-missing'
  | 'binding-type-mismatch';

export interface NavigateActionDiagnostic {
  readonly code: NavigateActionDiagnosticCode;
  readonly param?: string;
  readonly ref?: string;
}

function destinationRoute(
  config: ElectroCraftNavigateActionConfig,
  routes: readonly ElectroCraftRouteDefinition[],
  documents: readonly ElectroCraftDocument[],
  diagnostics: NavigateActionDiagnostic[],
) {
  if (config.mode === 'back' || config.destination === null) return null;
  if (config.destination.kind === 'route') {
    const route = routes.find(({ id }) => id === config.destination!.routeRef);
    if (!route) diagnostics.push({ code: 'destination-route-missing', ref: config.destination.routeRef });
    return route ?? null;
  }

  const screen = documents.find(({ id }) => id === config.destination!.screenRef && screen.kind === 'screen');
  if (!screen) {
    diagnostics.push({ code: 'destination-screen-missing', ref: config.destination.screenRef });
    return null;
  }
  const matching = routes.filter(({ screenRef }) => screenRef === screen.id);
  if (matching.length !== 1) {
    diagnostics.push({ code: 'destination-screen-route-ambiguous', ref: screen.id });
    return null;
  }
  return matching[0];
}

function bindingValueType(
  binding: Extract<ElectroCraftNavigateActionConfig['params'][number]['value'], { source: 'binding' }>['binding'],
  routes: readonly ElectroCraftRouteDefinition[],
  diagnostics: NavigateActionDiagnostic[],
) {
  if (binding.source !== 'route') return null;
  const sourceRoute = routes.find(({ id }) => id === binding.ref);
  if (!sourceRoute) {
    diagnostics.push({ code: 'binding-route-missing', ref: binding.ref });
    return null;
  }
  if (binding.path.length !== 2 || binding.path[0] !== 'params') {
    diagnostics.push({ code: 'binding-param-missing', ref: binding.ref });
    return null;
  }
  const paramName = binding.path[1];
  const param = sourceRoute.params.find(({ name }) => name === paramName);
  if (!param) {
    diagnostics.push({ code: 'binding-param-missing', ref: binding.ref, param: paramName });
    return null;
  }
  return param.valueType;
}

export function validateNavigateActionConfig(input: {
  readonly config: unknown;
  readonly routes: readonly ElectroCraftRouteDefinition[];
  readonly documents: readonly ElectroCraftDocument[];
}): readonly NavigateActionDiagnostic[] {
  const config = electroCraftNavigateActionConfigSchema.parse(input.config);
  const diagnostics: NavigateActionDiagnostic[] = [];
  const route = destinationRoute(config, input.routes, input.documents, diagnostics);
  if (!route) return Object.freeze(diagnostics);

  const mappings = new Map(config.params.map((mapping) => [mapping.param, mapping] as const));
  for (const mapping of config.params) {
    const targetParam = route.params.find(({ name }) => name === mapping.param);
    if (!targetParam) {
      diagnostics.push({ code: 'unknown-param', param: mapping.param });
      continue;
    }
    if (mapping.value.source === 'literal') {
      if (!routeParamAcceptsLiteral(targetParam, mapping.value.value)) {
        diagnostics.push({ code: 'literal-type-mismatch', param: mapping.param });
      }
    } else {
      const valueType = bindingValueType(mapping.value.binding, input.routes, diagnostics);
      if (valueType !== null && valueType !== targetParam.valueType) {
        diagnostics.push({ code: 'binding-type-mismatch', param: mapping.param });
      }
    }
  }
  for (const param of route.params) {
    if (param.required && !mappings.has(param.name)) diagnostics.push({ code: 'required-param-missing', param: param.name });
  }
  return Object.freeze(diagnostics);
}

function actionGraphRouteRefs(config: ElectroCraftNavigateActionConfig): string[] {
  const refs = new Set<string>();
  if (config.destination?.kind === 'route') refs.add(config.destination.routeRef);
  for (const mapping of config.params) {
    if (mapping.value.source === 'binding' && mapping.value.binding.source === 'route') refs.add(mapping.value.binding.ref);
  }
  return [...refs];
}

export function createRouteNavigateActionGraph(input: {
  readonly sourceRoute: ElectroCraftRouteDefinition;
  readonly config: ElectroCraftNavigateActionConfig;
  readonly idSeed: string;
}): ElectroCraftActionGraph {
  const config = electroCraftNavigateActionConfigSchema.parse(input.config);
  const graphId = createDeterministicObjectId('action-graph', `${input.sourceRoute.id}:navigate:${input.idSeed}`);
  const triggerId = createDeterministicObjectId('action-node', `${graphId}:trigger`);
  const actionId = createDeterministicObjectId('action-node', `${graphId}:navigate`);
  const edgeId = createDeterministicObjectId('action-edge', `${graphId}:edge`);
  return electroCraftActionGraphSchema.parse({
    schemaVersion: 1,
    id: graphId,
    version: 1,
    key: `navigate-${input.idSeed.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60) || 'action'}`,
    label: `Navegar desde ${input.sourceRoute.name}`,
    entryNodeRef: triggerId,
    nodes: [
      {
        id: triggerId,
        kind: 'trigger',
        type: 'event.route-action',
        config: { sourceRouteRef: input.sourceRoute.id },
        stateRefs: [],
        routeRefs: [input.sourceRoute.id],
        metadata: { source: 'm07.5-route-action' },
      },
      {
        id: actionId,
        kind: 'action',
        type: 'navigation.go',
        config: structuredClone(config) as unknown as Record<string, JsonValue>,
        stateRefs: [],
        routeRefs: actionGraphRouteRefs(config),
        metadata: { source: 'm07.5-route-action' },
      },
    ],
    edges: [
      { id: edgeId, sourceNodeRef: triggerId, targetNodeRef: actionId, sourcePort: 'next', targetPort: 'exec' },
    ],
    metadata: { source: 'm07.5-route-action', sourceRouteRef: input.sourceRoute.id },
  });
}

export function createExternalUrlActionGraph(input: {
  readonly sourceRoute: ElectroCraftRouteDefinition;
  readonly config: ElectroCraftExternalUrlActionConfig;
  readonly idSeed: string;
}): ElectroCraftActionGraph {
  const config = electroCraftExternalUrlActionConfigSchema.parse(input.config);
  const graphId = createDeterministicObjectId('action-graph', `${input.sourceRoute.id}:external:${input.idSeed}`);
  const triggerId = createDeterministicObjectId('action-node', `${graphId}:trigger`);
  const actionId = createDeterministicObjectId('action-node', `${graphId}:external`);
  const edgeId = createDeterministicObjectId('action-edge', `${graphId}:edge`);
  return electroCraftActionGraphSchema.parse({
    schemaVersion: 1,
    id: graphId,
    version: 1,
    key: `external-${input.idSeed.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 60) || 'action'}`,
    label: `Abrir enlace desde ${input.sourceRoute.name}`,
    entryNodeRef: triggerId,
    nodes: [
      {
        id: triggerId,
        kind: 'trigger',
        type: 'event.route-action',
        config: { sourceRouteRef: input.sourceRoute.id },
        stateRefs: [],
        routeRefs: [input.sourceRoute.id],
        metadata: { source: 'm07.5-external-action' },
      },
      {
        id: actionId,
        kind: 'action',
        type: 'navigation.external-url',
        config: structuredClone(config) as unknown as Record<string, JsonValue>,
        stateRefs: [],
        routeRefs: [],
        metadata: { source: 'm07.5-external-action' },
      },
    ],
    edges: [
      { id: edgeId, sourceNodeRef: triggerId, targetNodeRef: actionId, sourcePort: 'next', targetPort: 'exec' },
    ],
    metadata: { source: 'm07.5-external-action', sourceRouteRef: input.sourceRoute.id },
  });
}

export function attachActionGraphToRoute(
  routeInput: ElectroCraftRouteDefinition,
  actionGraph: ElectroCraftActionGraph,
): ElectroCraftRouteDefinition {
  const route = electroCraftRouteDefinitionV2Schema.parse(routeInput);
  return electroCraftRouteDefinitionV2Schema.parse({
    ...route,
    version: route.version + 1,
    actionRefs: [...new Set([...route.actionRefs, actionGraph.id])],
  });
}

export function createRouteParamBinding(input: {
  readonly route: ElectroCraftRouteDefinition;
  readonly param: string;
}): ElectroCraftRouteParamBinding {
  const route = electroCraftRouteDefinitionV2Schema.parse(input.route);
  const param = route.params.find(({ name }) => name === input.param);
  if (!param) throw new TypeError(`La Ruta no define el parámetro ${input.param}.`);
  return electroCraftRouteParamBindingSchema.parse({
    source: 'route',
    routeRef: route.id,
    param: param.name,
    valueType: param.valueType,
  });
}
