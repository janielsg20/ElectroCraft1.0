import { describe, expect, it } from 'vitest';
import {
  electroCraftExportIrSchema,
  electroCraftTargetCompileContextSchema,
  verifyElectroCraftExportIREnvelope,
} from '@electrocraft/domain';
import { buildElectroCraftExportIR, validateElectroCraftExportIRSource } from '@electrocraft/application';
import { canonicalExportIrSource, canonicalModelFixture } from '../helpers/export-ir-fixture';

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

describe('M02.7 ExportIR boundaries', () => {
  it('blocks secret-like DataSource config before the IR can be frozen', () => {
    const source = canonicalExportIrSource();
    const dataSource = jsonClone(source.dataSources[0]) as Record<string, unknown>;
    dataSource.config = { database: 'studio-content', apiKey: 'must-not-export' };
    const report = validateElectroCraftExportIRSource({ ...source, dataSources: [dataSource] });

    expect(report.status).toBe('blocked');
    expect(report.checksum).toBeNull();
    expect(report.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'INVALID_EXPORT_SOURCE', severity: 'error' })]),
    );
  });

  it('blocks target-specific/runtime history injected through otherwise portable document props', () => {
    const source = canonicalExportIrSource();
    const screen = jsonClone(source.documents.find((value) => (value as { kind?: string }).kind === 'screen')) as {
      root: { props: Record<string, unknown> };
    };
    screen.root.props.capacitorConfig = { webDir: 'dist' };
    const documents = source.documents.map((value) =>
      (value as { kind?: string }).kind === 'screen' ? screen : value,
    );
    const report = validateElectroCraftExportIRSource({ ...source, documents });

    expect(report.status).toBe('blocked');
    expect(report.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'INVALID_EXPORT_IR' })]),
    );
  });

  it('keeps secret values out of TargetCompileContext while allowing stable secret refs', () => {
    const valid = canonicalModelFixture<Record<string, unknown>>('export-ir-native-compile-context-v1');
    expect(electroCraftTargetCompileContextSchema.parse(valid).secretRefs).toEqual([]);

    const invalid = {
      ...valid,
      config: { applicationId: 'com.electrocraft.fixture', accessToken: 'plaintext-secret' },
    };
    expect(electroCraftTargetCompileContextSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects target-specific fields and unsupported ExportIR schema versions', () => {
    const envelope = buildElectroCraftExportIR(canonicalExportIrSource());
    expect(electroCraftExportIrSchema.safeParse({ ...envelope.ir, slimRoutes: [] }).success).toBe(false);
    expect(electroCraftExportIrSchema.safeParse({ ...envelope.ir, schemaVersion: 2 }).success).toBe(false);
  });

  it('fails closed when the frozen revision checksum is changed', () => {
    const envelope = buildElectroCraftExportIR(canonicalExportIrSource());
    expect(() => verifyElectroCraftExportIREnvelope({ ...envelope, checksum: 'fnv1a64:0000000000000000' })).toThrow(
      /checksum mismatch/i,
    );
  });
});
