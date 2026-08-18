import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftBlueprintPackageSchema,
  electroCraftObjectIdSchema,
  electroCraftOriginBlueprintSchema,
  electroCraftProjectDefinitionSchema,
  electroCraftRegistryDefinitionSchema,
} from '@electrocraft/domain';
import {
  ElectroCraftBlueprintInstaller,
  ElectroPlatformCapabilityRegistry,
  createAppDefinitionRegistries,
  validateProjectRegistryDefinitions,
  type InstalledBlueprintObject,
} from '@electrocraft/application';
import { createCapabilityExportPlan } from '@electrocraft/export-ir';

function fixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

function evidence(name: string, value: unknown): void {
  const directory = process.env.ELECTROCRAFT_EVIDENCE_DIR;
  if (!directory) return;
  mkdirSync(resolve(directory), { recursive: true });
  writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function installedObjects(inputs: readonly Record<string, unknown>[]): InstalledBlueprintObject[] {
  return inputs.map((input) => ({
    objectId: electroCraftObjectIdSchema.parse(input.objectId),
    contentHash: String(input.contentHash),
    originBlueprint:
      input.originBlueprint === null ? null : electroCraftOriginBlueprintSchema.parse(input.originBlueprint),
  }));
}

function contentHashMap(store: Map<string, InstalledBlueprintObject>): Record<string, string> {
  return Object.fromEntries([...store.entries()].map(([id, value]) => [id, value.contentHash]));
}

describe('M02.5 integrated Blueprint and registry ownership', () => {
  it('plans, detects conflict, applies and rolls back Blueprint artifacts deterministically', () => {
    const blueprint = electroCraftBlueprintPackageSchema.parse(fixture('blueprint-package-v1'));
    const scenario = fixture<{
      installerVersion: number;
      successfulInstalledBefore: Record<string, unknown>[];
      conflictingInstalledBefore: Record<string, unknown>[];
      expectedConflictCodes: string[];
      expectedAfterApply: Record<string, string>;
      expectedAfterRollback: Record<string, string>;
    }>('blueprint-install-conflict-rollback-v1');
    const installer = new ElectroCraftBlueprintInstaller(scenario.installerVersion);

    const successful = installedObjects(scenario.successfulInstalledBefore);
    const store = new Map(successful.map((entry) => [entry.objectId, entry] as const));
    const plan = installer.plan(blueprint, successful);
    expect(plan.conflicts).toEqual([]);

    const journal = installer.apply(plan, store);
    expect(contentHashMap(store)).toEqual(scenario.expectedAfterApply);

    installer.rollback(journal, store);
    expect(contentHashMap(store)).toEqual(scenario.expectedAfterRollback);
    expect(journal.rolledBack).toBe(true);

    const conflicting = installedObjects(scenario.conflictingInstalledBefore);
    const conflictPlan = installer.plan(blueprint, conflicting);
    expect(conflictPlan.conflicts.map(({ code }) => code)).toEqual(scenario.expectedConflictCodes);
    expect(() => installer.apply(conflictPlan, new Map(conflicting.map((entry) => [entry.objectId, entry])))).toThrow(
      /unresolved conflicts/,
    );

    evidence('m02-5-blueprint-install-report.json', {
      plan,
      conflictPlan,
      journal,
      afterRollback: contentHashMap(store),
    });
  });

  it('produces a real supported/adapted/blocked capability report and neutral ExportIR plan', () => {
    const registryFixture = fixture<{ registryVersion: number; definitions: unknown[] }>('capability-registry-v1');
    const expected = fixture<{
      requiredCapabilities: string[];
      expected: Record<string, Record<string, string>>;
      expectedBlocked: boolean;
    }>('capability-supported-adapted-blocked-v1');
    const baseProject = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const project = electroCraftProjectDefinitionSchema.parse({
      ...baseProject,
      requiredCapabilities: expected.requiredCapabilities,
    });
    const registry = new ElectroPlatformCapabilityRegistry(registryFixture.registryVersion);
    for (const definition of registryFixture.definitions) registry.register(definition);

    const report = registry.analyze(project);
    const actual = Object.fromEntries(
      project.defaultTargets.map((target) => [
        target,
        Object.fromEntries(
          report.entries.filter((entry) => entry.target === target).map((entry) => [entry.capabilityId, entry.mode]),
        ),
      ]),
    );

    expect(actual).toEqual(expected.expected);
    expect(report.blocked).toBe(expected.expectedBlocked);

    const exportPlan = createCapabilityExportPlan(report);
    expect(exportPlan.blocked).toBe(true);
    expect(exportPlan.targets).toHaveLength(project.defaultTargets.length);
    expect(exportPlan.targets.find(({ target }) => target === 'pwa')?.capabilities).toEqual(
      expect.arrayContaining([expect.objectContaining({ capabilityId: 'navigation.basic', mode: 'adapted' })]),
    );

    evidence('m02-5-capability-report.json', report);
    evidence('m02-5-export-capability-plan.json', exportPlan);
  });

  it('registers definitions in application while persisting only user-created definition refs', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const userDefinition = electroCraftRegistryDefinitionSchema.parse(fixture('registry-definition-user-v1'));
    const registries = createAppDefinitionRegistries();

    expect(registries.component.register(userDefinition)).toEqual(userDefinition);
    expect(registries.component.get(userDefinition.id)).toEqual(userDefinition);
    expect(validateProjectRegistryDefinitions(project, [userDefinition])).toEqual([]);

    const coreDefinition = electroCraftRegistryDefinitionSchema.parse({ ...userDefinition, origin: 'core' });
    expect(validateProjectRegistryDefinitions(project, [coreDefinition])).toEqual([
      { code: 'non-user-definition-persisted', ref: userDefinition.id },
    ]);
    expect(JSON.stringify(project)).not.toMatch(/componentRegistry|fieldRegistry|actionRegistry|providerRegistry/);
  });
});
