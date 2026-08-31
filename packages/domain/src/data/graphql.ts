import * as z from 'zod';
import { jsonValueSchema, type JsonValue } from '../contracts/json-value';
import { electroCraftDataOperationKindSchema, electroCraftRestExecutionModeSchema } from './rest';

export const electroCraftGraphQLOperationTypeSchema = z.enum(['query', 'mutation']);
export type ElectroCraftGraphQLOperationType = z.infer<typeof electroCraftGraphQLOperationTypeSchema>;

export const electroCraftGraphQLVariableValueTypeSchema = z.enum(['string', 'number', 'boolean', 'array', 'json']);
export type ElectroCraftGraphQLVariableValueType = z.infer<typeof electroCraftGraphQLVariableValueTypeSchema>;

export const electroCraftGraphQLVariableSchema = z.strictObject({
  name: z.string().regex(/^[_A-Za-z][_0-9A-Za-z]{0,79}$/),
  graphQLType: z.string().trim().min(1).max(160),
  valueType: electroCraftGraphQLVariableValueTypeSchema,
  required: z.boolean(),
  defaultValue: jsonValueSchema.optional(),
});
export type ElectroCraftGraphQLVariable = z.infer<typeof electroCraftGraphQLVariableSchema>;

export const electroCraftGraphQLOperationDefinitionSchema = z
  .strictObject({
    id: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    operationType: electroCraftGraphQLOperationTypeSchema,
    kind: electroCraftDataOperationKindSchema,
    fieldName: z.string().regex(/^[_A-Za-z][_0-9A-Za-z]{0,79}$/),
    document: z.string().trim().min(1).max(50_000),
    requiresAuth: z.boolean(),
    variables: z.array(electroCraftGraphQLVariableSchema).max(100),
    outputSchema: jsonValueSchema.nullable(),
  })
  .superRefine((operation, context) => {
    if (operation.operationType === 'query' && operation.kind !== 'read') {
      context.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'GraphQL query operations must use read capability',
      });
    }
    if (operation.operationType === 'mutation' && operation.kind === 'read') {
      context.addIssue({
        code: 'custom',
        path: ['kind'],
        message: 'GraphQL mutation operations must use create/update/delete capability',
      });
    }
    const seen = new Set<string>();
    for (const [index, variable] of operation.variables.entries()) {
      if (seen.has(variable.name)) {
        context.addIssue({ code: 'custom', path: ['variables', index], message: 'duplicate GraphQL variable' });
      }
      seen.add(variable.name);
    }
  });
export type ElectroCraftGraphQLOperationDefinition = z.infer<typeof electroCraftGraphQLOperationDefinitionSchema>;

const sensitiveHeaderPattern = /^(?:authorization|proxy-authorization|cookie|set-cookie|x-api-key|api-key)$/i;

export function isSensitiveGraphQLHeaderName(name: string) {
  return sensitiveHeaderPattern.test(name.trim());
}

const graphQLDefaultHeadersSchema = z
  .record(z.string().trim().min(1).max(120), z.string().max(4000))
  .superRefine((headers, context) => {
    for (const name of Object.keys(headers)) {
      if (isSensitiveGraphQLHeaderName(name)) {
        context.addIssue({
          code: 'custom',
          path: [name],
          message: 'sensitive authentication headers must use authRef/Gateway',
        });
      }
    }
  });

export const electroCraftGraphQLDataSourceConfigSchema = z.strictObject({
  endpoint: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), 'GraphQL endpoint must use http or https'),
  defaultHeaders: graphQLDefaultHeadersSchema.default({}),
  timeoutMs: z.number().int().min(100).max(120_000).default(15_000),
  executionMode: electroCraftRestExecutionModeSchema.default('auto'),
  introspectionEnabled: z.boolean().default(true),
  operations: z.array(electroCraftGraphQLOperationDefinitionSchema).max(500),
});
export type ElectroCraftGraphQLDataSourceConfig = z.infer<typeof electroCraftGraphQLDataSourceConfigSchema>;

export interface ElectroCraftGraphQLError {
  readonly message: string;
  readonly path: readonly (string | number)[] | null;
}

export interface ElectroCraftGraphQLDataResult {
  readonly ok: boolean;
  readonly status: number | null;
  readonly data: JsonValue | null;
  readonly errors: readonly ElectroCraftGraphQLError[];
  readonly error: {
    readonly code: string;
    readonly message: string;
  } | null;
  readonly transport: 'browser' | 'gateway';
}
