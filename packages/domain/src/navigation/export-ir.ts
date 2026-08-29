import * as z from 'zod';
import { electroCraftExportIrSchema as legacyElectroCraftExportIrSchema } from '../contracts/export-ir';
import { stableCanonicalStringify } from '../contracts/canonical-json';
import {
  createElectroCraftCanonicalSnapshotChecksum,
  electroCraftCanonicalSnapshotChecksumSchema,
} from '../contracts/project-snapshot';
import { electroCraftNavigationDefinitionSchema, electroCraftRouteDefinitionSchema } from './index';

/**
 * ExportIR keeps formatVersion=1 while Route/Navigation evolve independently.
 * The F02 object shape is reused, while Route/Navigation move to the M07
 * schemas and the original forbidden-internals validation is preserved.
 */
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
    ...legacyElectroCraftExportIrSchema.shape,
    routes: z.array(electroCraftRouteDefinitionSchema),
    navigations: z.array(electroCraftNavigationDefinitionSchema),
  })
  .superRefine((ir, context) => {
    const forbiddenPath = findForbiddenIrPath(ir);
    if (forbiddenPath) {
      context.addIssue({
        code: 'custom',
        path: forbiddenPath,
        message:
          'ExportIR cannot contain Studio/engine history, target-specific internals, prompts, caches, or secret values',
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
