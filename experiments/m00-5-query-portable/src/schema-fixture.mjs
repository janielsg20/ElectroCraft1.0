export const dataSchema = Object.freeze({
  id: "electrocraft-data-schema-query-poc",
  version: 1,
  models: [
    {
      id: "article",
      fields: [
        { id: "category", type: "text", indexed: true, faceted: true },
        { id: "title", type: "text" },
        { id: "description", type: "text" },
        { id: "price", type: "number" },
      ],
    },
    {
      id: "customer",
      fields: [
        { id: "vip", type: "boolean", indexed: true, faceted: true },
        { id: "name", type: "text" },
        { id: "city", type: "text" },
      ],
    },
  ],
});

export function getModel(schema, modelId) {
  return schema.models.find((model) => model.id === modelId) ?? null;
}

export function getField(schema, modelId, fieldId) {
  return getModel(schema, modelId)?.fields.find((field) => field.id === fieldId) ?? null;
}
