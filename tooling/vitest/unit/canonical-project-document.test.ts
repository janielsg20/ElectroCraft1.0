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
  serializeElectroCraftProjectDefinition,
  validateProjectDefinitionSemantics,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(
    readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8'),
  ) as unknown;
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

  it('validates and round-trips the canonical fixtures', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v1'));
    const document = electroCraftDocumentSchema.parse(fixture('screen-v1'));

    expect(validateProjectDefinitionSemantics(project)).toEqual([]);
    expect(canonicalProjectRoundTrip(project)).toEqual(project);
    expect(canonicalDocumentRoundTrip(document)).toEqual(document);
    expect(serializeElectroCraftProjectDefinition(project)).toBe(
      serializeElectroCraftProjectDefinition(canonicalProjectRoundTrip(project)),
    );
  });

  it('rejects unknown keys instead of silently accepting a mega project JSON', () => {
    const project = fixture('project-v1') as Record<string, unknown>;
    const result = electroCraftProjectDefinitionSchema.safeParse({
      ...project,
      documents: [fixture('screen-v1')],
    });

    expect(result.success).toBe(false);
  });

  it('keeps page out of the canonical kinds but migrates legacy imports to screen', () => {
    const legacy = fixture('legacy-page-v0');
    expect(electroCraftDocumentSchema.safeParse(legacy).success).toBe(false);

    const imported = importElectroCraftDocument(legacy);
    expect(imported.migratedFrom).toBe('page');
    expect(imported.document.kind).toBe('screen');
    expect(imported.document.schemaVersion).toBe(1);
  });

  it('detects duplicate refs and root navigation drift as semantic errors', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v1'));
    const invalid = {
      ...project,
      documentRefs: [...project.documentRefs, project.documentRefs[0]],
      navigationRefs: [],
    };
    const diagnostics = validateProjectDefinitionSemantics(invalid);

    expect(diagnostics.map(({ code }) => code)).toContain('duplicate-document-ref');
    expect(diagnostics.map(({ code }) => code)).toContain(
      'root-navigation-not-listed',
    );
  });
});
