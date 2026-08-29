import * as z from 'zod';
import { jsonValueSchema, type JsonValue } from '../contracts/json-value';

export const electroCraftRestMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
export type ElectroCraftRestMethod = z.infer<typeof electroCraftRestMethodSchema>;

export const electroCraftDataOperationKindSchema = z.enum(['read', 'create', 'update', 'delete']);
export type ElectroCraftDataOperationKind = z.infer<typeof electroCraftDataOperationKindSchema>;

export const electroCraftRestParameterLocationSchema = z.enum(['path', 'query', 'header']);
export type ElectroCraftRestParameterLocation = z.infer<typeof electroCraftRestParameterLocationSchema>;

export const electroCraftRestParameterValueTypeSchema = z.enum(['string', 'number', 'boolean', 'array', 'json']);
export type ElectroCraftRestParameterValueType = z.infer<typeof electroCraftRestParameterValueTypeSchema>;

export const electroCraftRestPaginationHintSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('none') }),
  z.strictObject({
    kind: z.literal('page'),
    pageParam: z.string().trim().min(1).max(120),
    pageSizeParam: z.string().trim().min(1).max(120).nullable(),
  }),
  z.strictObject({
    kind: z.literal('offset'),
    offsetParam: z.string().trim().min(1).max(120),
    limitParam: z.string().trim().min(1).max(120).nullable(),
  }),
  z.strictObject({
    kind: z.literal('cursor'),
    cursorParam: z.string().trim().min(1).max(120),
    nextCursorPath: z.string().trim().min(1).max(240),
  }),
]);
export type ElectroCraftRestPaginationHint = z.infer<typeof electroCraftRestPaginationHintSchema>;

const sensitiveHeaderPattern = /^(?:authorization|proxy-authorization|cookie|set-cookie|x-api-key|api-key)$/i;

export function isSensitiveRestHeaderName(name: string) {
  return sensitiveHeaderPattern.test(name.trim());
}

export const electroCraftRestParameterSchema = z
  .strictObject({
    name: z.string().trim().min(1).max(120),
    location: electroCraftRestParameterLocationSchema,
    required: z.boolean(),
    valueType: electroCraftRestParameterValueTypeSchema,
  })
  .superRefine((parameter, context) => {
    if (parameter.location === 'header' && isSensitiveRestHeaderName(parameter.name)) {
      context.addIssue({
        code: 'custom',
        path: ['name'],
        message: 'sensitive authentication headers must use authRef/Gateway',
      });
    }
  });
export type ElectroCraftRestParameter = z.infer<typeof electroCraftRestParameterSchema>;

export const electroCraftDataOperationDefinitionSchema = z
  .strictObject({
    id: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    kind: electroCraftDataOperationKindSchema,
    method: electroCraftRestMethodSchema,
    path: z.string().trim().min(1).max(500).refine((value) => value.startsWith('/'), 'REST operation path must start with /'),
    requiresAuth: z.boolean(),
    parameters: z.array(electroCraftRestParameterSchema).max(100),
    inputSchema: jsonValueSchema.nullable(),
    outputSchema: jsonValueSchema.nullable(),
    pagination: electroCraftRestPaginationHintSchema,
  })
  .superRefine((operation, context) => {
    const seen = new Set<string>();
    for (const [index, parameter] of operation.parameters.entries()) {
      const key = `${parameter.location}:${parameter.name}`;
      if (seen.has(key)) {
        context.addIssue({ code: 'custom', path: ['parameters', index], message: 'duplicate REST parameter' });
      }
      seen.add(key);
      if (parameter.location === 'path' && !operation.path.includes(`{${parameter.name}}`)) {
        context.addIssue({
          code: 'custom',
          path: ['parameters', index, 'name'],
          message: 'path parameter must appear in operation path',
        });
      }
    }
  });
export type ElectroCraftDataOperationDefinition = z.infer<typeof electroCraftDataOperationDefinitionSchema>;

const restDefaultHeadersSchema = z.record(z.string().trim().min(1).max(120), z.string().max(4000)).superRefine((headers, context) => {
  for (const name of Object.keys(headers)) {
    if (isSensitiveRestHeaderName(name)) {
      context.addIssue({
        code: 'custom',
        path: [name],
        message: 'sensitive authentication headers must use authRef/Gateway',
      });
    }
  }
});

export const electroCraftRestExecutionModeSchema = z.enum(['auto', 'browser', 'gateway']);
export type ElectroCraftRestExecutionMode = z.infer<typeof electroCraftRestExecutionModeSchema>;

export const electroCraftRestDataSourceConfigSchema = z.strictObject({
  baseUrl: z.string().url().refine((value) => /^https?:\/\//i.test(value), 'REST baseUrl must use http or https'),
  defaultHeaders: restDefaultHeadersSchema.default({}),
  timeoutMs: z.number().int().min(100).max(120_000).default(15_000),
  executionMode: electroCraftRestExecutionModeSchema.default('auto'),
  operations: z.array(electroCraftDataOperationDefinitionSchema).max(500),
});
export type ElectroCraftRestDataSourceConfig = z.infer<typeof electroCraftRestDataSourceConfigSchema>;

export interface ElectroCraftRestDataResult {
  readonly ok: boolean;
  readonly status: number | null;
  readonly data: JsonValue | null;
  readonly pagination: Readonly<Record<string, JsonValue>> | null;
  readonly error: {
    readonly code: string;
    readonly message: string;
  } | null;
  readonly transport: 'browser' | 'gateway';
}
