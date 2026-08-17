export function findModel(schema, modelId) {
  const model = schema?.models?.find((candidate) => candidate.id === modelId);
  if (!model) throw new Error(`Modelo lógico no encontrado: ${modelId}`);
  return model;
}

export function addLogicalField(schema, modelId, field) {
  const next = structuredClone(schema);
  const model = findModel(next, modelId);
  if (model.fields.some((candidate) => candidate.id === field.id)) {
    throw new Error(`Field lógico duplicado: ${field.id}`);
  }
  model.fields.push(structuredClone(field));
  return next;
}

function typedValue(field, value) {
  if (value === null || value === undefined) return null;
  if (field.type === "number") {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) throw new Error(`Valor numérico inválido para ${field.id}`);
    return { valueKind: "number", numericValue };
  }
  if (field.type === "boolean") {
    if (typeof value !== "boolean") throw new Error(`Valor booleano inválido para ${field.id}`);
    return { valueKind: "boolean", booleanValue: value };
  }
  if (field.type === "datetime") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new Error(`Fecha inválida para ${field.id}`);
    return { valueKind: "timestamp", timestampValue: date };
  }
  return { valueKind: "text", textValue: String(value) };
}

export function buildRecordIndexRows({ projectId, modelId, recordId, data, schema }) {
  const model = findModel(schema, modelId);
  const rows = [];
  for (const field of model.fields) {
    if (!(field.faceted || field.searchable || field.sortable || field.indexed)) continue;
    const raw = data[field.id];
    const values = Array.isArray(raw) ? raw : [raw];
    values.forEach((value, ordinal) => {
      const normalized = typedValue(field, value);
      if (!normalized) return;
      rows.push({
        projectId,
        modelId,
        recordId,
        fieldId: field.id,
        ordinal,
        faceted: Boolean(field.faceted),
        textValue: null,
        numericValue: null,
        booleanValue: null,
        timestampValue: null,
        ...normalized,
      });
    });
  }
  return rows;
}
