import {
  electroCraftTargetCompileContextSchema,
  verifyElectroCraftExportIREnvelope,
  type ElectroCraftCanonicalSnapshotChecksum,
  type ElectroCraftExportIREnvelope,
  type ElectroCraftExportTargetId,
  type ElectroCraftObjectId,
  type ElectroCraftTargetCompileContext,
} from '@electrocraft/domain';

export interface ElectroCraftTargetCompileInput {
  schemaVersion: 1;
  targetId: ElectroCraftExportTargetId;
  projectId: ElectroCraftObjectId;
  exportIrSchemaVersion: 1;
  exportIrChecksum: ElectroCraftCanonicalSnapshotChecksum;
  context: ElectroCraftTargetCompileContext;
}

export function createTargetCompileInput(
  envelopeInput: unknown,
  contextInput: unknown,
): Readonly<ElectroCraftTargetCompileInput> {
  const envelope: ElectroCraftExportIREnvelope = verifyElectroCraftExportIREnvelope(envelopeInput);
  const context = electroCraftTargetCompileContextSchema.parse(contextInput);
  return Object.freeze({
    schemaVersion: 1,
    targetId: context.targetId,
    projectId: envelope.ir.project.id,
    exportIrSchemaVersion: 1,
    exportIrChecksum: envelope.checksum,
    context,
  });
}

export function createNativeTargetCompileInput(
  envelopeInput: unknown,
  contextInput: unknown,
): Readonly<ElectroCraftTargetCompileInput> {
  const input = createTargetCompileInput(envelopeInput, contextInput);
  if (input.targetId !== 'android-expo' && input.targetId !== 'ios-expo') {
    throw new TypeError(`native compile input requires android-expo or ios-expo, got ${input.targetId}`);
  }
  return input;
}
