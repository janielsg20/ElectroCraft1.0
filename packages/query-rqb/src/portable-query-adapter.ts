import { formatQuery, type RuleGroupType, type RuleType } from '@react-querybuilder/core';
import {
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
  electroCraftQueryDefinitionSchema,
  validateQueryDefinitionReferences,
  type ElectroCraftDataSchema,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftObjectId,
  type ElectroCraftQueryDefinition,
  type ElectroCraftQueryGroup,
  type ElectroCraftQueryResult,
  type JsonValue,
} from '@electrocraft/domain';
import { ConnectorRegistry } from '@electrocraft/application';
import { resolvePortableFieldBinding, type PortableFieldBinding } from '@electrocraft/data-core';

const fallbackMarker = '__ELECTROCRAFT_BLOCKED__';

export type PortableQueryBlockedCode =
  | 'INVALID_QUERY_REFERENCE'
  | 'RQB_FORMATTER_CONTRACT'
  | 'RQB_FALLBACK_BLOCKED'
  | 'UNBOUND_QUERY_FIELD';

export class PortableQueryBlockedError extends Error {
  constructor(
    readonly code: PortableQueryBlockedCode,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = 'PortableQueryBlockedError';
  }
}

export interface CompiledPortableQuery {
  predicate: string;
  params: JsonValue[];
  fieldBindings: Array<{ token: string; fieldRef: ElectroCraftObjectId; binding: PortableFieldBinding }>;
}

interface TokenizedQuery {
  query: RuleGroupType;
  tokenToField: Map<string, ElectroCraftObjectId>;
}

function tokenizeGroup(group: ElectroCraftQueryGroup): TokenizedQuery {
  const fieldToToken = new Map<ElectroCraftObjectId, string>();
  const tokenToField = new Map<string, ElectroCraftObjectId>();
  let next = 0;

  const visit = (node: ElectroCraftQueryGroup | ElectroCraftQueryGroup['rules'][number]): RuleGroupType | RuleType => {
    if ('rules' in node) {
      return {
        combinator: node.combinator,
        rules: node.rules.map((child) => visit(child)),
      } as RuleGroupType;
    }

    let token = fieldToToken.get(node.fieldRef);
    if (!token) {
      token = `__ecf${next++}__`;
      fieldToToken.set(node.fieldRef, token);
      tokenToField.set(token, node.fieldRef);
    }
    return {
      field: token,
      operator: node.operator,
      value: node.value,
      valueSource: 'value',
    } as RuleType;
  };

  return { query: visit(group) as RuleGroupType, tokenToField };
}

function assertJsonParams(params: unknown[]): JsonValue[] {
  return params.map((param, index) => {
    if (
      param === null ||
      typeof param === 'string' ||
      typeof param === 'number' ||
      typeof param === 'boolean' ||
      Array.isArray(param) ||
      typeof param === 'object'
    ) {
      return param as JsonValue;
    }
    throw new PortableQueryBlockedError('RQB_FORMATTER_CONTRACT', 'RQB emitted a non-JSON query parameter', { index });
  });
}

export function compilePortableQuery(queryInput: unknown, schemaInput: unknown): CompiledPortableQuery {
  const query = electroCraftQueryDefinitionSchema.parse(queryInput);
  const schema = electroCraftDataSchemaSchema.parse(schemaInput);
  const diagnostics = validateQueryDefinitionReferences(query, schema);
  if (diagnostics.length > 0) {
    throw new PortableQueryBlockedError('INVALID_QUERY_REFERENCE', 'query references or operators are invalid', {
      diagnostics,
    });
  }

  const tokenized = tokenizeGroup(query.conditions);
  const formatted = formatQuery(tokenized.query, {
    format: 'parameterized',
    paramPrefix: '$',
    numberedParams: true,
    parseNumbers: true,
    fallbackExpression: fallbackMarker,
  }) as { sql?: unknown; params?: unknown };

  if (typeof formatted.sql !== 'string' || !Array.isArray(formatted.params)) {
    throw new PortableQueryBlockedError('RQB_FORMATTER_CONTRACT', 'RQB did not return parameterized SQL');
  }
  if (formatted.sql.includes(fallbackMarker)) {
    throw new PortableQueryBlockedError('RQB_FALLBACK_BLOCKED', 'RQB attempted a fallback expression');
  }

  let predicate = formatted.sql;
  const fieldBindings: CompiledPortableQuery['fieldBindings'] = [];
  for (const [token, fieldRef] of tokenized.tokenToField.entries()) {
    const binding = resolvePortableFieldBinding(schema, query.modelRef, fieldRef);
    predicate = predicate.split(token).join(token);
    fieldBindings.push({ token, fieldRef, binding });
  }

  if (/__ecf\d+__/.test(predicate) && fieldBindings.length === 0) {
    throw new PortableQueryBlockedError('UNBOUND_QUERY_FIELD', 'query contains an unbound canonical field token');
  }

  return { predicate, params: assertJsonParams(formatted.params), fieldBindings };
}

export async function executePortableQuery(
  registry: ConnectorRegistry,
  sourceInput: unknown,
  schemaInput: unknown,
  queryInput: unknown,
): Promise<ElectroCraftQueryResult> {
  const source: ElectroCraftDataSourceDefinition = electroCraftDataSourceDefinitionSchema.parse(sourceInput);
  const schema: ElectroCraftDataSchema = electroCraftDataSchemaSchema.parse(schemaInput);
  const query: ElectroCraftQueryDefinition = electroCraftQueryDefinitionSchema.parse(queryInput);
  const compiled = compilePortableQuery(query, schema);
  return registry.execute({ source, query, compiled });
}
