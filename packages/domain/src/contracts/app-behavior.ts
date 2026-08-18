import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

const canonicalKeySchema = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/);
const adapterTypeSchema = z.string().regex(/^[a-z][a-z0-9.-]{1,119}$/);

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    else seen.add(value);
  }
  return [...duplicates].sort();
}

export const electroCraftActionNodeKindSchema = z.enum(['trigger', 'condition', 'action', 'data']);
export type ElectroCraftActionNodeKind = z.infer<typeof electroCraftActionNodeKindSchema>;

export const electroCraftActionNodeSchema = z.strictObject({
  id: electroCraftObjectIdSchema,
  kind: electroCraftActionNodeKindSchema,
  type: adapterTypeSchema,
  config: z.record(z.string().min(1).max(120), jsonValueSchema),
  stateRefs: z.array(electroCraftObjectIdSchema),
  routeRefs: z.array(electroCraftObjectIdSchema),
  metadata: electroCraftMetadataSchema,
});
export type ElectroCraftActionNode = z.infer<typeof electroCraftActionNodeSchema>;

export const electroCraftActionEdgeSchema = z.strictObject({
  id: electroCraftObjectIdSchema,
  sourceNodeRef: electroCraftObjectIdSchema,
  targetNodeRef: electroCraftObjectIdSchema,
  sourcePort: z.string().trim().min(1).max(80),
  targetPort: z.string().trim().min(1).max(80),
});
export type ElectroCraftActionEdge = z.infer<typeof electroCraftActionEdgeSchema>;

export const electroCraftActionGraphSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: canonicalKeySchema,
    label: z.string().trim().min(1).max(160),
    entryNodeRef: electroCraftObjectIdSchema,
    nodes: z.array(electroCraftActionNodeSchema).min(1).max(500),
    edges: z.array(electroCraftActionEdgeSchema).max(2_000),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((graph, context) => {
    const nodeIds = new Set<ElectroCraftObjectId>();
    for (const [index, node] of graph.nodes.entries()) {
      if (nodeIds.has(node.id)) {
        context.addIssue({ code: 'custom', path: ['nodes', index, 'id'], message: 'duplicate action node id' });
      }
      nodeIds.add(node.id);
      for (const duplicate of duplicateValues(node.stateRefs)) {
        context.addIssue({
          code: 'custom',
          path: ['nodes', index, 'stateRefs'],
          message: `duplicate action state ref: ${duplicate}`,
        });
      }
      for (const duplicate of duplicateValues(node.routeRefs)) {
        context.addIssue({
          code: 'custom',
          path: ['nodes', index, 'routeRefs'],
          message: `duplicate action route ref: ${duplicate}`,
        });
      }
    }

    const entry = graph.nodes.find(({ id }) => id === graph.entryNodeRef);
    if (!entry) {
      context.addIssue({ code: 'custom', path: ['entryNodeRef'], message: 'entryNodeRef must reference a graph node' });
    } else if (entry.kind !== 'trigger') {
      context.addIssue({
        code: 'custom',
        path: ['entryNodeRef'],
        message: 'entryNodeRef must reference a trigger node',
      });
    }

    const edgeIds = new Set<ElectroCraftObjectId>();
    for (const [index, edge] of graph.edges.entries()) {
      if (edgeIds.has(edge.id)) {
        context.addIssue({ code: 'custom', path: ['edges', index, 'id'], message: 'duplicate action edge id' });
      }
      edgeIds.add(edge.id);
      if (!nodeIds.has(edge.sourceNodeRef)) {
        context.addIssue({
          code: 'custom',
          path: ['edges', index, 'sourceNodeRef'],
          message: 'sourceNodeRef must reference a graph node',
        });
      }
      if (!nodeIds.has(edge.targetNodeRef)) {
        context.addIssue({
          code: 'custom',
          path: ['edges', index, 'targetNodeRef'],
          message: 'targetNodeRef must reference a graph node',
        });
      }
    }
  });
export type ElectroCraftActionGraph = z.infer<typeof electroCraftActionGraphSchema>;

export const electroCraftStateScopeSchema = z.enum(['app', 'session', 'screen', 'component']);
export const electroCraftStateValueTypeSchema = z.enum(['string', 'number', 'boolean', 'json']);
export const electroCraftStatePersistenceSchema = z.enum(['none', 'session', 'local', 'secure']);

function matchesStateValueType(type: z.infer<typeof electroCraftStateValueTypeSchema>, value: JsonValue): boolean {
  if (type === 'string') return typeof value === 'string';
  if (type === 'number') return typeof value === 'number';
  if (type === 'boolean') return typeof value === 'boolean';
  return true;
}

export const electroCraftStateDefinitionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: canonicalKeySchema,
    label: z.string().trim().min(1).max(160),
    scope: electroCraftStateScopeSchema,
    valueType: electroCraftStateValueTypeSchema,
    defaultValue: jsonValueSchema,
    persistence: electroCraftStatePersistenceSchema,
    sensitive: z.boolean(),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((definition, context) => {
    if (!matchesStateValueType(definition.valueType, definition.defaultValue)) {
      context.addIssue({ code: 'custom', path: ['defaultValue'], message: 'defaultValue does not match valueType' });
    }
    if (definition.sensitive && (definition.persistence === 'local' || definition.persistence === 'session')) {
      context.addIssue({
        code: 'custom',
        path: ['persistence'],
        message: 'sensitive state cannot use local/session persistence; use secure or none',
      });
    }
    if (definition.scope === 'component' && definition.persistence !== 'none') {
      context.addIssue({
        code: 'custom',
        path: ['persistence'],
        message: 'component-scoped state cannot be persisted',
      });
    }
  });
