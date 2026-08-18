import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analyzeElectroCraftEnginePayloadCompatibility } from '@electrocraft/application';
import { validateRqbEnginePayload } from '@electrocraft/query-rqb';
import { validateTiptapEnginePayload } from '@electrocraft/media-tiptap';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.9 engine payload compatibility boundary', () => {
  it('resolves approved wrappers to their adapter owners', () => {
    expect(analyzeElectroCraftEnginePayloadCompatibility(fixture('engine-payload-rqb-v1'))).toMatchObject({
      status: 'supported',
      adapterOwner: '@electrocraft/query-rqb',
      diagnostics: [],
    });
    expect(analyzeElectroCraftEnginePayloadCompatibility(fixture('engine-payload-tiptap-v1'))).toMatchObject({
      status: 'supported',
      adapterOwner: '@electrocraft/media-tiptap',
      diagnostics: [],
    });
  });

  it('blocks unknown engines and unsupported wrapper versions with repair guidance', () => {
    const unknown = analyzeElectroCraftEnginePayloadCompatibility({
      engine: 'unknown-engine',
      schemaVersion: 1,
      value: {},
    });
    expect(unknown.status).toBe('blocked');
    expect(unknown.diagnostics[0]).toMatchObject({ code: 'UNSUPPORTED_ENGINE', path: ['engine'] });
    expect(unknown.diagnostics[0]?.repair.length).toBeGreaterThan(10);

    const version = analyzeElectroCraftEnginePayloadCompatibility({
      engine: 'tiptap',
      schemaVersion: 2,
      value: { type: 'doc' },
    });
    expect(version.status).toBe('blocked');
    expect(version.diagnostics[0]).toMatchObject({ code: 'UNSUPPORTED_ENGINE_SCHEMA_VERSION' });
  });

  it('blocks runtime/editor state wrappers even when they are valid JSON', () => {
    const report = analyzeElectroCraftEnginePayloadCompatibility({
      engine: 'rete-node-editor',
      schemaVersion: 1,
      value: { nodes: [] },
    });
    expect(report.status).toBe('blocked');
    expect(report.diagnostics[0]).toMatchObject({ code: 'PROHIBITED_ENGINE_PAYLOAD' });
  });

  it('keeps engine-specific value validation inside the adapter owner', () => {
    expect(() => validateRqbEnginePayload(fixture('engine-payload-rqb-v1'))).not.toThrow();
    expect(() => validateTiptapEnginePayload(fixture('engine-payload-tiptap-v1'))).not.toThrow();

    expect(() =>
      validateRqbEnginePayload({ engine: 'react-querybuilder', schemaVersion: 1, value: { rules: [] } }),
    ).toThrow();
    expect(() =>
      validateTiptapEnginePayload({ engine: 'tiptap', schemaVersion: 1, value: { type: 'paragraph' } }),
    ).toThrow();
  });
});
