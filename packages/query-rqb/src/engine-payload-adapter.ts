import { formatQuery, type RuleGroupType, type RuleType } from '@react-querybuilder/core';
import {
  createElectroCraftEnginePayload,
  electroCraftEnginePayloadSchema,
  type ElectroCraftEnginePayload,
  type JsonValue,
} from '@electrocraft/domain';
import { analyzeElectroCraftEnginePayloadCompatibility } from '@electrocraft/application';

export class RqbEnginePayloadBlockedError extends Error {
  constructor(
    readonly code: 'INVALID_RQB_WRAPPER' | 'INVALID_RQB_VALUE' | 'UNSUPPORTED_RQB_WRAPPER_VERSION',
    message: string,
  ) {
    super(message);
    this.name = 'RqbEnginePayloadBlockedError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateRqbNode(value: unknown): RuleGroupType | RuleType {
  if (!isRecord(value)) throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB node must be an object');
  if (Array.isArray(value.rules)) {
    if (value.combinator !== 'and' && value.combinator !== 'or') {
      throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB group combinator must be and/or');
    }
    if (value.rules.length === 0 || value.rules.length > 200) {
      throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB group must contain 1..200 rules');
    }
    return {
      combinator: value.combinator,
      rules: value.rules.map((rule) => validateRqbNode(rule)),
    } as RuleGroupType;
  }
  if (typeof value.field !== 'string' || !value.field) {
    throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB rule field is required');
  }
  if (typeof value.operator !== 'string' || !value.operator) {
    throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB rule operator is required');
  }
  if (value.valueSource !== undefined && value.valueSource !== 'value') {
    throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB persisted valueSource must be value');
  }
  return {
    field: value.field,
    operator: value.operator,
    value: value.value,
    valueSource: 'value',
  } as RuleType;
}

export function validateRqbEnginePayload(input: unknown): ElectroCraftEnginePayload {
  const wrapper = electroCraftEnginePayloadSchema.safeParse(input);
  if (!wrapper.success || wrapper.data.engine !== 'react-querybuilder') {
    throw new RqbEnginePayloadBlockedError('INVALID_RQB_WRAPPER', 'Expected react-querybuilder engine payload wrapper');
  }
  const compatibility = analyzeElectroCraftEnginePayloadCompatibility(wrapper.data);
  if (compatibility.status === 'blocked') {
    throw new RqbEnginePayloadBlockedError(
      'UNSUPPORTED_RQB_WRAPPER_VERSION',
      compatibility.diagnostics[0]?.cause ?? 'Unsupported RQB wrapper version',
    );
  }
  const query = validateRqbNode(wrapper.data.value) as RuleGroupType;
  const formatted = formatQuery(query, {
    format: 'parameterized',
    paramPrefix: '$',
    numberedParams: true,
    parseNumbers: true,
  }) as { sql?: unknown; params?: unknown };
  if (typeof formatted.sql !== 'string' || !Array.isArray(formatted.params)) {
    throw new RqbEnginePayloadBlockedError('INVALID_RQB_VALUE', 'RQB formatter rejected the persisted rules payload');
  }
  return wrapper.data;
}

export function createRqbEnginePayload(value: JsonValue): ElectroCraftEnginePayload {
  const payload = createElectroCraftEnginePayload('react-querybuilder', 1, value);
  return validateRqbEnginePayload(payload);
}

export function migrateRqbEnginePayload(input: unknown): ElectroCraftEnginePayload {
  return validateRqbEnginePayload(input);
}
