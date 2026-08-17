export const fixture = Object.freeze({
  project: { id: "project-reserva-studio", name: "Reserva Studio", status: "active", metadata: { poc: "M00.4" } },
  projectObjects: [
    {
      projectId: "project-reserva-studio",
      objectId: "screen-home",
      kind: "document",
      version: 1,
      payload: { kind: "screen", title: "Inicio", nodes: [{ id: "hero", type: "container" }] },
    },
    {
      projectId: "project-reserva-studio",
      objectId: "theme-main",
      kind: "theme",
      version: 1,
      payload: { name: "Principal", radius: "md", density: "high" },
    },
  ],
  dataSchema: {
    id: "schema-internal",
    models: [
      {
        id: "article",
        name: "Artículo",
        fields: [
          { id: "title", type: "text", searchable: true },
          { id: "category", type: "text", faceted: true },
          { id: "price", type: "number", sortable: true },
        ],
      },
      {
        id: "customer",
        name: "Cliente",
        fields: [
          { id: "name", type: "text", searchable: true },
          { id: "vip", type: "boolean", faceted: true },
        ],
      },
    ],
  },
  records: [
    {
      id: "article-001",
      projectId: "project-reserva-studio",
      modelId: "article",
      data: { title: "Fuente regulable", category: "power", price: 149.99 },
      state: "published",
    },
    {
      id: "customer-001",
      projectId: "project-reserva-studio",
      modelId: "customer",
      data: { name: "Cliente Demo", vip: true },
      state: "published",
    },
  ],
});
