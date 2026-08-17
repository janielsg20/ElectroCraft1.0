import test from "node:test";
import assert from "node:assert/strict";
import { createQueryDefinition, QueryBlockerError, validateQueryDefinition } from "../src/query-definition.mjs";
import { dataSchema } from "../src/schema-fixture.mjs";

const nested = createQueryDefinition({
  id: "q-nested",
  modelId: "article",
  query: {
    combinator: "and",
    rules: [
      { field: "category", operator: "=", value: "power" },
      { combinator: "or", rules: [
        { field: "title", operator: "=", value: "Power Bank 20K" },
        { field: "description", operator: "=", value: "USB-C battery pack" },
      ] },
    ],
  },
});

test("ElectroCraftQueryDefinition envuelve RQB con versión fija", () => {
  assert.equal(nested.type, "ElectroCraftQueryDefinition");
  assert.equal(nested.version, 1);
  assert.deepEqual(nested.engine, { owner: "@react-querybuilder/core", version: "8.23.0", format: "parameterized" });
  assert.equal(validateQueryDefinition(nested, dataSchema).source.modelId, "article");
});

test("nested AND/OR válido conserva la estructura", () => {
  const validated = validateQueryDefinition(nested, dataSchema);
  assert.equal(validated.query.combinator, "and");
  assert.equal(validated.query.rules[1].combinator, "or");
});

test("operator unsupported bloquea y nunca degrada a no-op", () => {
  const unsupported = structuredClone(nested);
  unsupported.query.rules[0].operator = "matchesRegex";
  assert.throws(() => validateQueryDefinition(unsupported, dataSchema), (error) => error instanceof QueryBlockerError && error.code === "UNSUPPORTED_QUERY_OPERATOR");
});

test("field desconocido bloquea", () => {
  const invalid = structuredClone(nested);
  invalid.query.rules[0].field = "__raw_sql";
  assert.throws(() => validateQueryDefinition(invalid, dataSchema), (error) => error.code === "UNKNOWN_QUERY_FIELD");
});

test("valueSource field/parameter queda fuera del POC", () => {
  const invalid = structuredClone(nested);
  invalid.query.rules[0].valueSource = "field";
  assert.throws(() => validateQueryDefinition(invalid, dataSchema), (error) => error.code === "UNSUPPORTED_VALUE_SOURCE");
});
