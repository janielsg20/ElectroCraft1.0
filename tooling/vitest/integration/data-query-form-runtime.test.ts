import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroCraftObjectIdSchema,
  electroCraftQueryDefinitionSchema,
  stableCanonicalStringify,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';
import {
  ConnectorRegistry,
  ProjectDocumentService,
  type CanonicalProjectObjectKind,
  type CanonicalProjectObjectRecord,
  type CanonicalProjectObjectRepository,
  type ElectroCraftDataConnector,
} from '@electrocraft/application';
import { compilePortableQuery, executePortableQuery } from '@electrocraft/query-rqb';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

class MemoryProjectRepository implements CanonicalProjectObjectRepository {
  readonly records = new Map<string, CanonicalProjectObjectRecord>();

  private key(kind: CanonicalProjectObjectKind, id: ElectroCraftObjectId): string {
    return `${kind}:${id}`;
  }

  async putMany(records: readonly CanonicalProjectObjectRecord[]): Promise<void> {
    for (const record of records) this.records.set(this.key(record.kind, record.id), structuredClone(record));
  }

  async get(kind: CanonicalProjectObjectKind, id: ElectroCraftObjectId): Promise<CanonicalProjectObjectRecord | null> {
    return structuredClone(this.records.get(this.key(kind, id)) ?? null);
  }
}

describe('M02.3 portable query/runtime integration', () => {
  it('keeps injection payloads in parameters while RQB emits a parameterized predicate', () => {
    const schema = electroCraftDataSchemaSchema.parse(fixture('data-schema-v1'));
    const query = electroCraftQueryDefinitionSchema.parse(fixture('query-v1'));
    const attack = `power' OR 1=1 --`;
    const firstRule = query.conditions.rules[0];
    if (!firstRule || 'rules' in firstRule) throw new TypeError('fixture first query node must be a rule');
    const mutated = {
      ...query,
      conditions: {
        ...query.conditions,
        rules: [{ ...firstRule, value: attack }, ...query.conditions.rules.slice(1)],
      },
    };

    const compiled = compilePortableQuery(mutated, schema);
    expect(compiled.predicate).toContain('$1');
    expect(compiled.predicate).not.toContain(attack);
    expect(compiled.params).toContain(attack);
    expect(compiled.fieldBindings.map(({ fieldRef }) => fieldRef)).toEqual([
      'ec_field_000000000000a',
      'ec_field_000000000000c',
    ]);
  });

  it('executes through the ephemeral application ConnectorRegistry and returns portable rows', async () => {
    const source = electroCraftDataSourceDefinitionSchema.parse(fixture('data-source-v1'));
    const schema = electroCraftDataSchemaSchema.parse(fixture('data-schema-v1'));
    const query = electroCraftQueryDefinitionSchema.parse(fixture('query-v1'));
    const registry = new ConnectorRegistry();
    let observedPredicate = '';

    const connector: ElectroCraftDataConnector = {
      adapterId: source.adapterId,
      async execute(request) {
        observedPredicate = request.compiled.predicate;
        return {
          status: 'ready',
          total: 1,
          rows: [
            {
              sourceId: source.id,
              recordId: 'record-1',
              modelId: query.modelRef,
              data: { title: 'Power Bank', price: 29.99 },
            },
          ],
        };
      },
    };
    registry.register(connector);

    const result = await executePortableQuery(registry, source, schema, query);
    expect(observedPredicate).toContain('$1');
    expect(result).toMatchObject({ status: 'ready', total: 1 });
    expect(result.rows[0]).toMatchObject({ recordId: 'record-1', data: { title: 'Power Bank' } });
  });

  it('reopens legacy v1 project/document records, migrates them to v3, and writes them back', async () => {
    const projectV1 = fixture('project-v1') as { id: string };
    const screenV1 = fixture('screen-v1') as { id: string };
    const projectId = electroCraftObjectIdSchema.parse(projectV1.id);
    const documentId = electroCraftObjectIdSchema.parse(screenV1.id);
    const repository = new MemoryProjectRepository();

    await repository.putMany([
      {
        kind: 'project',
        id: projectId,
        schemaVersion: 1,
        payload: stableCanonicalStringify(projectV1),
      },
      {
        kind: 'document',
        id: documentId,
        schemaVersion: 1,
        payload: stableCanonicalStringify(screenV1),
      },
    ]);

    const reopened = await new ProjectDocumentService(repository).reopen(projectId);
    expect(reopened.status).toBe('ready');
    if (reopened.status !== 'ready') return;
    expect(reopened.migratedProject).toBe(true);
    expect(reopened.migratedDocumentIds).toEqual([documentId]);
    expect(reopened.project.schemaVersion).toBe(3);
    expect(reopened.documents[0]).toMatchObject({ schemaVersion: 4, formMeta: null, templateMeta: null });

    const storedProject = await repository.get('project', projectId);
    const storedDocument = await repository.get('document', documentId);
    expect(JSON.parse(storedProject?.payload ?? '{}')).toMatchObject({
      schemaVersion: 3,
      dataSourceRefs: [],
      originBlueprint: null,
      requiredCapabilities: [],
      targetCapabilityOverrides: {},
      userRegistryDefinitionRefs: [],
    });
    expect(JSON.parse(storedDocument?.payload ?? '{}')).toMatchObject({
      schemaVersion: 4,
      formMeta: null,
      templateMeta: null,
    });
  });
});
