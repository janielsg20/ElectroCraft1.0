import * as z from 'zod';
import {
  electroCraftDataSchemaSchema,
  getDataField,
  getDataModel,
  type ElectroCraftDataField,
  type ElectroCraftDataSchema,
} from './data-definition';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from './json-value';
import { electroCraftObjectIdSchema, type ElectroCraftObjectId } from './object-id';

export const electroCraftBindingSourceSchema = z.enum([
  'data-source',
  'query',
  'state',
  'route',
  'user',
  'form',
  'action-output',
]);
export type ElectroCraftBindingSource = z.infer<typeof electroCraftBindingSourceSchema>;

export const electroCraftBindingRefSchema = z.strictObject({
  source: electroCraftBindingSourceSchema,
  ref: electroCraftObjectIdSchema,
  path: z.array(z.string().trim().min(1).max(120)).max(32),
  fallback: jsonValueSchema.optional(),
});
export type ElectroCraftBindingRef = z.infer<typeof electroCraftBindingRefSchema>;

export const electroCraftQueryOperatorSchema = z.enum([
  '=',
  '!=',
  '<',
  '<=',
  '>',
  '>=',
  'contains',
  'beginsWith',
  'endsWith',
]);
export type ElectroCraftQueryOperator = z.infer<typeof electroCraftQueryOperatorSchema>;

export const electroCraftQueryRuleSchema = z.strictObject({
  fieldRef: electroCraftObjectIdSchema,
  operator: electroCraftQueryOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  valueSource: z.literal('value'),
});
export type ElectroCraftQueryRule = z.infer<typeof electroCraftQueryRuleSchema>;

export interface ElectroCraftQueryGroup {
  combinator: 'and' | 'or';
  rules: Array<ElectroCraftQueryRule | ElectroCraftQueryGroup>;
}

export const electroCraftQueryGroupSchema: z.ZodType<ElectroCraftQueryGroup> = z.lazy(() =>
  z.strictObject({
    combinator: z.enum(['and', 'or']),
    rules: z
      .array(z.union([electroCraftQueryRuleSchema, electroCraftQueryGroupSchema]))
      .min(1)
      .max(200),
  }),
);

export const electroCraftQuerySortSchema = z.strictObject({
  fieldRef: electroCraftObjectIdSchema,
  direction: z.enum(['asc', 'desc']),
});

export const electroCraftQueryPaginationSchema = z.strictObject({
  mode: z.literal('offset'),
  limit: z.number().int().min(1).max(1000),
  offset: z.number().int().min(0),
});

export const electroCraftQueryCacheSchema = z.strictObject({
  policy: z.enum(['none', 'memory', 'revalidate']),
  ttlSeconds: z.number().int().min(0).max(86400),
});

export const electroCraftQueryDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: electroCraftObjectIdSchema,
  version: z.number().int().positive(),
  name: z.string().trim().min(1).max(160),
  sourceRef: electroCraftObjectIdSchema,
  dataSchemaRef: electroCraftObjectIdSchema,
  modelRef: electroCraftObjectIdSchema,
  operation: z.enum(['list', 'get', 'count']),
  resource: z.string().regex(/^[A-Za-z][A-Za-z0-9_.-]{0,119}$/),
  params: z.record(z.string().min(1).max(120), jsonValueSchema),
  conditions: electroCraftQueryGroupSchema,
  sort: z.array(electroCraftQuerySortSchema).max(20),
  pagination: electroCraftQueryPaginationSchema,
  cache: electroCraftQueryCacheSchema,
  metadata: electroCraftMetadataSchema,
});

export type ElectroCraftQueryDefinition = z.infer<typeof electroCraftQueryDefinitionSchema>;

export type QueryReferenceDiagnosticCode =
  | 'query-schema-mismatch'
  | 'query-source-mismatch'
  | 'unknown-query-model'
  | 'unknown-query-field'
  | 'unsupported-query-operator'
  | 'duplicate-sort-field';