export type ElectroCraftStateDefinition = z.infer<typeof electroCraftStateDefinitionSchema>;

export const electroCraftRouteDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: canonicalKeySchema,
  path: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine((path) => path.startsWith('/'), 'route path must start with /'),
  screenRef: electroCraftObjectIdSchema,
  parentRouteRef: electroCraftObjectIdSchema.nullable(),
  actionRefs: z.array(electroCraftObjectIdSchema),
  stateRefs: z.array(electroCraftObjectIdSchema),
  permissionPolicyRefs: z.array(electroCraftObjectIdSchema),
  metadata: electroCraftMetadataSchema,
});
export type ElectroCraftRouteDefinition = z.infer<typeof electroCraftRouteDefinitionSchema>;

export interface ElectroCraftNavigationItem {
  id: ElectroCraftObjectId;
  label: string;
  routeRef: ElectroCraftObjectId | null;
  children: ElectroCraftNavigationItem[];
}

export const electroCraftNavigationItemSchema: z.ZodType<ElectroCraftNavigationItem> = z.lazy(() =>
  z.strictObject({
    id: electroCraftObjectIdSchema,
    label: z.string().trim().min(1).max(120),
    routeRef: electroCraftObjectIdSchema.nullable(),
    children: z.array(electroCraftNavigationItemSchema).max(100),
  }),
);

function collectNavigationItemIds(items: readonly ElectroCraftNavigationItem[], ids: ElectroCraftObjectId[]): void {
  for (const item of items) {
    ids.push(item.id);
    collectNavigationItemIds(item.children, ids);
  }
}

export function collectNavigationRouteRefs(items: readonly ElectroCraftNavigationItem[]): ElectroCraftObjectId[] {
  const refs: ElectroCraftObjectId[] = [];
  for (const item of items) {
    if (item.routeRef !== null) refs.push(item.routeRef);
    refs.push(...collectNavigationRouteRefs(item.children));
  }
  return refs;
}

export const electroCraftNavigationDefinitionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: canonicalKeySchema,
    label: z.string().trim().min(1).max(160),
    items: z.array(electroCraftNavigationItemSchema).max(100),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((navigation, context) => {
    const ids: ElectroCraftObjectId[] = [];
    collectNavigationItemIds(navigation.items, ids);
    for (const duplicate of duplicateValues(ids)) {
      context.addIssue({ code: 'custom', path: ['items'], message: `duplicate navigation item id: ${duplicate}` });
    }
  });
export type ElectroCraftNavigationDefinition = z.infer<typeof electroCraftNavigationDefinitionSchema>;

export const electroCraftPermissionCapabilitySchema = z.enum([
  'read',
  'create',
  'update',
  'delete',
  'execute',
  'navigate',
  'manage',
]);
export const electroCraftPermissionResourceKindSchema = z.enum([
  'project',
  'document',
  'data-model',
  'field',
  'route',
  'action',
  'state',
]);

export const electroCraftPermissionTargetSchema = z.strictObject({
  kind: electroCraftPermissionResourceKindSchema,
  resourceRef: electroCraftObjectIdSchema.nullable(),
  fieldRef: electroCraftObjectIdSchema.nullable(),
});

export const electroCraftPermissionPolicySchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: canonicalKeySchema,
    label: z.string().trim().min(1).max(160),
    effect: z.enum(['allow', 'deny']),
    capabilities: z.array(electroCraftPermissionCapabilitySchema).min(1).max(7),
    targets: z.array(electroCraftPermissionTargetSchema).min(1).max(200),
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((policy, context) => {
    for (const [index, target] of policy.targets.entries()) {
      if (target.kind === 'field' && target.fieldRef === null) {
        context.addIssue({
          code: 'custom',
          path: ['targets', index, 'fieldRef'],
          message: 'field target requires fieldRef',
        });
      }
      if (target.kind !== 'field' && target.fieldRef !== null) {
        context.addIssue({
          code: 'custom',
          path: ['targets', index, 'fieldRef'],
          message: 'fieldRef is only valid for field targets',
        });
      }
    }
  });
export type ElectroCraftPermissionPolicy = z.infer<typeof electroCraftPermissionPolicySchema>;

export const electroCraftRoleSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  key: canonicalKeySchema,
  label: z.string().trim().min(1).max(160),
  permissionPolicyRefs: z.array(electroCraftObjectIdSchema),
  metadata: electroCraftMetadataSchema,
});
export type ElectroCraftRole = z.infer<typeof electroCraftRoleSchema>;

export type AppBehaviorReferenceDiagnosticCode =
  | 'missing-screen-ref'
  | 'missing-parent-route-ref'
  | 'missing-route-action-ref'
  | 'missing-route-state-ref'
  | 'missing-route-policy-ref'
  | 'missing-navigation-route-ref'
  | 'missing-action-state-ref'
  | 'missing-action-route-ref'
  | 'missing-role-policy-ref';

export interface AppBehaviorReferenceDiagnostic {
  code: AppBehaviorReferenceDiagnosticCode;
  ownerId: ElectroCraftObjectId;
  ref: ElectroCraftObjectId;
}
