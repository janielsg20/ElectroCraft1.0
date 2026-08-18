import * as z from 'zod';
import {
  electroCraftActionGraphSchema,
  electroCraftNavigationDefinitionSchema,
  electroCraftPermissionPolicySchema,
  electroCraftRoleSchema,
  electroCraftRouteDefinitionSchema,
  electroCraftStateDefinitionSchema,
} from './app-behavior';
import { stableCanonicalStringify } from './canonical-json';
import { electroCraftDataSchemaSchema, electroCraftDataSourceDefinitionSchema } from './data-definition';
import { electroCraftDocumentSchema } from './document';
import { jsonValueSchema } from './json-value';
import { electroCraftObjectIdSchema } from './object-id';
import { electroCraftProjectDefinitionSchema } from './project-definition';
import {
  createElectroCraftCanonicalSnapshotChecksum,
  electroCraftCanonicalSnapshotChecksumSchema,
} from './project-snapshot';
import { electroCraftQueryDefinitionSchema } from './query-definition';
import {
  electroCraftCapabilityIdSchema,
  electroCraftCapabilitySupportModeSchema,
  electroCraftThemeSchema,
} from './theme-blueprint';

export const electroCraftExportTargetIdSchema = z.enum([
  'local-project',
  'react-web',
  'static-web',
  'pwa',
  'android-expo',
  'ios-expo',
  'capacitor',
  'lamp',
  'wordpress',
]);
export type ElectroCraftExportTargetId = z.infer<typeof electroCraftExportTargetIdSchema>;

export const ELECTROCRAFT_EXPORT_TARGET_IDS = electroCraftExportTargetIdSchema.options;

export const electroCraftMediaManifestEntrySchema = z.strictObject({
  assetId: electroCraftObjectIdSchema,
  checksum: z.string().regex(/^[a-f0-9]{64}$/),
  mimeType: z.string().regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/i),
  sizeBytes: z.number().int().nonnegative(),
  filename: z.string().trim().min(1).max(255),
  altText: z.string().trim().max(500).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
});
export type ElectroCraftMediaManifestEntry = z.infer<typeof electroCraftMediaManifestEntrySchema>;

export const electroCraftMediaManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  assets: z.array(electroCraftMediaManifestEntrySchema).max(20_000),
});
export type ElectroCraftMediaManifest = z.infer<typeof electroCraftMediaManifestSchema>;

const forbiddenIrKeyNames = new Set([
  'workspacestate',
  'puckhistory',
  'retehistory',
  'tanstackcache',
  'aihistory',
  'aiprompts',
  'prompts',
  'slimroutes',
  'wpblocks',
  'wordpressblocks',
  'exporoutefiles',
  'capacitorconfig',
  'secretvalue',
  'password',
  'passwd',
  'clientsecret',
  'accesstoken',
  'refreshtoken',
  'apikey',
  'authorization',
  'credential',
]);

function normalizeKey(key: string): string {
  return key.replace(/[-_.\s]/g, '').toLowerCase();
}

function findForbiddenIrPath(value: unknown, path: Array<string | number> = []): Array<string | number> | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenIrPath(value[index], [...path, index]);
      if (found) return found;
    }
    return null;
  }
  if (value === null || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenIrKeyNames.has(normalizeKey(key))) return [...path, key];
    const found = findForbiddenIrPath(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

export const electroCraftExportIrSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    project: electroCraftProjectDefinitionSchema,
    documents: z.array(electroCraftDocumentSchema),
    routes: z.array(electroCraftRouteDefinitionSchema),
    navigations: z.array(electroCraftNavigationDefinitionSchema),
    dataSources: z.array(electroCraftDataSourceDefinitionSchema),
    dataSchemas: z.array(electroCraftDataSchemaSchema),
    queries: z.array(electroCraftQueryDefinitionSchema),
    states: z.array(electroCraftStateDefinitionSchema),
    actionGraphs: z.array(electroCraftActionGraphSchema),
    formDocumentRefs: z.array(electroCraftObjectIdSchema),
    roles: z.array(electroCraftRoleSchema),
    permissionPolicies: z.array(electroCraftPermissionPolicySchema),
    theme: electroCraftThemeSchema.nullable(),
    mediaManifest: electroCraftMediaManifestSchema,
    requiredCapabilities: z.array(electroCraftCapabilityIdSchema).max(200),
  })
  .superRefine((ir, context) => {
    const forbiddenPath = findForbiddenIrPath(ir);
    if (forbiddenPath) {
      context.addIssue({
        code: 'custom',
        path: forbiddenPath,
        message: 'ExportIR cannot contain Studio/engine history, target-specific internals, prompts, caches, or secret values',
      });
    }
  });

export type ElectroCraftExportIR = Readonly<z.infer<typeof electroCraftExportIrSchema>>;

export const electroCraftExportIrEnvelopeSchema = z.strictObject({
  format: z.literal('electrocraft-export-ir'),
  formatVersion: z.literal(1),
  checksum: electroCraftCanonicalSnapshotChecksumSchema,
  ir: electroCraftExportIrSchema,
});
export type ElectroCraftExportIREnvelope = Readonly<z.infer<typeof electroCraftExportIrEnvelopeSchema>>;

const compileFactValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const electroCraftTargetCapabilityFactSchema = z.strictObject({
  id: electroCraftCapabilityIdSchema,
  mode: electroCraftCapabilitySupportModeSchema,
  adapter: z.string().trim().min(1).max(160).nullable(),
});

const forbiddenCompileConfigKeyPattern =
  /^(?:password|passwd|secret|clientsecret|accesstoken|refreshtoken|apikey|authorization|credential)$/i;

function findSecretLikeCompileConfigPath(value: unknown, path: Array<string | number> = []): Array<string | number> | null {
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSecretLikeCompileConfigPath(value[index], [...path, index]);
      if (found) return found;
    }
    return null;
  }
  if (value === null || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenCompileConfigKeyPattern.test(normalizeKey(key))) return [...path, key];
    const found = findSecretLikeCompileConfigPath(child, [...path, key]);
    if (found) return found;
  }
  return null;
}

export const electroCraftTargetCompileContextSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    targetId: electroCraftExportTargetIdSchema,
    config: z.record(z.string().min(1).max(120), jsonValueSchema),
    capabilities: z.array(electroCraftTargetCapabilityFactSchema).max(500),
    environment: z.record(z.string().min(1).max(120), compileFactValueSchema),
    toolchain: z.record(z.string().min(1).max(120), compileFactValueSchema),
    secretRefs: z.array(electroCraftObjectIdSchema).max(500),
  })
  .superRefine((contextValue, context) => {
    const secretPath = findSecretLikeCompileConfigPath(contextValue.config);
    if (secretPath) {
      context.addIssue({
        code: 'custom',
        path: ['config', ...secretPath],
        message: 'target compile config cannot contain secret values; use secretRefs',
      });
    }
  });
export type ElectroCraftTargetCompileContext = z.infer<typeof electroCraftTargetCompileContextSchema>;

export const electroCraftExportValidationDiagnosticSchema = z.strictObject({
  code: z.string().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  severity: z.enum(['warning', 'error']),
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string().trim().min(1).max(500),
  repair: z.string().trim().min(1).max(500),
});
export type ElectroCraftExportValidationDiagnostic = z.infer<typeof electroCraftExportValidationDiagnosticSchema>;

export const electroCraftExportValidationReportSchema = z.strictObject({
  schemaVersion: z.literal(1),
  status: z.enum(['ready', 'blocked']),
  checksum: electroCraftCanonicalSnapshotChecksumSchema.nullable(),
  diagnostics: z.array(electroCraftExportValidationDiagnosticSchema).max(5_000),
});
export type ElectroCraftExportValidationReport = z.infer<typeof electroCraftExportValidationReportSchema>;

function sortById<T extends { id: string }>(values: readonly T[]): T[] {
  return [...values].sort(({ id: left }, { id: right }) => left.localeCompare(right));
}

function normalizeExportIr(input: unknown): z.infer<typeof electroCraftExportIrSchema> {
  const ir = electroCraftExportIrSchema.parse(input);
  return electroCraftExportIrSchema.parse({
    ...ir,
    documents: sortById(ir.documents),
    routes: sortById(ir.routes),
    navigations: sortById(ir.navigations),
    dataSources: sortById(ir.dataSources),
    dataSchemas: sortById(ir.dataSchemas),
    queries: sortById(ir.queries),
    states: sortById(ir.states),
    actionGraphs: sortById(ir.actionGraphs),
    formDocumentRefs: [...ir.formDocumentRefs].sort(),
    roles: sortById(ir.roles),
    permissionPolicies: sortById(ir.permissionPolicies),
    mediaManifest: {
      ...ir.mediaManifest,
      assets: [...ir.mediaManifest.assets].sort(({ assetId: left }, { assetId: right }) => left.localeCompare(right)),
    },
    requiredCapabilities: [...ir.requiredCapabilities].sort(),
  });
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export function createElectroCraftExportIR(input: unknown): ElectroCraftExportIR {
  return deepFreeze(normalizeExportIr(input));
}

export function serializeElectroCraftExportIR(input: unknown): string {
  return stableCanonicalStringify(normalizeExportIr(input));
}

export function createElectroCraftExportIRChecksum(input: unknown) {
  return createElectroCraftCanonicalSnapshotChecksum(normalizeExportIr(input));
}

export function createElectroCraftExportIREnvelope(input: unknown): ElectroCraftExportIREnvelope {
  const ir = normalizeExportIr(input);
  return deepFreeze(
    electroCraftExportIrEnvelopeSchema.parse({
      format: 'electrocraft-export-ir',
      formatVersion: 1,
      checksum: createElectroCraftExportIRChecksum(ir),
      ir,
    }),
  );
}

export function serializeElectroCraftExportIREnvelope(input: unknown): string {
  const envelope = electroCraftExportIrEnvelopeSchema.parse(input);
  return stableCanonicalStringify({ ...envelope, ir: normalizeExportIr(envelope.ir) });
}

export function verifyElectroCraftExportIREnvelope(input: unknown): ElectroCraftExportIREnvelope {
  const envelope = electroCraftExportIrEnvelopeSchema.parse(input);
  const ir = normalizeExportIr(envelope.ir);
  const checksum = createElectroCraftExportIRChecksum(ir);
  if (checksum !== envelope.checksum) {
    throw new TypeError(`ExportIR checksum mismatch: expected ${envelope.checksum}, got ${checksum}`);
  }
  return createElectroCraftExportIREnvelope(ir);
}
