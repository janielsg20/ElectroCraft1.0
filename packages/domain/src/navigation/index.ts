import * as z from 'zod';
import { type ElectroCraftDocument } from '../contracts/document';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from '../contracts/json-value';
import {
  createDeterministicObjectId,
  electroCraftObjectIdSchema,
  type ElectroCraftObjectId,
} from '../contracts/object-id';

const canonicalKeySchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/);
const routePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((path) => path.startsWith('/'), 'route path must start with /');

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates].sort();
}

function routePathParams(path: string): string[] {
  const params: string[] = [];
  const matcher = /:([A-Za-z][A-Za-z0-9_-]{0,79})/g;
  for (const match of path.matchAll(matcher)) params.push(match[1]);
  return params;
}

export const electroCraftRouteParamSourceSchema = z.enum(['path', 'query']);
export const electroCraftRouteParamValueTypeSchema = z.enum(['string', 'number', 'boolean']);

export const electroCraftRouteParamDefinitionSchema = z.strictObject({
  name: canonicalKeySchema,
  source: electroCraftRouteParamSourceSchema,
  valueType: electroCraftRouteParamValueTypeSchema,
  required: z.boolean(),
  defaultValue: jsonValueSchema.nullable(),
});
export type ElectroCraftRouteParamDefinition = z.infer<typeof electroCraftRouteParamDefinitionSchema>;

