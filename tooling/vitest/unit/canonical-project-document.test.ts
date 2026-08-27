import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalDocumentRoundTrip,
  canonicalProjectRoundTrip,
  createDeterministicObjectId,
  electroCraftDocumentSchema,
  electroCraftObjectIdSchema,
  electroCraftProjectDefinitionSchema,
  importElectroCraftDocument,
  importElectroCraftProjectDefinition,
  serializeElectroCraftProjectDefinition,
  validateProjectDefinitionSemantics,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.1 canonical project/document model', () => {
  it('creates deterministic namespaced object IDs', () => {
    const first = createDeterministicObjectId('document', 'Inicio');
    const second = createDeterministicObjectId('document', 'Inicio');
    const otherNamespace = createDeterministicObjectId('project', 'Inicio');

    expect(first).toBe(second);
    expect(first).not.toBe(otherNamespace);
    expect(electroCraftObjectIdSchema.parse(first)).toBe(first);
  });

  it('validates and round-trips the current canonical fixtures', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const document = electroCraftDocumentSchema.parse(fixture('screen-v4'));

    expect(validateProjectDefinitionSemantics(project)).toEqual([]);
    expect(canonicalProjectRoundTrip(project)).toEqual(project);
    expect(canonicalDocumentRoundTrip(document)).toEqual(document);
    expect(serializeElectroCraftProjectDefinition(project)).toBe(
      serializeElectroCraftProjectDefinition(canonicalProjectRoundTrip(project)),
    );
  });

  it('rejects unknown keys instead of silently accepting a mega project JSON', () => {
    const project = fixture('project-v3') as Record<string, unknown>;
    const result = electroCraftProjectDefinitionSchema.safeParse({
      ...project,
      documents: [fixture('screen-v3')],
    });

    expect(result.success).toBe(false);
  });

  it('keeps page out of canonical kinds but migrates legacy imports to screen v4', () => {
    const legacy = fixture('legacy-page-v0');
    expect(electroCraftDocumentSchema.safeParse(legacy).success).toBe(false);

    const imported = importElectroCraftDocument(legacy);
    expect(imported.migratedFrom).toBe('page');
    expect(imported.document.kind).toBe('screen');
    expect(imported.document.schemaVersion).toBe(4);
    expect(imported.document.formMeta).toBeNull();
    expect(imported.document.templateMeta).toBeNull();
  });

  it('migrates ProjectDefinition v1 without inventing data, blueprint or registry refs', () => {
    const imported = importElectroCraftProjectDefinition(fixture('project-v1'));
    expect(imported.migratedFrom).toBe(1);
    expect(imported.project.schemaVersion).toBe(3);
    expect(imported.project.dataSourceRefs).toEqual([]);
    expect(imported.project.dataSchemaRefs).toEqual([]);
    expect(imported.project.queryRefs).toEqual([]);
    expect(imported.project.originBlueprint).toBeNull();
    expect(imported.project.requiredCapabilities).toEqual([]);
    expect(imported.project.userRegistryDefinitionRefs).toEqual([]);
  });

  it('migrates ProjectDefinition v2 and Document v2/v3 explicitly into current versions', () => {
    const project = importElectroCraftProjectDefinition(fixture('project-v2'));
    const document = importElectroCraftDocument(fixture('screen-v2'));

    expect(project).toMatchObject({ migratedFrom: 2, project: { schemaVersion: 3 } });
    expect(document).toMatchObject({
      migratedFrom: 2,
      document: { schemaVersion: 4, formMeta: null, templateMeta: null },
    });
    expect(importElectroCraftDocument(fixture('screen-v3'))).toMatchObject({
      migratedFrom: 3,
      document: { schemaVersion: 4, root: { layout: null, style: null } },
    });
  });

  it('detects duplicate refs and root navigation drift as semantic errors', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v3'));
    const invalid = {
      ...project,
      documentRefs: [...project.documentRefs, project.documentRefs[0]],
      navigationRefs: [],
    };
    const diagnostics = validateProjectDefinitionSemantics(invalid);

    expect(diagnostics.map(({ code }) => code)).toContain('duplicate-document-ref');
    expect(diagnostics.map(({ code }) => code)).toContain('root-navigation-not-listed');
  });
});
