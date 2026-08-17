import test from "node:test";
import assert from "node:assert/strict";
import { compilePortableWhere } from "../src/compiler.mjs";
import { createQueryDefinition } from "../src/query-definition.mjs";
import { dataSchema } from "../src/schema-fixture.mjs";

function definition(value = "Power Bank 20K") {
  return createQueryDefinition({
    id: "q-compile",
    modelId: "article",
    query: {
      combinator: "and",
      rules: [
        { field: "category", operator: "=", value: "power" },
        { combinator: "or", rules: [
          { field: "title", operator: "=", value },
          { field: "description", operator: "=", value: "USB-C battery pack" },
        ] },
      ],
    },
  });
}

test("indexed field usa record_field_index y JSON field usa extracción JSONB", () => {
  const compiled = compilePortableWhere(definition(), dataSchema);
  assert.match(compiled.whereSql, /record_field_index/);
  assert.match(compiled.whereSql, /cr\.data ->> 'title'/);
  assert.deepEqual(compiled.bindings, [
    { fieldId: "category", kind: "record_field_index" },
    { fieldId: "title", kind: "json" },
    { fieldId: "description", kind: "json" },
  ]);
});

test("RQB mantiene valores como parámetros numerados", () => {
  const injection = "x' OR 1=1 --";
  const compiled = compilePortableWhere(definition(injection), dataSchema);
  assert.ok(compiled.params.includes(injection));
  assert.equal(compiled.whereSql.includes(injection), false);
  assert.match(compiled.whereSql, /\$1|\$2|\$3/);
  assert.equal(compiled.whereSql.includes("__ELECTROCRAFT_BLOCKED__"), false);
});