export const electroCraftRouteGuardKindSchema = z.enum(['authentication', 'permission', 'custom']);
export const electroCraftRouteGuardSchema = z
  .strictObject({
    id: electroCraftObjectIdSchema,
    kind: electroCraftRouteGuardKindSchema,
    policyRef: electroCraftObjectIdSchema.nullable(),
    actionRef: electroCraftObjectIdSchema.nullable(),
    redirectRouteRef: electroCraftObjectIdSchema.nullable(),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((guard, context) => {
    if (guard.kind === 'permission' && guard.policyRef === null) {
      context.addIssue({ code: 'custom', path: ['policyRef'], message: 'permission guard requires policyRef' });
    }
    if (guard.kind === 'custom' && guard.actionRef === null) {
      context.addIssue({ code: 'custom', path: ['actionRef'], message: 'custom guard requires actionRef' });
    }
  });
export type ElectroCraftRouteGuard = z.infer<typeof electroCraftRouteGuardSchema>;

export const electroCraftDeepLinkDefinitionSchema = z
  .strictObject({
    enabled: z.boolean(),
    aliases: z.array(routePathSchema).max(50),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((definition, context) => {
    for (const duplicate of duplicateValues(definition.aliases)) {
      context.addIssue({ code: 'custom', path: ['aliases'], message: `duplicate deep-link alias: ${duplicate}` });
    }
  });
export type ElectroCraftDeepLinkDefinition = z.infer<typeof electroCraftDeepLinkDefinitionSchema>;

export const electroCraftRouteDefinitionV2Schema = z
  .strictObject({
    schemaVersion: z.literal(2),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: canonicalKeySchema,
    name: z.string().trim().min(1).max(160),
    path: routePathSchema,
    screenRef: electroCraftObjectIdSchema,
    parentRouteRef: electroCraftObjectIdSchema.nullable(),
    params: z.array(electroCraftRouteParamDefinitionSchema).max(100),
    guards: z.array(electroCraftRouteGuardSchema).max(100),
    deepLink: electroCraftDeepLinkDefinitionSchema,
    actionRefs: z.array(electroCraftObjectIdSchema),
    stateRefs: z.array(electroCraftObjectIdSchema),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((route, context) => {
    for (const duplicate of duplicateValues(route.params.map(({ name }) => name))) {
      context.addIssue({ code: 'custom', path: ['params'], message: `duplicate route param: ${duplicate}` });
    }
    for (const duplicate of duplicateValues(route.guards.map(({ id }) => id))) {
      context.addIssue({ code: 'custom', path: ['guards'], message: `duplicate route guard id: ${duplicate}` });
    }
    for (const duplicate of duplicateValues(route.actionRefs)) {
      context.addIssue({ code: 'custom', path: ['actionRefs'], message: `duplicate route action ref: ${duplicate}` });
    }
    for (const duplicate of duplicateValues(route.stateRefs)) {
      context.addIssue({ code: 'custom', path: ['stateRefs'], message: `duplicate route state ref: ${duplicate}` });
    }

    const pathParams = routePathParams(route.path);
    for (const duplicate of duplicateValues(pathParams)) {
      context.addIssue({ code: 'custom', path: ['path'], message: `duplicate path param: ${duplicate}` });
    }
    for (const pathParam of pathParams) {
      const definition = route.params.find(({ name, source }) => name === pathParam && source === 'path');
      if (!definition) {
        context.addIssue({
          code: 'custom',
          path: ['params'],
          message: `missing path param definition: ${pathParam}`,
        });
      }
    }
    for (const [index, param] of route.params.entries()) {
      if (param.source === 'path' && !pathParams.includes(param.name)) {
        context.addIssue({
          code: 'custom',
          path: ['params', index],
          message: `path param is not present in route path: ${param.name}`,
        });
      }
      if (param.required && param.defaultValue !== null) {
        context.addIssue({
          code: 'custom',
          path: ['params', index, 'defaultValue'],
          message: 'required route params cannot define a defaultValue',
        });
      }
      if (param.defaultValue !== null) {
        const validDefault =
          (param.valueType === 'string' && typeof param.defaultValue === 'string') ||
          (param.valueType === 'number' && typeof param.defaultValue === 'number') ||
          (param.valueType === 'boolean' && typeof param.defaultValue === 'boolean');
        if (!validDefault) {
          context.addIssue({
            code: 'custom',
            path: ['params', index, 'defaultValue'],
            message: 'route param defaultValue does not match valueType',
          });
        }
      }
    }
  });

const legacyRouteDefinitionV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: canonicalKeySchema,
  path: routePathSchema,
  screenRef: electroCraftObjectIdSchema,
  parentRouteRef: electroCraftObjectIdSchema.nullable(),
  actionRefs: z.array(electroCraftObjectIdSchema),
  stateRefs: z.array(electroCraftObjectIdSchema),
  permissionPolicyRefs: z.array(electroCraftObjectIdSchema),
  metadata: electroCraftMetadataSchema,
});

type LegacyRouteDefinitionV1 = z.infer<typeof legacyRouteDefinitionV1Schema>;

function migrateLegacyRouteDefinition(route: LegacyRouteDefinitionV1) {
  const pathParams = routePathParams(route.path).map((name) => ({
    name,
    source: 'path' as const,
    valueType: 'string' as const,
    required: true,
    defaultValue: null,
  }));
  const guards = route.permissionPolicyRefs.map((policyRef, index) => ({
    id: createDeterministicObjectId('route-guard', `${route.id}:permission:${index}:${policyRef}`),
    kind: 'permission' as const,
    policyRef,
    actionRef: null,
    redirectRouteRef: null,
    metadata: { migratedFrom: 'route-v1' },
  }));
  return electroCraftRouteDefinitionV2Schema.parse({
    schemaVersion: 2,
    id: route.id,
    version: route.version,
    key: route.key,
    name: route.key,
    path: route.path,
    screenRef: route.screenRef,
    parentRouteRef: route.parentRouteRef,
    params: pathParams,
    guards,
    deepLink: { enabled: false, aliases: [], metadata: {} },
    actionRefs: route.actionRefs,
    stateRefs: route.stateRefs,
    metadata: route.metadata,
  });
}

export const electroCraftRouteDefinitionSchema = z.preprocess((input) => {
  const legacy = legacyRouteDefinitionV1Schema.safeParse(input);
  return legacy.success ? migrateLegacyRouteDefinition(legacy.data) : input;
}, electroCraftRouteDefinitionV2Schema);
export type ElectroCraftRouteDefinition = z.infer<typeof electroCraftRouteDefinitionV2Schema>;

export interface ElectroCraftRouteImportResult {
  readonly route: ElectroCraftRouteDefinition;
  readonly migratedFrom: 1 | null;
}

export function importElectroCraftRouteDefinition(input: unknown): ElectroCraftRouteImportResult {
  const canonical = electroCraftRouteDefinitionV2Schema.safeParse(input);
  if (canonical.success) return { route: canonical.data, migratedFrom: null };
  const legacy = legacyRouteDefinitionV1Schema.safeParse(input);
  if (!legacy.success) throw canonical.error;
  return { route: migrateLegacyRouteDefinition(legacy.data), migratedFrom: 1 };
}

export const electroCraftNavigatorKindSchema = z.enum(['stack', 'tabs', 'drawer', 'modal']);
export type ElectroCraftNavigatorKind = z.infer<typeof electroCraftNavigatorKindSchema>;

export const electroCraftNavigationScreenNodeSchema = z.strictObject({
  id: electroCraftObjectIdSchema,
  kind: z.literal('screen'),
  label: z.string().trim().min(1).max(160),
  routeRef: electroCraftObjectIdSchema,
  metadata: electroCraftMetadataSchema,
});
export type ElectroCraftNavigationScreenNode = z.infer<typeof electroCraftNavigationScreenNodeSchema>;

export const electroCraftNavigationNavigatorNodeSchema = z
  .strictObject({
    id: electroCraftObjectIdSchema,
    kind: electroCraftNavigatorKindSchema,
    label: z.string().trim().min(1).max(160),
    childRefs: z.array(electroCraftObjectIdSchema).max(250),
    initialNodeRef: electroCraftObjectIdSchema.nullable(),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((node, context) => {
    for (const duplicate of duplicateValues(node.childRefs)) {
      context.addIssue({ code: 'custom', path: ['childRefs'], message: `duplicate navigation child ref: ${duplicate}` });
    }
    if (node.initialNodeRef !== null && !node.childRefs.includes(node.initialNodeRef)) {
      context.addIssue({
        code: 'custom',
        path: ['initialNodeRef'],
        message: 'initialNodeRef must reference a direct child',
      });
    }
    if (node.initialNodeRef === null && node.childRefs.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['initialNodeRef'],
        message: 'navigator with children requires an initialNodeRef',
      });
    }
  });
export type ElectroCraftNavigationNavigatorNode = z.infer<typeof electroCraftNavigationNavigatorNodeSchema>;

export const electroCraftNavigationNodeSchema = z.union([
  electroCraftNavigationScreenNodeSchema,
  electroCraftNavigationNavigatorNodeSchema,
]);
export type ElectroCraftNavigationNode = z.infer<typeof electroCraftNavigationNodeSchema>;

export const electroCraftNavigationDefinitionV2Schema = z
  .strictObject({
    schemaVersion: z.literal(2),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: canonicalKeySchema,
    label: z.string().trim().min(1).max(160),
    rootNodeRef: electroCraftObjectIdSchema,
    nodes: z.array(electroCraftNavigationNodeSchema).min(1).max(500),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((navigation, context) => {
    const nodeIds = navigation.nodes.map(({ id }) => id);
    for (const duplicate of duplicateValues(nodeIds)) {
      context.addIssue({ code: 'custom', path: ['nodes'], message: `duplicate navigation node id: ${duplicate}` });
    }
    const nodesById = new Map(navigation.nodes.map((node) => [node.id, node] as const));
    const root = nodesById.get(navigation.rootNodeRef);
    if (!root) {
      context.addIssue({ code: 'custom', path: ['rootNodeRef'], message: 'rootNodeRef must reference a navigation node' });
    } else if (root.kind === 'screen') {
      context.addIssue({ code: 'custom', path: ['rootNodeRef'], message: 'rootNodeRef must reference a navigator node' });
    }
    for (const [index, node] of navigation.nodes.entries()) {
      if (node.kind === 'screen') continue;
      for (const childRef of node.childRefs) {
        if (!nodesById.has(childRef)) {
          context.addIssue({
            code: 'custom',
            path: ['nodes', index, 'childRefs'],
            message: `navigation child ref does not exist: ${childRef}`,
          });
        }
      }
    }
  });

interface LegacyNavigationItem {
  id: ElectroCraftObjectId;
  label: string;
  routeRef: ElectroCraftObjectId | null;
  children: LegacyNavigationItem[];
}

const legacyNavigationItemSchema: z.ZodType<LegacyNavigationItem> = z.lazy(() =>
  z.strictObject({
    id: electroCraftObjectIdSchema,
    label: z.string().trim().min(1).max(120),
    routeRef: electroCraftObjectIdSchema.nullable(),
    children: z.array(legacyNavigationItemSchema).max(100),
  }),
);

const legacyNavigationDefinitionV1Schema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: canonicalKeySchema,
  label: z.string().trim().min(1).max(160),
  items: z.array(legacyNavigationItemSchema).max(100),
  metadata: electroCraftMetadataSchema,
});

type LegacyNavigationDefinitionV1 = z.infer<typeof legacyNavigationDefinitionV1Schema>;

function migrateLegacyNavigationDefinition(legacy: LegacyNavigationDefinitionV1) {
  const nodes: ElectroCraftNavigationNode[] = [];

  const convertItem = (item: LegacyNavigationItem): ElectroCraftObjectId => {
    if (item.children.length === 0 && item.routeRef !== null) {
      nodes.push({ id: item.id, kind: 'screen', label: item.label, routeRef: item.routeRef, metadata: {} });
      return item.id;
    }

    const childRefs: ElectroCraftObjectId[] = [];
    if (item.routeRef !== null) {
      const screenNodeRef = createDeterministicObjectId('nav-node', `${legacy.id}:${item.id}:screen`);
      nodes.push({
        id: screenNodeRef,
        kind: 'screen',
        label: item.label,
        routeRef: item.routeRef,
        metadata: { migratedFrom: 'navigation-v1-item-route' },
      });
      childRefs.push(screenNodeRef);
    }
    for (const child of item.children) childRefs.push(convertItem(child));
    nodes.push({
      id: item.id,
      kind: 'stack',
      label: item.label,
      childRefs,
      initialNodeRef: childRefs[0] ?? null,
      metadata: { migratedFrom: 'navigation-v1-item' },
    });
    return item.id;
  };

  const topLevelRefs = legacy.items.map(convertItem);
  const rootNodeRef = createDeterministicObjectId('nav-node', `${legacy.id}:legacy-root`);
  nodes.push({
    id: rootNodeRef,
    kind: 'stack',
    label: legacy.label,
    childRefs: topLevelRefs,
    initialNodeRef: topLevelRefs[0] ?? null,
    metadata: { migratedFrom: 'navigation-v1-root' },
  });

  return electroCraftNavigationDefinitionV2Schema.parse({
    schemaVersion: 2,
    id: legacy.id,
    version: legacy.version,
    key: legacy.key,
    label: legacy.label,
    rootNodeRef,
    nodes,
    metadata: legacy.metadata,
  });
}

export const electroCraftNavigationDefinitionSchema = z.preprocess((input) => {
  const legacy = legacyNavigationDefinitionV1Schema.safeParse(input);
  return legacy.success ? migrateLegacyNavigationDefinition(legacy.data) : input;
}, electroCraftNavigationDefinitionV2Schema);
export type ElectroCraftNavigationDefinition = z.infer<typeof electroCraftNavigationDefinitionV2Schema>;

export interface ElectroCraftNavigationImportResult {
  readonly navigation: ElectroCraftNavigationDefinition;
  readonly migratedFrom: 1 | null;
}

export function importElectroCraftNavigationDefinition(input: unknown): ElectroCraftNavigationImportResult {
  const canonical = electroCraftNavigationDefinitionV2Schema.safeParse(input);
  if (canonical.success) return { navigation: canonical.data, migratedFrom: null };
  const legacy = legacyNavigationDefinitionV1Schema.safeParse(input);
  if (!legacy.success) throw canonical.error;
  return { navigation: migrateLegacyNavigationDefinition(legacy.data), migratedFrom: 1 };
}

export function collectNavigationRouteRefs(
  input: ElectroCraftNavigationDefinition | readonly ElectroCraftNavigationNode[],
): ElectroCraftObjectId[] {
  const nodes = Array.isArray(input) ? input : input.nodes;
  return nodes.filter((node): node is ElectroCraftNavigationScreenNode => node.kind === 'screen').map(({ routeRef }) => routeRef);
}

export type ElectroCraftNavigationDiagnosticCode =
  | 'duplicate-route-path'
  | 'duplicate-route-name'
  | 'missing-screen-ref'
  | 'invalid-screen-kind'
  | 'missing-parent-route-ref'
  | 'route-parent-cycle'
  | 'missing-guard-redirect-route'
  | 'navigation-cycle'
  | 'missing-navigation-node-ref'
  | 'invalid-initial-route'
  | 'missing-navigation-route-ref'
  | 'duplicate-navigation-route-ref';

export interface ElectroCraftNavigationDiagnostic {
  readonly code: ElectroCraftNavigationDiagnosticCode;
  readonly ownerId: ElectroCraftObjectId;
  readonly ref?: string;
}

export interface ElectroCraftNavigationGraphInput {
  readonly documents: readonly ElectroCraftDocument[];
  readonly routes: readonly ElectroCraftRouteDefinition[];
  readonly navigations: readonly ElectroCraftNavigationDefinition[];
}

function detectRouteParentCycles(
  routes: readonly ElectroCraftRouteDefinition[],
  diagnostics: ElectroCraftNavigationDiagnostic[],
) {
  const routesById = new Map(routes.map((route) => [route.id, route] as const));
  for (const route of routes) {
    const visited = new Set<ElectroCraftObjectId>();
    let current: ElectroCraftRouteDefinition | undefined = route;
    while (current?.parentRouteRef) {
      if (visited.has(current.parentRouteRef)) {
        diagnostics.push({ code: 'route-parent-cycle', ownerId: route.id, ref: current.parentRouteRef });
        break;
      }
      visited.add(current.parentRouteRef);
      current = routesById.get(current.parentRouteRef);
    }
  }
}

function validateNavigationCycles(
  navigation: ElectroCraftNavigationDefinition,
  diagnostics: ElectroCraftNavigationDiagnostic[],
) {
  const nodesById = new Map(navigation.nodes.map((node) => [node.id, node] as const));
  const completed = new Set<ElectroCraftObjectId>();
  const active = new Set<ElectroCraftObjectId>();
  const reported = new Set<string>();

  const visit = (nodeRef: ElectroCraftObjectId) => {
    if (active.has(nodeRef)) {
      const key = `${navigation.id}:${nodeRef}`;
      if (!reported.has(key)) {
        diagnostics.push({ code: 'navigation-cycle', ownerId: navigation.id, ref: nodeRef });
        reported.add(key);
      }
      return;
    }
    if (completed.has(nodeRef)) return;
    const node = nodesById.get(nodeRef);
    if (!node || node.kind === 'screen') {
      completed.add(nodeRef);
      return;
    }
    active.add(nodeRef);
    for (const childRef of node.childRefs) visit(childRef);
    active.delete(nodeRef);
    completed.add(nodeRef);
  };

  visit(navigation.rootNodeRef);
}

export function validateElectroCraftNavigationGraph(
  input: ElectroCraftNavigationGraphInput,
): ElectroCraftNavigationDiagnostic[] {
  const diagnostics: ElectroCraftNavigationDiagnostic[] = [];
  const documentsById = new Map(input.documents.map((document) => [document.id, document] as const));
  const routesById = new Map(input.routes.map((route) => [route.id, route] as const));

  const routesByPath = new Map<string, ElectroCraftObjectId>();
  const routesByName = new Map<string, ElectroCraftObjectId>();
  for (const route of input.routes) {
    const existingPath = routesByPath.get(route.path);
    if (existingPath) diagnostics.push({ code: 'duplicate-route-path', ownerId: route.id, ref: existingPath });
    else routesByPath.set(route.path, route.id);

    const normalizedName = route.name.toLocaleLowerCase('es');
    const existingName = routesByName.get(normalizedName);
    if (existingName) diagnostics.push({ code: 'duplicate-route-name', ownerId: route.id, ref: existingName });
    else routesByName.set(normalizedName, route.id);

    const screen = documentsById.get(route.screenRef);
    if (!screen) diagnostics.push({ code: 'missing-screen-ref', ownerId: route.id, ref: route.screenRef });
    else if (screen.kind !== 'screen') {
      diagnostics.push({ code: 'invalid-screen-kind', ownerId: route.id, ref: route.screenRef });
    }

    if (route.parentRouteRef !== null && !routesById.has(route.parentRouteRef)) {
      diagnostics.push({ code: 'missing-parent-route-ref', ownerId: route.id, ref: route.parentRouteRef });
    }
    for (const guard of route.guards) {
      if (guard.redirectRouteRef !== null && !routesById.has(guard.redirectRouteRef)) {
        diagnostics.push({ code: 'missing-guard-redirect-route', ownerId: route.id, ref: guard.redirectRouteRef });
      }
    }
  }
  detectRouteParentCycles(input.routes, diagnostics);

  for (const navigation of input.navigations) {
    const nodesById = new Map(navigation.nodes.map((node) => [node.id, node] as const));
    const root = nodesById.get(navigation.rootNodeRef);
    if (!root || root.kind === 'screen') {
      diagnostics.push({ code: 'missing-navigation-node-ref', ownerId: navigation.id, ref: navigation.rootNodeRef });
    }

    const routeRefs: string[] = [];
    for (const node of navigation.nodes) {
      if (node.kind === 'screen') {
        routeRefs.push(node.routeRef);
        if (!routesById.has(node.routeRef)) {
          diagnostics.push({ code: 'missing-navigation-route-ref', ownerId: navigation.id, ref: node.routeRef });
        }
        continue;
      }
      for (const childRef of node.childRefs) {
        if (!nodesById.has(childRef)) {
          diagnostics.push({ code: 'missing-navigation-node-ref', ownerId: navigation.id, ref: childRef });
        }
      }
      if (node.childRefs.length > 0 && (node.initialNodeRef === null || !node.childRefs.includes(node.initialNodeRef))) {
        diagnostics.push({
          code: 'invalid-initial-route',
          ownerId: navigation.id,
          ref: node.initialNodeRef ?? node.id,
        });
      }
    }
    for (const duplicate of duplicateValues(routeRefs)) {
      diagnostics.push({ code: 'duplicate-navigation-route-ref', ownerId: navigation.id, ref: duplicate });
    }
    validateNavigationCycles(navigation, diagnostics);
  }

  return diagnostics;
}

export function cloneJsonValue<T extends JsonValue>(value: T): T {
  return structuredClone(value);
}
