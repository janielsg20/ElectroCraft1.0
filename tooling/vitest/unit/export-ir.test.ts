import { describe, expect, it } from 'vitest';
import {
  ELECTROCRAFT_EXPORT_TARGET_IDS,
  createElectroCraftExportIRChecksum,
  serializeElectroCraftExportIR,
} from '@electrocraft/domain';
import { buildElectroCraftExportIR, validateElectroCraftExportIRSource } from '@electrocraft/application';
import { canonicalExportIrSource } from '../helpers/export-ir-fixture';

describe('M02.7 canonical ExportIR', () => {
  it('defines exactly the nine first-class Core export targets', () => {
    expect([...ELECTROCRAFT_EXPORT_TARGET_IDS]).toEqual([
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
  });

  it('builds one immutable target-neutral IR containing the canonical ownership domains', () => {
    const source = canonicalExportIrSource();
    const report = validateElectroCraftExportIRSource(source);
    const envelope = buildElectroCraftExportIR(source);

    expect(report).toEqual({
      schemaVersion: 1,
      status: 'ready',
      checksum: envelope.checksum,
      diagnostics: [],
    });
    expect(envelope.format).toBe('electrocraft-export-ir');
    expect(envelope.ir.schemaVersion).toBe(1);
    expect(envelope.ir.documents).toHaveLength(3);
    expect(envelope.ir.formDocumentRefs).toEqual(['ec_document_000000000000e']);
    expect(envelope.ir.routes).toHaveLength(1);
    expect(envelope.ir.navigations).toHaveLength(1);
    expect(envelope.ir.dataSources).toHaveLength(1);
    expect(envelope.ir.dataSchemas).toHaveLength(1);
    expect(envelope.ir.queries).toHaveLength(1);
    expect(envelope.ir.states).toHaveLength(1);
    expect(envelope.ir.actionGraphs).toHaveLength(1);
    expect(envelope.ir.roles).toHaveLength(1);
    expect(envelope.ir.permissionPolicies).toHaveLength(1);
    expect(envelope.ir.theme?.id).toBe('ec_theme_0000000000006');
    expect(envelope.ir.mediaManifest.assets).toHaveLength(1);
    expect(envelope.ir.requiredCapabilities).toEqual(['navigation.basic', 'storage.local']);
    expect(Object.isFrozen(envelope)).toBe(true);
    expect(Object.isFrozen(envelope.ir)).toBe(true);
    expect(Object.isFrozen(envelope.ir.documents)).toBe(true);
    expect('targetId' in envelope.ir).toBe(false);
  });

  it('normalizes ordering so equivalent sources produce the same serialization and checksum', () => {
    const source = canonicalExportIrSource();
    const left = buildElectroCraftExportIR(source);
    const right = buildElectroCraftExportIR({
      ...source,
      documents: [...source.documents].reverse(),
      mediaManifest: {
        schemaVersion: 1,
        assets: [...(source.mediaManifest as { assets: unknown[] }).assets].reverse(),
      },
    });

    expect(right.checksum).toBe(left.checksum);
    expect(serializeElectroCraftExportIR(right.ir)).toBe(serializeElectroCraftExportIR(left.ir));
    expect(createElectroCraftExportIRChecksum(right.ir)).toBe(left.checksum);
  });
});
