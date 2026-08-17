import { QueryBlockerError } from "./query-definition.mjs";

const TRUSTED_ID = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const INDEX_COLUMN = Object.freeze({
  text: "text_value",
  number: "numeric_value",
  boolean: "boolean_value",
  timestamp: "timestamp_value",
});

export function assertTrustedFieldId(fieldId) {
  if (!TRUSTED_ID.test(fieldId)) {
    throw new QueryBlockerError("UNSAFE_FIELD_IDENTIFIER", `Field id no seguro: ${fieldId}`, { fieldId });
  }
  return fieldId;
}

function trustedLiteral(value) {
  return `'${assertTrustedFieldId(value).replaceAll("'", "''")}'`;
}

export function fieldBinding(field, recordAlias = "cr") {
  const fieldId = assertTrustedFieldId(field.id);
  if (field.indexed || field.faceted) {
    const valueColumn = INDEX_COLUMN[field.type];
    if (!valueColumn) throw new QueryBlockerError("UNSUPPORTED_INDEX_TYPE", `Tipo indexado no soportado: ${field.type}`);
    return {
      kind: "record_field_index",
      sql: `(SELECT rfi.${valueColumn} FROM record_field_index rfi WHERE rfi.project_id = ${recordAlias}.project_id AND rfi.model_id = ${recordAlias}.model_id AND rfi.record_id = ${recordAlias}.id AND rfi.field_id = ${trustedLiteral(fieldId)} ORDER BY rfi.ordinal LIMIT 1)`,
    };
  }

  const jsonText = `(${recordAlias}.data ->> ${trustedLiteral(fieldId)})`;
  if (field.type === "text") return { kind: "json", sql: jsonText };
  if (field.type === "number") return { kind: "json", sql: `(NULLIF(${jsonText}, '')::double precision)` };
  if (field.type === "boolean") return { kind: "json", sql: `(NULLIF(${jsonText}, '')::boolean)` };
  throw new QueryBlockerError("UNSUPPORTED_JSON_TYPE", `Tipo JSON no soportado: ${field.type}`);
}

export function facetValueColumn(field) {
  const column = INDEX_COLUMN[field.type];
  if (!(field.indexed || field.faceted) || !field.faceted || !column) {
    throw new QueryBlockerError("FIELD_NOT_FACETED", `Field no facetable: ${field.id}`, { field: field.id });
  }
  return column;
}
