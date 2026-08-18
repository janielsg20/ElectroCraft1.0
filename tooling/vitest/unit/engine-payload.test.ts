import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS,
  ELECTROCRAFT_PROHIBITED_ENGINE_PAYLOADS,
  canonicalEnginePayloadRoundTrip,
  electroCraftEnginePayloadSchema,
  serializeElectroCraftEnginePayload,
} from '@electrocraft/domain';

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as unknown;
}

describe('M02.9 portable engine payload contract', () => {
  it('round-trips RQB and Tiptap wrappers with deterministic JSON', () => {
    for (const name of ['engine-payload-rqb-v1', 'engine-payload-tiptap-v1']) {
      const value = electroCraftEnginePayloadSchema.parse(fixture(name));
      expect(canonicalEnginePayloadRoundTrip(value)).toEqual(value);
      expect(serializeElectroCraftEnginePayload(value)).toBe(serializeElectroCraftEnginePayload(value));
    }
  });

  it('keeps the initial allowlist narrow and versioned', () => {
    expect(Object.keys(ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS).sort()).toEqual(['react-querybuilder', 'tiptap']);
    expect(ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS['react-querybuilder'].schemaVersions).toEqual([1]);
    expect(ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS.tiptap.schemaVersions).toEqual([1]);
  });

  it('keeps runtime/editor state engines explicitly prohibited', () => {
    expect(ELECTROCRAFT_PROHIBITED_ENGINE_PAYLOADS).toEqual(
      expect.arrayContaining(['puck-app-state', 'rete-node-editor', 'zustand-store', 'tanstack-query-cache']),
    );
  });

  it('rejects non-JSON and malformed wrappers at the domain boundary', () => {
    expect(electroCraftEnginePayloadSchema.safeParse({ engine: 'tiptap', schemaVersion: 0, value: {} }).success).toBe(
      false,
    );
    expect(
      electroCraftEnginePayloadSchema.safeParse({ engine: 'tiptap', schemaVersion: 1, value: undefined }).success,
    ).toBe(false);
    expect(
      electroCraftEnginePayloadSchema.safeParse({ engine: 'Tiptap!', schemaVersion: 1, value: { type: 'doc' } })
        .success,
    ).toBe(false);
  });
});
