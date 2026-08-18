import {
  ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS,
  ELECTROCRAFT_PROHIBITED_ENGINE_PAYLOADS,
  electroCraftEnginePayloadSchema,
  type ElectroCraftEnginePayload,
} from '@electrocraft/domain';

export type ElectroCraftEnginePayloadCompatibilityCode =
  'INVALID_ENGINE_PAYLOAD' | 'PROHIBITED_ENGINE_PAYLOAD' | 'UNSUPPORTED_ENGINE' | 'UNSUPPORTED_ENGINE_SCHEMA_VERSION';

export interface ElectroCraftEnginePayloadCompatibilityDiagnostic {
  code: ElectroCraftEnginePayloadCompatibilityCode;
  path: Array<string | number>;
  cause: string;
  repair: string;
}

export interface ElectroCraftEnginePayloadCompatibilityReport {
  status: 'supported' | 'blocked';
  payload: ElectroCraftEnginePayload | null;
  adapterOwner: string | null;
  diagnostics: ElectroCraftEnginePayloadCompatibilityDiagnostic[];
}

function blocked(
  code: ElectroCraftEnginePayloadCompatibilityCode,
  cause: string,
  repair: string,
  path: Array<string | number> = [],
): ElectroCraftEnginePayloadCompatibilityReport {
  return { status: 'blocked', payload: null, adapterOwner: null, diagnostics: [{ code, path, cause, repair }] };
}

export function analyzeElectroCraftEnginePayloadCompatibility(
  input: unknown,
): ElectroCraftEnginePayloadCompatibilityReport {
  const parsed = electroCraftEnginePayloadSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return blocked(
      'INVALID_ENGINE_PAYLOAD',
      issue?.message ?? 'Engine payload wrapper is invalid.',
      'Repair the portable wrapper to { engine, schemaVersion, value } JSON before resolving an adapter.',
      issue?.path.filter((part): part is string | number => typeof part === 'string' || typeof part === 'number') ?? [],
    );
  }

  const payload = parsed.data;
  if ((ELECTROCRAFT_PROHIBITED_ENGINE_PAYLOADS as readonly string[]).includes(payload.engine)) {
    return blocked(
      'PROHIBITED_ENGINE_PAYLOAD',
      `${payload.engine} is runtime/editor state and cannot be persisted as an engine payload.`,
      'Persist the corresponding ElectroCraft canonical definition and reconstruct runtime state inside its owner adapter.',
      ['engine'],
    );
  }

  const supported =
    ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS[payload.engine as keyof typeof ELECTROCRAFT_APPROVED_ENGINE_PAYLOADS];
  if (!supported) {
    return blocked(
      'UNSUPPORTED_ENGINE',
      `No ElectroCraft engine payload adapter is registered for ${payload.engine}.`,
      'Use an approved engine wrapper or add a versioned adapter with validation and migration before persistence.',
      ['engine'],
    );
  }

  if (!(supported.schemaVersions as readonly number[]).includes(payload.schemaVersion)) {
    return blocked(
      'UNSUPPORTED_ENGINE_SCHEMA_VERSION',
      `${payload.engine} schemaVersion ${payload.schemaVersion} is not supported.`,
      `Migrate the payload through ${supported.owner} to a supported wrapper schema before use.`,
      ['schemaVersion'],
    );
  }

  return {
    status: 'supported',
    payload,
    adapterOwner: supported.owner,
    diagnostics: [],
  };
}
