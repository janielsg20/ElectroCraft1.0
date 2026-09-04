import * as z from 'zod';
import { electroCraftMetadataSchema, jsonValueSchema, type JsonValue } from '../contracts/json-value';
import { electroCraftObjectIdSchema } from '../contracts/object-id';

export const electroCraftDataSourceKindSchema = z.enum(['internal', 'rest', 'graphql', 'sql', 'custom']);
export type ElectroCraftDataSourceKind = z.infer<typeof electroCraftDataSourceKindSchema>;

export const electroCraftDataSourceEnvironmentSchema = z.enum(['development', 'preview', 'production']);
export type ElectroCraftDataSourceEnvironment = z.infer<typeof electroCraftDataSourceEnvironmentSchema>;

export const electroCraftCanonicalDataSourceCapabilitySchema = z.enum([
  'read',
  'create',
  'update',
  'delete',
  'pagination',
  'filtering',
  'sort',
  'aggregate',
  'realtime',
  'file',
  'transactions',
  'taxonomies',
  'relations',
]);
export type ElectroCraftCanonicalDataSourceCapability = z.infer<typeof electroCraftCanonicalDataSourceCapabilitySchema>;

export const electroCraftDataSourceCapabilitySchema = z.enum([
  ...electroCraftCanonicalDataSourceCapabilitySchema.options,
  'write',
  'filter',
  'paginate',
  'subscribe',
  'files',
]);
export type ElectroCraftDataSourceCapability = z.infer<typeof electroCraftDataSourceCapabilitySchema>;

export const electroCraftDataSourceSchemaDiscoveryPolicySchema = z.enum(['manual', 'on-connect', 'on-demand']);
export type ElectroCraftDataSourceSchemaDiscoveryPolicy = z.infer<
  typeof electroCraftDataSourceSchemaDiscoveryPolicySchema
>;

export const electroCraftCanonicalDataSourceCapabilities = Object.freeze([
  ...electroCraftCanonicalDataSourceCapabilitySchema.options,
]) as readonly ElectroCraftCanonicalDataSourceCapability[];

const portableDataSourceConfigSchema = z.record(z.string().min(1).max(120), jsonValueSchema);
const portableEnvironmentOverridesSchema = z.strictObject({
  development: portableDataSourceConfigSchema.optional(),
  preview: portableDataSourceConfigSchema.optional(),
  production: portableDataSourceConfigSchema.optional(),
});

const forbiddenConfigKeyPattern =
  /^(?:password|passwd|secret|clientsecret|accesstoken|refreshtoken|apikey|authorization|credential)$/i;

function findSecretLikeConfigPath(value: unknown, path: string[] = []): string[] | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSecretLikeConfigPath(value[index], [...path, String(index)]);
      if (found) return found;
    }
    return null;
  }
  if (value === null || typeof value !== 'object') return null;

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenConfigKeyPattern.test(key.replace(/[-_]/g, ''))) {
      return [...path, key];
    }
    const found = findSecretLikeConfigPath(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

export function normalizeDataSourceCapabilities(
  capabilities: readonly ElectroCraftDataSourceCapability[],
): readonly ElectroCraftCanonicalDataSourceCapability[] {
  const normalized = new Set<ElectroCraftCanonicalDataSourceCapability>();
  for (const capability of capabilities) {
    if (capability === 'write') {
      normalized.add('create');
      normalized.add('update');
      normalized.add('delete');
      continue;
    }
    if (capability === 'filter') {
      normalized.add('filtering');
      continue;
    }
    if (capability === 'paginate') {
      normalized.add('pagination');
      continue;
    }
    if (capability === 'subscribe') {
      normalized.add('realtime');
      continue;
    }
    if (capability === 'files') {
      normalized.add('file');
      continue;
    }
    normalized.add(capability);
  }
  return Object.freeze(electroCraftCanonicalDataSourceCapabilities.filter((capability) => normalized.has(capability)));
}

const dataSourceCapabilitiesSchema = z
  .array(electroCraftDataSourceCapabilitySchema)
  .max(18)
  .superRefine((capabilities, context) => {
    const seen = new Set<string>();
    for (const [index, capability] of capabilities.entries()) {
      if (seen.has(capability)) {
        context.addIssue({ code: 'custom', path: [index], message: 'data source capabilities must be unique' });
      }
      seen.add(capability);
    }
  })
  .transform((capabilities) => normalizeDataSourceCapabilities(capabilities));

export const electroCraftDataSourceDefinitionSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    id: electroCraftObjectIdSchema,
    version: z.number().int().positive(),
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    kind: electroCraftDataSourceKindSchema,
    adapterId: z.string().regex(/^[a-z][a-z0-9.-]{1,119}$/),
    authRef: electroCraftObjectIdSchema.nullable(),
    config: portableDataSourceConfigSchema,
    environmentScope: z
      .array(electroCraftDataSourceEnvironmentSchema)
      .min(1)
      .max(3)
      .default(['development', 'preview', 'production']),
    environmentOverrides: portableEnvironmentOverridesSchema.default({}),
    schemaDiscovery: electroCraftDataSourceSchemaDiscoveryPolicySchema.default('on-demand'),
    capabilities: dataSourceCapabilitiesSchema,
    metadata: electroCraftMetadataSchema,
  })
  .superRefine((source, context) => {
    const environmentSet = new Set(source.environmentScope);
    if (environmentSet.size !== source.environmentScope.length) {
      context.addIssue({ code: 'custom', path: ['environmentScope'], message: 'environment scope must be unique' });
    }

    const secretPath = findSecretLikeConfigPath(source.config);
    if (secretPath) {
      context.addIssue({
        code: 'custom',
        path: ['config', ...secretPath],
        message: 'secrets are not allowed in DataSourceDefinition.config; use authRef',
      });
    }
    for (const environment of electroCraftDataSourceEnvironmentSchema.options) {
      const override = source.environmentOverrides[environment];
      if (!override) continue;
      const overrideSecretPath = findSecretLikeConfigPath(override);
      if (overrideSecretPath) {
        context.addIssue({
          code: 'custom',
          path: ['environmentOverrides', environment, ...overrideSecretPath],
          message: 'secrets are not allowed in environment overrides; use authRef',
        });
      }
    }
  });

export type ElectroCraftDataSourceDefinition = z.infer<typeof electroCraftDataSourceDefinitionSchema>;

export function resolveDataSourceConfig(
  source: ElectroCraftDataSourceDefinition,
  environment: ElectroCraftDataSourceEnvironment,
): Readonly<Record<string, JsonValue>> {
  return Object.freeze({ ...source.config, ...(source.environmentOverrides[environment] ?? {}) });
}

export function isDataSourceEnvironmentEnabled(
  source: ElectroCraftDataSourceDefinition,
  environment: ElectroCraftDataSourceEnvironment,
): boolean {
  return source.environmentScope.includes(environment);
}

export function getDataSourceSchemaDiscoveryPolicy(
  source: ElectroCraftDataSourceDefinition,
): ElectroCraftDataSourceSchemaDiscoveryPolicy {
  return source.schemaDiscovery;
}
