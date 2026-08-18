import * as z from 'zod';
import { parseCanonicalJson, stableCanonicalStringify } from './canonical-json';
import { jsonValueSchema, type JsonValue } from './json-value';

export const electroCraftEngineIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+){0,15}$/);
export type ElectroCraftEngineId = z.infer<typeof electroCraftEngineIdSchema>;

export const electroCraftEnginePayloadSchema = z.strictObject({
  engine: electroCraftEngineIdSchema,
  schemaVersion: z.number().int().positive().max(1_000_000),
  value: jsonValueSchema,
});
export type ElectroCraftEnginePayload = z.infer<typeof electroCraftEnginePayloadSchema>;

export const ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS = Object.freeze({
  'react-querybuilder': Object.freeze({ schemaVersions: Object.freeze([1] as const), owner: '@electrocraft/query-rqb' }),
  tiptap: Object.freeze({ schemaVersions: Object.freeze([1] as const), owner: '@electrocraft/media-tiptap' }),
} as const);

export type ElectroCraftApprovedEngineId = keyof typeof ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS;

export const ELECTROCRAFT_PROHIBITED_ENGINE_PAYLOADS = Object.freeze([
  'puck-app-state',
  'puck-history',
  'rete-node-editor',
  'rete-history',
  'zustand-store',
  'tanstack-query-cache',
] as const);

export function createElectroCraftEnginePayload(
  engine: ElectroCraftEngineId,
  schemaVersion: number,
  value: JsonValue,
): ElectroCraftEnginePayload {
  return electroCraftEnginePayloadSchema.parse({ engine, schemaVersion, value });
}

export function serializeElectroCraftEnginePayload(input: unknown): string {
  return stableCanonicalStringify(electroCraftEnginePayloadSchema.parse(input));
}

export function deserializeElectroCraftEnginePayload(serialized: string): ElectroCraftEnginePayload {
  return electroCraftEnginePayloadSchema.parse(parseCanonicalJson(serialized));
}

export function canonicalEnginePayloadRoundTrip(input: unknown): ElectroCraftEnginePayload {
  return deserializeElectroCraftEnginePayload(serializeElectroCraftEnginePayload(input));
}
