import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ELECTROCRAFT_EXPORT_TARGET_IDS,
  serializeElectroCraftExportIREnvelope,
  verifyElectroCraftExportIREnvelope,
} from '@electrocraft/domain';
import { buildElectroCraftExportIR, validateElectroCraftExportIRSource } from '@electrocraft/application';
import { createNativeTargetCompileInput, createTargetCompileInput } from '@electrocraft/export-ir';
import { canonicalExportIrSource, canonicalModelFixture } from '../helpers/export-ir-fixture';

function evidence(name: string, value: unknown): void {
  const directory = process.env.ELECTROCRAFT_EVIDENCE_DIR;
  if (!directory) return;
  mkdirSync(resolve(directory), { recursive: true });
  writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

describe('M02.7 ExportIR compiler boundary', () => {
  it('round-trips the frozen canonical revision and prepares web/native targets from the same checksum', () => {
    const source = canonicalExportIrSource();
    const envelope = buildElectroCraftExportIR(source);
    const serialized = serializeElectroCraftExportIREnvelope(envelope);
    const reopened = verifyElectroCraftExportIREnvelope(JSON.parse(serialized));
    const nativeContext = canonicalModelFixture('export-ir-native-compile-context-v1');
    const webContext = {
      schemaVersion: 1,
      targetId: 'react-web',
      config: { output: 'source' },
      capabilities: [
        { id: 'navigation.basic', mode: 'supported', adapter: 'navigation.portable' },
        { id: 'storage.local', mode: 'supported', adapter: 'storage.web' },
      ],
      environment: { platform: 'linux', ci: true },
      toolchain: { node: '22.16.0', mode: 'source-only' },
      secretRefs: [],
    };
    const webInput = createTargetCompileInput(reopened, webContext);
    const nativeInput = createNativeTargetCompileInput(reopened, nativeContext);

    expect(reopened.checksum).toBe(envelope.checksum);
    expect(webInput.exportIrChecksum).toBe(envelope.checksum);
    expect(nativeInput.exportIrChecksum).toBe(envelope.checksum);
    expect(webInput.projectId).toBe(nativeInput.projectId);
    expect(webInput.targetId).toBe('react-web');
    expect(nativeInput.targetId).toBe('android-expo');
    expect(() => createNativeTargetCompileInput(reopened, webContext)).toThrow(/native compile input/i);

    evidence('m02-7-export-ir-roundtrip.json', {
      format: envelope.format,
      formatVersion: envelope.formatVersion,
      schemaVersion: envelope.ir.schemaVersion,
      checksum: envelope.checksum,
      projectId: envelope.ir.project.id,
      documentIds: envelope.ir.documents.map(({ id }) => id),
      formDocumentRefs: envelope.ir.formDocumentRefs,
      mediaAssetIds: envelope.ir.mediaManifest.assets.map(({ assetId }) => assetId),
      requiredCapabilities: envelope.ir.requiredCapabilities,
      targetIds: [...ELECTROCRAFT_EXPORT_TARGET_IDS],
      serializedBytes: new TextEncoder().encode(serialized).byteLength,
    });
    evidence('m02-7-native-compile-input.json', nativeInput);
    evidence('m02-7-web-compile-input.json', webInput);
  });

  it('produces a reparable validation report instead of compiling missing project references', () => {
    const source = canonicalExportIrSource();
    const project = JSON.parse(JSON.stringify(source.project)) as { routeRefs: string[] };
    project.routeRefs.push('ec_route_000000000000z');
    const report = validateElectroCraftExportIRSource({ ...source, project });

    expect(report.status).toBe('blocked');
    expect(report.checksum).toBeNull();
    expect(report.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'MISSING_PROJECT_REF', severity: 'error', path: expect.any(Array) }),
      ]),
    );
    expect(report.diagnostics.every(({ repair }) => repair.length > 0)).toBe(true);

    evidence('m02-7-validation-report.json', report);
  });

  it('keeps target-specific compiler objects outside the canonical IR surface', () => {
    const envelope = buildElectroCraftExportIR(canonicalExportIrSource());
    const serialized = serializeElectroCraftExportIREnvelope(envelope);
    for (const forbidden of [
      'slimRoutes',
      'wpBlocks',
      'expoRouteFiles',
      'capacitorConfig',
      'puckHistory',
      'reteHistory',
      'tanstackCache',
      'aiHistory',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }

    evidence('m02-7-boundary-report.json', {
      targetSpecificInternalsInIr: false,
      forbiddenKeysChecked: [
        'slimRoutes',
        'wpBlocks',
        'expoRouteFiles',
        'capacitorConfig',
        'puckHistory',
        'reteHistory',
        'tanstackCache',
        'aiHistory',
      ],
    });
  });
});
