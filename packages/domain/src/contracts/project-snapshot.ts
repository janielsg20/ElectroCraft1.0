import * as z from 'zod';
import { parseCanonicalJson, stableCanonicalStringify } from './canonical-json';
import { electroCraftDocumentSchema, type ElectroCraftDocument } from './document';
import {
  electroCraftProjectDefinitionSchema,
  validateProjectDocumentReferences,
  type ElectroCraftProjectDefinition,
} from './project-definition';

const FNV64_OFFSET = 0xcbf29ce484222325n;
const FNV64_PRIME = 0x100000001b3n;

export const electroCraftCanonicalSnapshotChecksumSchema = z
  .string()
  .regex(/^fnv1a64:[0-9a-f]{16}$/, 'invalid ElectroCraft canonical snapshot checksum');
export type ElectroCraftCanonicalSnapshotChecksum = z.infer<typeof electroCraftCanonicalSnapshotChecksumSchema>;

export const electroCraftProjectSnapshotSchema = z.strictObject({
  snapshotVersion: z.literal(1),
  project: electroCraftProjectDefinitionSchema,
  documents: z.array(electroCraftDocumentSchema),
});
export type ElectroCraftProjectSnapshot = z.infer<typeof electroCraftProjectSnapshotSchema>;

export const electroCraftProjectSnapshotEnvelopeSchema = z.strictObject({
  format: z.literal('electrocraft-project-snapshot'),
  formatVersion: z.literal(1),
  checksum: electroCraftCanonicalSnapshotChecksumSchema,
  snapshot: electroCraftProjectSnapshotSchema,
});
export type ElectroCraftProjectSnapshotEnvelope = z.infer<typeof electroCraftProjectSnapshotEnvelopeSchema>;

function checksumFNV1a64(serialized: string): ElectroCraftCanonicalSnapshotChecksum {
  let hash = FNV64_OFFSET;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= BigInt(serialized.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * FNV64_PRIME);
  }
  return electroCraftCanonicalSnapshotChecksumSchema.parse(`fnv1a64:${hash.toString(16).padStart(16, '0')}`);
}

export function createElectroCraftProjectSnapshot(
  projectInput: unknown,
  documentInputs: readonly unknown[],
): ElectroCraftProjectSnapshot {
  const project: ElectroCraftProjectDefinition = electroCraftProjectDefinitionSchema.parse(projectInput);
  const documents: ElectroCraftDocument[] = documentInputs.map((input) => electroCraftDocumentSchema.parse(input));
  const diagnostics = validateProjectDocumentReferences(project, documents);
  if (diagnostics.length > 0) {
    throw new TypeError(`invalid snapshot references: ${diagnostics.map(({ code }) => code).join(', ')}`);
  }

  return electroCraftProjectSnapshotSchema.parse({
    snapshotVersion: 1,
    project,
    documents: [...documents].sort(({ id: left }, { id: right }) => left.localeCompare(right)),
  });
}

export function serializeElectroCraftProjectSnapshot(snapshotInput: unknown): string {
  const snapshot = electroCraftProjectSnapshotSchema.parse(snapshotInput);
  return stableCanonicalStringify(snapshot);
}

export function createElectroCraftProjectSnapshotChecksum(
  snapshotInput: unknown,
): ElectroCraftCanonicalSnapshotChecksum {
  return checksumFNV1a64(serializeElectroCraftProjectSnapshot(snapshotInput));
}

export function createElectroCraftProjectSnapshotEnvelope(
  projectInput: unknown,
  documentInputs: readonly unknown[],
): ElectroCraftProjectSnapshotEnvelope {
  const snapshot = createElectroCraftProjectSnapshot(projectInput, documentInputs);
  return electroCraftProjectSnapshotEnvelopeSchema.parse({
    format: 'electrocraft-project-snapshot',
    formatVersion: 1,
    checksum: createElectroCraftProjectSnapshotChecksum(snapshot),
    snapshot,
  });
}

export function serializeElectroCraftProjectSnapshotEnvelope(envelopeInput: unknown): string {
  return stableCanonicalStringify(electroCraftProjectSnapshotEnvelopeSchema.parse(envelopeInput));
}

export function parseElectroCraftProjectSnapshotEnvelope(serialized: string): unknown {
  return parseCanonicalJson(serialized);
}

export function verifyElectroCraftProjectSnapshotEnvelope(
  envelopeInput: unknown,
): ElectroCraftProjectSnapshotEnvelope {
  const envelope = electroCraftProjectSnapshotEnvelopeSchema.parse(envelopeInput);
  const actualChecksum = createElectroCraftProjectSnapshotChecksum(envelope.snapshot);
  if (actualChecksum !== envelope.checksum) {
    throw new TypeError(`canonical snapshot checksum mismatch: expected ${envelope.checksum}, got ${actualChecksum}`);
  }
  const normalized = createElectroCraftProjectSnapshot(envelope.snapshot.project, envelope.snapshot.documents);
  return electroCraftProjectSnapshotEnvelopeSchema.parse({ ...envelope, snapshot: normalized });
}
