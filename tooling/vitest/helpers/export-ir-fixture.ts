import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ElectroCraftExportIRSource } from '@electrocraft/application';

export function canonicalModelFixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as T;
}

export function canonicalExportIrSource(): ElectroCraftExportIRSource {
  return {
    project: canonicalModelFixture('project-v3'),
    documents: [
      canonicalModelFixture('template-v3'),
      canonicalModelFixture('screen-v3'),
      canonicalModelFixture('form-v3'),
    ],
    routes: [canonicalModelFixture('route-v1')],
    navigations: [canonicalModelFixture('navigation-v1')],
    dataSources: [canonicalModelFixture('data-source-v1')],
    dataSchemas: [canonicalModelFixture('data-schema-v1')],
    queries: [canonicalModelFixture('query-v1')],
    states: [canonicalModelFixture('state-v1')],
    actionGraphs: [canonicalModelFixture('action-graph-v1')],
    roles: [canonicalModelFixture('role-v1')],
    permissionPolicies: [canonicalModelFixture('permission-policy-v1')],
    theme: canonicalModelFixture('theme-v1'),
    mediaManifest: canonicalModelFixture('export-ir-media-manifest-v1'),
  };
}
