import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeElectroCraftExportIREnvelope } from '@electrocraft/domain';
import { buildElectroCraftExportIR, createElectroCraftModelOwnershipReport } from '@electrocraft/application';
import { canonicalExportIrSource, canonicalModelFixture } from '../helpers/export-ir-fixture';

function evidence(name: string, value: unknown): void {
  const directory = process.env.ELECTROCRAFT_EVIDENCE_DIR;
  if (!directory) return;
  mkdirSync(resolve(directory), { recursive: true });
  writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

describe('M02.8 ownership integration', () => {
  it('resolves project-owned user definitions without copying application registries', () => {
    const project = canonicalModelFixture('project-v3');
    const userDefinition = canonicalModelFixture('registry-definition-user-v1');
    const report = createElectroCraftModelOwnershipReport(project, [userDefinition]);

    expect(report.status).toBe('ready');
    expect(report.counts).toEqual({
      'project-object': 14,
      'registry-definition': 6,
      'content-entity': 6,
    });
    expect(report.diagnostics).toEqual([]);

    evidence('m02-8-ownership-report.json', {
      status: report.status,
      counts: report.counts,
      descriptorCount: report.descriptors.length,
      categories: [...new Set(report.descriptors.map(({ category }) => category))].sort(),
    });
  });

  it('builds the same target-neutral ExportIR from project objects while content remains manifest/resolver scoped', () => {
    const envelope = buildElectroCraftExportIR(canonicalExportIrSource());
    const serialized = serializeElectroCraftExportIREnvelope(envelope);

    expect(envelope.ir.mediaManifest.assets.length).toBeGreaterThan(0);
    expect(serialized).not.toContain('componentRegistry');
    expect(serialized).not.toContain('fieldRegistry');
    expect(serialized).not.toContain('actionRegistry');
    expect(serialized).not.toContain('providerRegistry');
    expect(serialized).not.toContain('capabilityRegistry');
    expect(serialized).not.toContain('blueprintCatalog');
    expect(serialized).not.toContain('contentRecords');
    expect(serialized).not.toContain('auditEvents');
    expect(serialized).not.toContain('userProfiles');

    evidence('m02-8-export-boundary.json', {
      checksum: envelope.checksum,
      projectId: envelope.ir.project.id,
      mediaAssetIds: envelope.ir.mediaManifest.assets.map(({ assetId }) => assetId),
      fullRegistrySerialized: false,
      contentCollectionsSerializedInProject: false,
      contentAccess: 'resolver-or-manifest',
    });
  });
});
