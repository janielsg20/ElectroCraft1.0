import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftProjectDefinitionSchema,
  validateElectroCraftProjectOwnershipBoundary,
} from '@electrocraft/domain';
import { createElectroCraftModelOwnershipReport } from '@electrocraft/application';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.8 ownership architecture boundary', () => {
  it('accepts a normal ProjectDefinition that stores refs/requirements only', () => {
    const project = fixture('project-v3');
    expect(electroCraftProjectDefinitionSchema.safeParse(project).success).toBe(true);
    expect(validateElectroCraftProjectOwnershipBoundary(project)).toEqual([]);
  });

  it('fails closed if a complete core registry is serialized into the project', () => {
    const project = fixture('project-v3') as Record<string, unknown>;
    const invalid = {
      ...project,
      componentRegistry: {
        version: 1,
        definitions: [
          {
            id: 'core.button',
            version: 1,
            origin: 'core',
            renderer: 'runtime-only',
          },
        ],
      },
    };

    expect(electroCraftProjectDefinitionSchema.safeParse(invalid).success).toBe(false);
    expect(validateElectroCraftProjectOwnershipBoundary(invalid).length).toBeGreaterThan(0);
  });

  it('fails closed if runtime/content entity collections are copied into ProjectDefinition', () => {
    const project = fixture('project-v3') as Record<string, unknown>;
    const invalid = {
      ...project,
      records: [{ id: 'record-1', modelId: 'product', data: { name: 'Runtime row' } }],
      auditEvents: [{ id: 'audit-1', action: 'update' }],
    };

    expect(electroCraftProjectDefinitionSchema.safeParse(invalid).success).toBe(false);
    expect(validateElectroCraftProjectOwnershipBoundary(invalid).length).toBeGreaterThan(0);
  });

  it('blocks a core/extension registry definition referenced as project-owned user content', () => {
    const project = fixture('project-v3') as { userRegistryDefinitionRefs: string[] };
    const coreDefinitionId = 'ec_registry-definition_000000000000s';
    const report = createElectroCraftModelOwnershipReport(
      { ...project, userRegistryDefinitionRefs: [coreDefinitionId] },
      [
        {
          schemaVersion: 1,
          id: coreDefinitionId,
          version: 1,
          kind: 'component',
          key: 'coreButton',
          label: 'Core Button',
          origin: 'core',
          capabilityRefs: [],
          metadata: {},
        },
      ],
    );

    expect(report.status).toBe('blocked');
    expect(report.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_USER_REGISTRY_DEFINITION', path: expect.any(Array) }),
      ]),
    );
  });
});
