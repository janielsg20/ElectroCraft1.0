import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as z from 'zod';
import { describe, expect, it } from 'vitest';
import { electroCraftDocumentSchema, electroCraftProjectDefinitionSchema } from '@electrocraft/domain';

function read(path: string): string {
  return readFileSync(resolve(path), 'utf8');
}

describe('M02.5 theme/blueprint/registry/capability boundaries', () => {
  it('keeps template in the one ElectroCraftDocument tree and never introduces ElectroTemplate', () => {
    const domain = [
      'packages/domain/src/contracts/document.ts',
      'packages/domain/src/contracts/theme-blueprint.ts',
      'packages/domain/src/contracts/project-definition.ts',
    ]
      .map(read)
      .join('\n');
    const template = JSON.parse(read('tooling/fixtures/canonical-model/template-v3.json')) as unknown;

    expect(electroCraftDocumentSchema.parse(template).kind).toBe('template');
    expect(domain).not.toMatch(/class ElectroTemplate|interface ElectroTemplate|type ElectroTemplate\s*=/);
  });

  it('persists capability requirements but never serializes live registries into ProjectDefinition', () => {
    const schema = z.toJSONSchema(electroCraftProjectDefinitionSchema) as { properties?: Record<string, unknown> };
    expect(schema.properties).toHaveProperty('requiredCapabilities');
    expect(schema.properties).toHaveProperty('targetCapabilityOverrides');
    expect(schema.properties).toHaveProperty('userRegistryDefinitionRefs');
    expect(schema.properties).not.toHaveProperty('capabilityRegistry');
    expect(schema.properties).not.toHaveProperty('componentRegistry');
    expect(schema.properties).not.toHaveProperty('providerRegistry');
  });

  it('keeps application registry internals out of domain and export-ir consumes a report only', () => {
    const domain = read('packages/domain/src/contracts/theme-blueprint.ts');
    const application = read('packages/application/src/ownership-registry-service.ts');
    const exportIr = read('packages/export-ir/src/index.ts');

    expect(domain).not.toMatch(/new Map|class ElectroPlatformCapabilityRegistry/);
    expect(application).toMatch(/class ElectroPlatformCapabilityRegistry/);
    expect(application).toMatch(/new Map/);
    expect(exportIr).toMatch(/electroCraftCapabilityAnalysisReportSchema/);
    expect(exportIr).not.toMatch(/ElectroPlatformCapabilityRegistry/);
  });

  it('preserves the F01 invariant of exactly 17 owner packages instead of creating @electrocraft/contracts', () => {
    const boundaries = JSON.parse(read('tooling/package-boundaries.json')) as { packages: Record<string, unknown> };
    expect(Object.keys(boundaries.packages)).toHaveLength(17);
    expect(boundaries.packages).not.toHaveProperty('@electrocraft/contracts');
    expect(existsSync(resolve('packages/contracts/package.json'))).toBe(false);
    expect(existsSync(resolve('packages/domain/src/contracts'))).toBe(true);
  });

  it('documents Theme, Blueprint, Registry and Capability ownership in Spanish help and ownership rules', () => {
    const help = read('.ai/HELP_ARCHITECTURE_MODELS.md');
    const ownership = read('.ai/MODEL_OWNERSHIP.md');
    for (const term of ['ElectroCraftTheme', 'ElectroCraftBlueprintPackage', 'ElectroPlatformCapabilityRegistry']) {
      expect(`${help}\n${ownership}`).toContain(term);
    }
    expect(ownership).toContain('packages/domain/src/contracts/');
  });
});
