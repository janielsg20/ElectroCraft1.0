import * as z from 'zod';
import {
  electroCraftExportIrSchema as legacyElectroCraftExportIrSchema,
} from '../contracts/export-ir';
import { stableCanonicalStringify } from '../contracts/canonical-json';
import {
  createElectroCraftCanonicalSnapshotChecksum,
  electroCraftCanonicalSnapshotChecksumSchema,
} from '../contracts/project-snapshot';
import { electroCraftNavigationDefinitionSchema, electroCraftRouteDefinitionSchema } from './index';

/**
 * ExportIR keeps formatVersion=1 while Route/Navigation evolve independently.
 * The refined F02 envelope is preserved and only these two canonical object
 * collections are upgraded to their M07.1 schemas.
 */
export const electroCraftExportIrSchema = legacyElectroCraftExportIrSchema.safeExtend({
  routes: z.array(electroCraftRouteDefinitionSchema),
  navigations: z.array(electroCraftNavigationDefinitionSchema),
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
