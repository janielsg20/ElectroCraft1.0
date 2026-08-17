import test from "node:test";
import assert from "node:assert/strict";
import { addLogicalField, buildRecordIndexRows } from "../src/data-schema.mjs";
import { fixture } from "../src/fixture.mjs";

test("dos modelos lógicos viven en un ElectroCraftDataSchema genérico", () => {
  assert.deepEqual(fixture.dataSchema.models.map((model) => model.id), ["article", "customer"]);
});

test("solo fields queryables generan record_field_index", () => {
  const article = fixture.records[0];
  const rows = buildRecordIndexRows({
    projectId: article.projectId,
    modelId: article.modelId,
    recordId: article.id,
    data: article.data,
    schema: fixture.dataSchema,
  });
  assert.deepEqual(rows.map((row) => row.fieldId).sort(), ["category", "price", "title"]);
  assert.equal(rows.find((row) => row.fieldId === "category").faceted, true);
  assert.equal(rows.find((row) => row.fieldId === "price").valueKind, "number");
});

test("añadir field lógico no muta el schema anterior", () => {
  const next = addLogicalField(fixture.dataSchema, "article", { id: "sku", type: "text", searchable: true });
  assert.equal(fixture.dataSchema.models[0].fields.some((field) => field.id === "sku"), false);
  assert.equal(next.models[0].fields.some((field) => field.id === "sku"), true);
});

test("field inválido produce error visible", () => {
  assert.throws(() => addLogicalField(fixture.dataSchema, "missing", { id: "x", type: "text" }), /Modelo lógico no encontrado/);
});
