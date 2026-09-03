import * as z from 'zod';
import { electroCraftExportTargetIdSchema } from '../contracts/export-ir';
import { jsonValueSchema } from '../contracts/json-value';
import {
  electroCraftCanonicalDataSourceCapabilitySchema,
  electroCraftDataSourceKindSchema,
} from './source-definition';

export const electroCraftExtensionPackageIdentitySchema = z.strictObject({
  format: z.literal('ElectroCraftExtensionPackage'),
  packageId: z.string().regex(/^[a-z][a-z0-9.-]{2,119}$/),
  displayName: z.string().trim().min(1).max(160),
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/),
  codeReviewRequired: z.literal(true),
});
export type ElectroCraftExtensionPackageIdentity = z.infer<typeof electroCraftExtensionPackageIdentitySchema>;

export const connectorExtensionConfigFieldTypeSchema = z.enum([
  'string',
  'number',
  'boolean',
  'url',
  'secret-ref',
]);
export type ConnectorExtensionConfigFieldType = z.infer<typeof connectorExtensionConfigFieldTypeSchema>;

export const connectorExtensionConfigFieldSchema = z
  .strictObject({
    key: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,79}$/),
    label: z.string().trim().min(1).max(160),
    type: connectorExtensionConfigFieldTypeSchema,
    required: z.boolean().default(false),
    description: z.string().trim().min(1).max(320).optional(),
    defaultValue: jsonValueSchema.optional(),
  })
  .superRefine((field, context) => {
    if (field.type === 'secret-ref' && field.defaultValue !== undefined) {
      context.addIssue({
        code: 'custom',
        path: ['defaultValue'],
        message: 'secret-ref fields cannot embed a default secret value',
      });
    }
  });
export type ConnectorExtensionConfigField = z.infer<typeof connectorExtensionConfigFieldSchema>;

export const connectorExtensionConfigSchema = z
  .strictObject({
    fields: z.array(connectorExtensionConfigFieldSchema).max(64),
  })
  .superRefine((schema, context) => {
    const seen = new Set<string>();
    for (const [index, field] of schema.fields.entries()) {
      if (seen.has(field.key)) {
        context.addIssue({
          code: 'custom',
          path: ['fields', index, 'key'],
          message: 'connector config field keys must be unique',
        });
      }
      seen.add(field.key);
    }
  });
export type ConnectorExtensionConfigSchema = z.infer<typeof connectorExtensionConfigSchema>;

export const connectorExtensionGatewayModeSchema = z.enum(['none', 'optional', 'required']);
export type ConnectorExtensionGatewayMode = z.infer<typeof connectorExtensionGatewayModeSchema>;

export const connectorExtensionRuntimeSchema = z.strictObject({
  browserModule: z.string().trim().min(1).max(240).nullable().default(null),
  gatewayModule: z.string().trim().min(1).max(240).nullable().default(null),
});
export type ConnectorExtensionRuntime = z.infer<typeof connectorExtensionRuntimeSchema>;

export const connectorExtensionManifestSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    extensionPackage: electroCraftExtensionPackageIdentitySchema,
    adapterId: z.string().regex(/^[a-z][a-z0-9.-]{1,119}$/),
    sourceKind: electroCraftDataSourceKindSchema,
    configSchema: connectorExtensionConfigSchema,
    capabilities: z.array(electroCraftCanonicalDataSourceCapabilitySchema).min(1).max(16),
    gateway: connectorExtensionGatewayModeSchema,
    runtime: connectorExtensionRuntimeSchema,
    targetSupport: z.array(electroCraftExportTargetIdSchema).min(1).max(9),
    secretStrategy: z.literal('secret-ref-gateway'),
  })
  .superRefine((manifest, context) => {
    const capabilities = new Set(manifest.capabilities);
    if (capabilities.size !== manifest.capabilities.length) {
      context.addIssue({ code: 'custom', path: ['capabilities'], message: 'connector capabilities must be unique' });
    }

    const targets = new Set(manifest.targetSupport);
    if (targets.size !== manifest.targetSupport.length) {
      context.addIssue({ code: 'custom', path: ['targetSupport'], message: 'connector target support must be unique' });
    }

    if (!manifest.runtime.browserModule && !manifest.runtime.gatewayModule) {
      context.addIssue({
        code: 'custom',
        path: ['runtime'],
        message: 'connector extension must declare at least one runtime adapter module',
      });
    }

    if (manifest.gateway === 'required' && !manifest.runtime.gatewayModule) {
      context.addIssue({
        code: 'custom',
        path: ['runtime', 'gatewayModule'],
        message: 'gateway-required connectors must declare a gateway module',
      });
    }

    if (manifest.sourceKind === 'sql' && manifest.gateway !== 'required') {
      context.addIssue({
        code: 'custom',
        path: ['gateway'],
        message: 'SQL connector extensions must execute through the ConnectorGateway',
      });
    }

    if (manifest.configSchema.fields.some((field) => field.type === 'secret-ref') && manifest.gateway === 'none') {
      context.addIssue({
        code: 'custom',
        path: ['gateway'],
        message: 'connectors with secret-ref configuration cannot disable the ConnectorGateway',
      });
    }
  });

export type ConnectorExtensionManifest = z.infer<typeof connectorExtensionManifestSchema>;

export function parseConnectorExtensionManifest(value: unknown): ConnectorExtensionManifest {
  return connectorExtensionManifestSchema.parse(value);
}
