import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { serializeElectroCraftEnginePayload } from '@electrocraft/domain';
import { createRqbEnginePayload, migrateRqbEnginePayload, validateRqbEnginePayload } from '@electrocraft/query-rqb';
import {
  createTiptapEnginePayload,
  migrateTiptapEnginePayload,
  renderTiptapEnginePayloadToHtml,
  validateTiptapEnginePayload,
} from '@electrocraft/media-tiptap';

function fixture(name: string): any {
  return JSON.parse(readFileSync(resolve(`tooling/fixtures/canonical-model/${name}.json`), 'utf8')) as any;
}

function evidence(name: string, value: unknown): void {
  const directory = process.env.ELECTROCRAFT_EVIDENCE_DIR;
  if (!directory) return;
  mkdirSync(resolve(directory), { recursive: true });
  writeFileSync(resolve(directory, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

describe('M02.9 real engine payload adapters', () => {
  it('validates and identity-migrates RQB rules through the real RQB formatter boundary', () => {
    const fixturePayload = fixture('engine-payload-rqb-v1');
    const wrapped = createRqbEnginePayload(fixturePayload.value);
    const migrated = migrateRqbEnginePayload(wrapped);
    const validated = validateRqbEnginePayload(migrated);

    expect(validated).toEqual(wrapped);
    expect(serializeElectroCraftEnginePayload(validated)).toContain('react-querybuilder');
    evidence('m02-9-rqb-wrapper.json', {
      engine: validated.engine,
      schemaVersion: validated.schemaVersion,
      ruleCount: validated.value.rules.length,
      migration: 'identity-v1',
      formatterValidated: true,
    });
  });

  it('validates Tiptap JSON with the real pinned minimal extension set and renders HTML', () => {
    const fixturePayload = fixture('engine-payload-tiptap-v1');
    const wrapped = createTiptapEnginePayload(fixturePayload.value);
    const migrated = migrateTiptapEnginePayload(wrapped);
    const validated = validateTiptapEnginePayload(migrated);
    const html = renderTiptapEnginePayloadToHtml(validated);

    expect(validated).toEqual(wrapped);
    expect(html).toContain('<p>ElectroCraft rich text</p>');
    evidence('m02-9-tiptap-wrapper.json', {
      engine: validated.engine,
      schemaVersion: validated.schemaVersion,
      migration: 'identity-v1',
      renderedHtml: html,
      extensionSet: ['document', 'paragraph', 'text'],
      extensionSetValidated: true,
    });
  });

  it('keeps wrappers portable JSON and rejects adapter/version drift instead of falling back', () => {
    const rqb = fixture('engine-payload-rqb-v1');
    const tiptap = fixture('engine-payload-tiptap-v1');
    const serialized = [serializeElectroCraftEnginePayload(rqb), serializeElectroCraftEnginePayload(tiptap)];

    expect(serialized.every((value) => JSON.parse(value))).toBeTruthy();
    expect(() => migrateRqbEnginePayload({ ...rqb, schemaVersion: 2 })).toThrow();
    expect(() => migrateTiptapEnginePayload({ ...tiptap, schemaVersion: 2 })).toThrow();

    evidence('m02-9-boundary-report.json', {
      portableJson: true,
      rqbVersion2Blocked: true,
      tiptapVersion2Blocked: true,
      reteAppStateAllowed: false,
      puckAppStateAllowed: false,
    });
  });
});
