import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(path: string): string {
  return readFileSync(resolve(path), 'utf8');
}

describe('M02.6 serializer/migration/import boundaries', () => {
  it('owns deterministic key sorting in one canonical-json module', () => {
    const canonicalJson = read('packages/domain/src/contracts/canonical-json.ts');
    const serialization = read('packages/domain/src/contracts/serialization.ts');
    const snapshot = read('packages/domain/src/contracts/project-snapshot.ts');

    expect(canonicalJson).toMatch(/Object\.keys\(record\)[\s\S]*\.sort\(\)/);
    expect(serialization).toMatch(/stableCanonicalStringify/);
    expect(serialization).not.toMatch(/Object\.keys\(record\)/);
    expect(snapshot).toMatch(/stableCanonicalStringify/);
    expect(snapshot).not.toMatch(/Object\.keys\(record\)/);
  });

  it('routes project schema evolution through one MigrationRegistry', () => {
    const source = read('packages/domain/src/contracts/project-definition.ts');
    expect(source).toMatch(/createElectroCraftProjectMigrationRegistry/);
    expect(source).toContain('project-v1-to-v2-data-ownership');
    expect(source).toContain('project-v2-to-v3-theme-blueprint-capabilities');
    expect(source).toMatch(/projectMigrationRegistry\.migrate/);
  });

  it('keeps checksum implementation portable and free of Node filesystem/crypto dependencies', () => {
    const sources = [
      'packages/domain/src/contracts/canonical-json.ts',
      'packages/domain/src/contracts/project-snapshot.ts',
      'packages/domain/src/contracts/migration-registry.ts',
    ]
      .map(read)
      .join('\n');
    expect(sources).not.toMatch(/from ['"]node:(?:fs|path|crypto)['"]/);
    expect(sources).not.toMatch(/createHash|subtle\.digest/);
    expect(sources).toContain('fnv1a64');
  });

  it('maps Zod safeParse issues into reparable import diagnostics before persistence', () => {
    const source = read('packages/application/src/project-import-service.ts');
    expect(source).toMatch(/electroCraftProjectSnapshotEnvelopeSchema\.safeParse/);
    expect(source).toMatch(/error\.issues\.map/);
    expect(source).toMatch(/repair:/);
    expect(source.indexOf('preview(serialized)')).toBeLessThan(source.indexOf('repository.putMany'));
  });

  it('keeps ExportIR neutral by consuming only the canonical snapshot envelope', () => {
    const source = read('packages/export-ir/src/index.ts');
    expect(source).toMatch(/electroCraftProjectSnapshotEnvelopeSchema/);
    expect(source).toMatch(/createProjectSnapshotExportManifest/);
    expect(source).not.toMatch(/ProjectImportService|CanonicalProjectObjectRepository/);
  });
});
