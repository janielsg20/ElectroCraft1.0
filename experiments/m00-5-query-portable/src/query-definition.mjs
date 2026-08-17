import { getField, getModel } from "./schema-fixture.mjs";

const TEXT_OPERATORS = new Set(["=", "!=", "contains", "beginsWith", "endsWith"]);
const NUMBER_OPERATORS = new Set(["=", "!=", "<", "<=", ">", ">="]);
const BOOLEAN_OPERATORS = new Set(["=", "!="]);
const COMBINATORS = new Set(["and", "or"]);

export class QueryBlockerError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "QueryBlockerError";
    this.code = code;
    this.details = details;
  }
}

export function createQueryDefinition({ id, modelId, query }) {
  return {
    type: "ElectroCraftQueryDefinition",
    version: 1,
    id,
    engine: {
      owner: "@react-querybuilder/core",
      version: "8.23.0",
      format: "parameterized",
    },
    source: { modelId },
    query: structuredClone(query),
  };
}

function allowedOperators(type) {
  if (type === "text") return TEXT_OPERATORS;
  if (type === "number") return NUMBER_OPERATORS;
  if (type === "boolean") return BOOLEAN_OPERATORS;
  return new Set();
}

function validateGroup(group, { schema, modelId, path = "query" }) {
  if (!group || typeof group !== "object" || !Array.isArray(group.rules)) {
    throw new QueryBlockerError("INVALID_QUERY_GROUP", `Grupo inválido en ${path}.`, { path });
  }
  if (!COMBINATORS.has(group.combinator)) {
    throw new QueryBlockerError("UNSUPPORTED_QUERY_COMBINATOR", `Combinator unsupported: ${group.combinator}`, { path, combinator: group.combinator });
  }
  if (group.rules.length === 0) {
    throw new QueryBlockerError("EMPTY_QUERY_GROUP", `Grupo vacío en ${path}.`, { path });
  }

  group.rules.forEach((node, index) => {
    const nodePath = `${path}.rules[${index}]`;
    if (Array.isArray(node?.rules)) {
      validateGroup(node, { schema, modelId, path: nodePath });
      return;
    }
    if (!node || typeof node !== "object") {
      throw new QueryBlockerError("INVALID_QUERY_RULE", `Rule inválida en ${nodePath}.`, { path: nodePath });
    }
    if (node.valueSource && node.valueSource !== "value") {
      throw new QueryBlockerError("UNSUPPORTED_VALUE_SOURCE", `valueSource unsupported: ${node.valueSource}`, { path: nodePath });
    }
    const field = getField(schema, modelId, node.field);
    if (!field) {
      throw new QueryBlockerError("UNKNOWN_QUERY_FIELD", `Field no declarado: ${node.field}`, { path: nodePath, field: node.field });
    }
    if (!allowedOperators(field.type).has(node.operator)) {
      throw new QueryBlockerError("UNSUPPORTED_QUERY_OPERATOR", `Operator unsupported para ${field.type}: ${node.operator}`, {
        path: nodePath,
        field: node.field,
        operator: node.operator,
      });
    }
  });
}

export function validateQueryDefinition(definition, schema) {
  if (!definition || definition.type !== "ElectroCraftQueryDefinition" || definition.version !== 1) {
    throw new QueryBlockerError("UNSUPPORTED_QUERY_DEFINITION", "ElectroCraftQueryDefinition/version no soportado.");
  }
  if (definition.engine?.owner !== "@react-querybuilder/core" || definition.engine?.version !== "8.23.0") {
    throw new QueryBlockerError("UNSUPPORTED_QUERY_ENGINE", "Wrapper RQB/version no soportado.", { engine: definition.engine });
  }
  const modelId = definition.source?.modelId;
  if (!getModel(schema, modelId)) {
    throw new QueryBlockerError("UNKNOWN_QUERY_MODEL", `Modelo no declarado: ${modelId}`, { modelId });
  }
  validateGroup(definition.query, { schema, modelId });
  return structuredClone(definition);
}
