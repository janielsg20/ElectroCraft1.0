import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalDataSchemaRoundTrip,
  canonicalDataSourceRoundTrip,
  canonicalQueryRoundTrip,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroCraftDocumentSchema,
  electroCraftProjectDefinitionSchema,
  electroCraftQueryDefinitionSchema,
  importElectroCraftDocument,
  importElectroCraftProjectDefinition,
  validateQueryDefinitionReferences,
} from '@electrocraft/domain';
import { validateDataOwnershipGraph } from '@electrocraft/data-core';
import { collectFormBindings, validateFormDocument } from '@electrocraft/forms';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.3 data/query/form ownership', () => {
  it('round-trips source, schema and query as portable canonical objects', () => {
    const source = electroCraftDataSourceDefinitionSchema.parse(fixture('data-source-v1'));
    const schema = electroCraftDataSchemaSchema.parse(fixture('data-schema-v1'));
    const query = electroCraftQueryDefinitionSchema.parse(fixture('query-v1'));

    expect(canonicalDataSourceRoundTrip(source)).toEqual(source);
    expect(canonicalDataSchemaRoundTrip(schema)).toEqual(schema);
    expect(canonicalQueryRoundTrip(query)).toEqual(query);
  });

  it('rejects nested credential material inside DataSourceDefinition.config', () => {
    const source = fixture('data-source-v1') as Record<string, unknown>;
    const result = electroCraftDataSourceDefinitionSchema.safeParse({
      ...source,
      config: {
        endpoint: 'https://example.invalid',
        headers: {
          api_key: 'must-not-be-persisted',
        },
      },
    });
    expect(result.success).toBe(false);
  });

  it('blocks query operators that are incompatible with the canonical field type', () => {
    const schema = electroCraftDataSchemaSchema.parse(fixture('data-schema-v1'));
    const query = electroCraftQueryDefinitionSchema.parse(fixture('query-v1'));
    const invalid = {
      ...query,
      conditions: {
        combinator: 'and' as const,
        rules: [
          {
            fieldRef: 'ec_field_000000000000c',
            operator: 'contains' as const,
            value: '10',
            valueSource: 'value' as const,
          },
        ],
      },
    };

    expect(validateQueryDefinitionReferences(invalid, schema).map(({ code }) => code)).toContain(
      'unsupported-query-operator',
    );
  });

  it('keeps forms inside ElectroCraftDocument with required formMeta', () => {
    const form = electroCraftDocumentSchema.parse(fixture('form-v4'));
    const schema = electroCraftDataSchemaSchema.parse(fixture('data-schema-v1'));

    expect(form.kind).toBe('form');
    expect(form.formMeta).not.toBeNull();
    expect(form.templateMeta).toBeNull();
    expect(validateFormDocument(form, [schema])).toEqual([]);
    expect(collectFormBindings(form).map(({ binding }) => binding.source)).toEqual(['query', 'query']);

    expect(electroCraftDocumentSchema.safeParse({ ...form, formMeta: null }).success).toBe(false);
  });

  it('validates the canonical project data ownership graph with no parallel registries', () => {
    const graph = {
      project: electroCraftProjectDefinitionSchema.parse(fixture('project-v3')),
      sources: [electroCraftDataSourceDefinitionSchema.parse(fixture('data-source-v1'))],
      schemas: [electroCraftDataSchemaSchema.parse(fixture('data-schema-v1'))],
      queries: [electroCraftQueryDefinitionSchema.parse(fixture('query-v1'))],
      forms: [electroCraftDocumentSchema.parse(fixture('form-v4'))],
    };

    expect(validateDataOwnershipGraph(graph)).toEqual([]);
  });

  it('migrates ProjectDefinition v1 and Document v1 to their current persisted shapes', () => {
    const project = importElectroCraftProjectDefinition(fixture('project-v1'));
    const document = importElectroCraftDocument(fixture('screen-v1'));

    expect(project).toMatchObject({ migratedFrom: 1, project: { schemaVersion: 3 } });
    expect(document).toMatchObject({
      migratedFrom: 1,
      document: { schemaVersion: 4, formMeta: null, templateMeta: null },
    });
  });
});
