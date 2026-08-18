import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  electroCraftDataSourceDefinitionSchema,
  electroCraftProjectDefinitionSchema,
  serializeElectroCraftProjectDefinition,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.3 data/query/form boundaries', () => {
  it('keeps connector registry and credentials outside persisted ProjectDefinition', () => {
    const project = electroCraftProjectDefinitionSchema.parse(fixture('project-v2'));
    const serialized = serializeElectroCraftProjectDefinition(project);

    expect(serialized).not.toMatch(/ConnectorRegistry|connectorRegistry|password|accessToken|apiKey/i);
    expect(project).not.toHaveProperty('connectorRegistry');
  });

  it('keeps React Query Builder inside query-rqb and out of domain/data-core/forms', () => {
    const domainSource = [
      'packages/domain/src/contracts/data-definition.ts',
      'packages/domain/src/contracts/query-definition.ts',
      'packages/domain/src/contracts/document.ts',
    ]
      .map((file) => readFileSync(resolve(file), 'utf8'))
      .join('\n');
    const dataCoreSource = readFileSync(resolve('packages/data-core/src/data-ownership.ts'), 'utf8');
    const formsSource = readFileSync(resolve('packages/forms/src/form-contract.ts'), 'utf8');
    const queryAdapter = readFileSync(resolve('packages/query-rqb/src/portable-query-adapter.ts'), 'utf8');

    expect(domainSource).not.toMatch(/@react-querybuilder\/core|@electric-sql\/pglite/);
    expect(dataCoreSource).not.toMatch(/@react-querybuilder\/core|@electric-sql\/pglite/);
    expect(formsSource).not.toMatch(/@react-querybuilder\/core|@electric-sql\/pglite/);
    expect(queryAdapter).toMatch(/from ['"]@react-querybuilder\/core['"]/);
  });

  it('keeps Form as an ElectroCraftDocument specialization instead of a parallel canonical tree', () => {
    const domainDocument = readFileSync(resolve('packages/domain/src/contracts/document.ts'), 'utf8');
    const formsAdapter = readFileSync(resolve('packages/forms/src/form-contract.ts'), 'utf8');

    expect(domainDocument).toMatch(/kind === 'form'/);
    expect(domainDocument).toMatch(/formMeta/);
    expect(formsAdapter).toMatch(/electroCraftDocumentSchema/);
    expect(formsAdapter).not.toMatch(/class ElectroCraftForm|interface ElectroCraftFormTree/);
  });

  it('requires authRef instead of storing secret-shaped config keys', () => {
    const source = fixture('data-source-v1') as Record<string, unknown>;
    expect(electroCraftDataSourceDefinitionSchema.safeParse({ ...source, config: { clientSecret: 'x' } }).success).toBe(
      false,
    );
    expect(
      electroCraftDataSourceDefinitionSchema.safeParse({ ...source, authRef: 'ec_auth_000000000000g' }).success,
    ).toBe(true);
  });
});
