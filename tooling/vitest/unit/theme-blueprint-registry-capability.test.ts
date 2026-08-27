import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalBlueprintPackageRoundTrip,
  canonicalDocumentRoundTrip,
  canonicalProjectRoundTrip,
  canonicalRegistryDefinitionRoundTrip,
  canonicalThemeRoundTrip,
  electroCraftBlueprintPackageSchema,
  electroCraftDocumentSchema,
  electroCraftProjectDefinitionSchema,
  electroCraftRegistryDefinitionSchema,
  electroCraftThemeSchema,
  importElectroCraftDocument,
  importElectroCraftProjectDefinition,
  validateProjectDefinitionSemantics,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.5 theme/blueprint/registry/capability contracts', () => {
  it('round-trips all persisted M02.5 shapes as portable canonical data', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const template = electroCraftDocumentSchema.parse(fixture('template-v4'));
    const theme = electroCraftThemeSchema.parse(fixture('theme-v1'));
    const blueprint = electroCraftBlueprintPackageSchema.parse(fixture('blueprint-package-v1'));
    const definition = electroCraftRegistryDefinitionSchema.parse(fixture('registry-definition-user-v1'));

    expect(canonicalProjectRoundTrip(project)).toEqual(project);
    expect(canonicalDocumentRoundTrip(template)).toEqual(template);
    expect(canonicalThemeRoundTrip(theme)).toEqual(theme);
    expect(canonicalBlueprintPackageRoundTrip(blueprint)).toEqual(blueprint);
    expect(canonicalRegistryDefinitionRoundTrip(definition)).toEqual(definition);
  });

  it('keeps template inside ElectroCraftDocument and requires templateMeta only for template', () => {
    const template = electroCraftDocumentSchema.parse(fixture('template-v4'));
    const screen = electroCraftDocumentSchema.parse(fixture('screen-v4'));

    expect(template.kind).toBe('template');
    expect(template.templateMeta?.displayConditions).toHaveLength(1);
    expect(electroCraftDocumentSchema.safeParse({ ...template, templateMeta: null }).success).toBe(false);
    expect(electroCraftDocumentSchema.safeParse({ ...screen, templateMeta: template.templateMeta }).success).toBe(
      false,
    );
  });

  it('keeps Theme visual-only and rejects component/runtime ownership drift', () => {
    const theme = fixture('theme-v1') as Record<string, unknown>;
    expect(electroCraftThemeSchema.safeParse({ ...theme, componentTree: [] }).success).toBe(false);
    expect(electroCraftThemeSchema.safeParse({ ...theme, zustandStore: {} }).success).toBe(false);
  });

  it('rejects duplicate object IDs inside a BlueprintPackage', () => {
    const blueprint = electroCraftBlueprintPackageSchema.parse(fixture('blueprint-package-v1'));
    const invalid = { ...blueprint, artifacts: [...blueprint.artifacts, blueprint.artifacts[0]] };
    expect(electroCraftBlueprintPackageSchema.safeParse(invalid).success).toBe(false);
  });

  it('migrates ProjectDefinition and Document v2 into M02.5 v3 without inventing registries', () => {
    const project = importElectroCraftProjectDefinition(fixture('project-v2'));
    const document = importElectroCraftDocument(fixture('form-v2'));

    expect(project.migratedFrom).toBe(2);
    expect(project.project).toMatchObject({
      schemaVersion: 3,
      originBlueprint: null,
      requiredCapabilities: [],
      targetCapabilityOverrides: {},
      userRegistryDefinitionRefs: [],
    });
    expect(document.migratedFrom).toBe(2);
    expect(document.document).toMatchObject({ schemaVersion: 4, templateMeta: null });
  });

  it('fails semantic validation when a target override is not a project requirement', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const invalid = {
      ...project,
      targetCapabilityOverrides: {
        ...project.targetCapabilityOverrides,
        local: { 'media.native-camera': 'blocked' as const },
      },
    };

    expect(validateProjectDefinitionSemantics(invalid).map(({ code }) => code)).toContain(
      'capability-override-not-required',
    );
  });
});