export interface QueryReferenceDiagnostic {
  code: QueryReferenceDiagnosticCode;
  ownerId: ElectroCraftObjectId;
  ref?: ElectroCraftObjectId;
  path?: string;
}

const textOperators = new Set<ElectroCraftQueryOperator>(['=', '!=', 'contains', 'beginsWith', 'endsWith']);
const numberOperators = new Set<ElectroCraftQueryOperator>(['=', '!=', '<', '<=', '>', '>=']);
const booleanOperators = new Set<ElectroCraftQueryOperator>(['=', '!=']);
const dateOperators = new Set<ElectroCraftQueryOperator>(['=', '!=', '<', '<=', '>', '>=']);

function allowedOperators(field: ElectroCraftDataField): ReadonlySet<ElectroCraftQueryOperator> {
  if (field.type === 'text') return textOperators;
  if (field.type === 'number') return numberOperators;
  if (field.type === 'boolean') return booleanOperators;
  if (field.type === 'date' || field.type === 'datetime') return dateOperators;
  return new Set();
}

function visitRules(
  group: ElectroCraftQueryGroup,
  visitor: (rule: ElectroCraftQueryRule, path: string) => void,
  path = 'conditions',
): void {
  for (const [index, node] of group.rules.entries()) {
    const nodePath = `${path}.rules[${index}]`;
    if ('rules' in node) visitRules(node, visitor, nodePath);
    else visitor(node, nodePath);
  }
}

export function validateQueryDefinitionReferences(
  queryInput: unknown,
  schemaInput: unknown,
): QueryReferenceDiagnostic[] {
  const query = electroCraftQueryDefinitionSchema.parse(queryInput);
  const schema = electroCraftDataSchemaSchema.parse(schemaInput);
  const diagnostics: QueryReferenceDiagnostic[] = [];

  if (query.dataSchemaRef !== schema.id) {
    diagnostics.push({ code: 'query-schema-mismatch', ownerId: query.id, ref: query.dataSchemaRef });
  }
  if (query.sourceRef !== schema.sourceRef) {
    diagnostics.push({ code: 'query-source-mismatch', ownerId: query.id, ref: query.sourceRef });
  }

  const model = getDataModel(schema, query.modelRef);
  if (!model) {
    diagnostics.push({ code: 'unknown-query-model', ownerId: query.id, ref: query.modelRef });
    return diagnostics;
  }

  visitRules(query.conditions, (rule, path) => {
    const field = getDataField(model, rule.fieldRef);
    if (!field) {
      diagnostics.push({ code: 'unknown-query-field', ownerId: query.id, ref: rule.fieldRef, path });
      return;
    }
    if (!allowedOperators(field).has(rule.operator)) {
      diagnostics.push({ code: 'unsupported-query-operator', ownerId: query.id, ref: rule.fieldRef, path });
    }
  });

  const seenSortFields = new Set<ElectroCraftObjectId>();
  for (const [index, sort] of query.sort.entries()) {
    const field = getDataField(model, sort.fieldRef);
    if (!field) {
      diagnostics.push({
        code: 'unknown-query-field',
        ownerId: query.id,
        ref: sort.fieldRef,
        path: `sort[${index}]`,
      });
    }
    if (seenSortFields.has(sort.fieldRef)) {
      diagnostics.push({
        code: 'duplicate-sort-field',
        ownerId: query.id,
        ref: sort.fieldRef,
        path: `sort[${index}]`,
      });
    }
    seenSortFields.add(sort.fieldRef);
  }

  return diagnostics;
}

export interface ElectroCraftQueryResultRow {
  sourceId: ElectroCraftObjectId;
  recordId: string;
  modelId: ElectroCraftObjectId;
  data: Record<string, JsonValue>;
}

export interface ElectroCraftQueryResult {
  status: 'ready' | 'empty';
  rows: ElectroCraftQueryResultRow[];
  total: number;
}
