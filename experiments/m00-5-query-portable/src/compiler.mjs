import { formatQuery } from "@react-querybuilder/core";
import { fieldBinding, facetValueColumn } from "./bindings.mjs";
import { QueryBlockerError, validateQueryDefinition } from "./query-definition.mjs";
import { getField } from "./schema-fixture.mjs";

const FALLBACK_MARKER = "__ELECTROCRAFT_BLOCKED__";

function tokenizedRqbQuery(query) {
  const fieldToToken = new Map();
  const tokenToField = new Map();
  let next = 0;

  const visit = (node) => {
    if (Array.isArray(node.rules)) {
      return { ...node, rules: node.rules.map(visit) };
    }
    let token = fieldToToken.get(node.field);
    if (!token) {
      token = `__ecf${next++}__`;
      fieldToToken.set(node.field, token);
      tokenToField.set(token, node.field);
    }
    return { ...node, field: token };
  };

  return { query: visit(query), tokenToField };
}

export function formatWithRqb(definition, schema) {
  const validated = validateQueryDefinition(definition, schema);
  const { query, tokenToField } = tokenizedRqbQuery(validated.query);
  const formatted = formatQuery(query, {
    format: "parameterized",
    paramPrefix: "$",
    numberedParams: true,
    parseNumbers: true,
    fallbackExpression: FALLBACK_MARKER,
  });
  if (!formatted || typeof formatted.sql !== "string" || !Array.isArray(formatted.params)) {
    throw new QueryBlockerError("RQB_FORMATTER_CONTRACT", "RQB no devolvió ParameterizedSQL válido.");
  }
  if (formatted.sql.includes(FALLBACK_MARKER)) {
    throw new QueryBlockerError("RQB_FALLBACK_BLOCKED", "RQB intentó usar fallback; ElectroCraft bloquea la query.");
  }
  return { validated, formatted, tokenToField };
}

export function compilePortableWhere(definition, schema) {
  const { validated, formatted, tokenToField } = formatWithRqb(definition, schema);
  const modelId = validated.source.modelId;
  let sql = formatted.sql;
  const bindings = [];

  for (const [token, fieldId] of tokenToField.entries()) {
    const field = getField(schema, modelId, fieldId);
    const binding = fieldBinding(field, "cr");
    sql = sql.split(token).join(binding.sql);
    bindings.push({ fieldId, kind: binding.kind });
  }

  if (/__ecf\d+__/.test(sql)) {
    throw new QueryBlockerError("UNBOUND_QUERY_FIELD", "Quedó un token de field sin binding físico.");
  }

  return {
    whereSql: sql,
    params: [...formatted.params],
    oss: { sql: formatted.sql, params: [...formatted.params] },
    bindings,
    modelId,
  };
}

export function compileSelect(definition, schema, { projectId }) {
  const compiled = compilePortableWhere(definition, schema);
  const projectParam = compiled.params.length + 1;
  const modelParam = compiled.params.length + 2;
  return {
    ...compiled,
    sql: `SELECT cr.id, cr.project_id, cr.model_id, cr.data, cr.state FROM content_records cr WHERE cr.project_id = $${projectParam} AND cr.model_id = $${modelParam} AND ${compiled.whereSql} ORDER BY cr.id`,
    params: [...compiled.params, projectId, compiled.modelId],
  };
}

export async function executePortableQuery(client, { projectId, definition, schema }) {
  const compiled = compileSelect(definition, schema, { projectId });
  const result = await client.query(compiled.sql, compiled.params);
  return { rows: result.rows, compiled };
}

export async function facetCount(client, { projectId, modelId, fieldId, schema }) {
  const field = getField(schema, modelId, fieldId);
  if (!field) throw new QueryBlockerError("UNKNOWN_QUERY_FIELD", `Field no declarado: ${fieldId}`);
  const valueColumn = facetValueColumn(field);
  const result = await client.query(
    `SELECT ${valueColumn} AS value, count(*)::int AS count FROM record_field_index WHERE project_id = $1 AND model_id = $2 AND field_id = $3 AND faceted = true GROUP BY ${valueColumn} ORDER BY ${valueColumn}`,
    [projectId, modelId, fieldId],
  );
  return result.rows.map((row) => ({ value: row.value, count: Number(row.count) }));
}

export async function executeMultiSource(client, { projectId, sources, schema }) {
  const output = [];
  for (const source of sources) {
    const { rows } = await executePortableQuery(client, { projectId, definition: source.definition, schema });
    for (const row of rows) {
      output.push({ sourceId: source.id, recordId: row.id, modelId: row.model_id, data: row.data });
    }
  }
  return output;
}
