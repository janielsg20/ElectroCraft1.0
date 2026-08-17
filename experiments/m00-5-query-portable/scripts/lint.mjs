import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const pkg = JSON.parse(await read("package.json"));
const compiler = await read("src/compiler.mjs");
const fixture = await read("src/studio-fixture.mjs");
const definition = await read("src/query-definition.mjs");

assert.equal(pkg.dependencies["@react-querybuilder/core"], "8.23.0");
assert.equal(pkg.dependencies["@electric-sql/pglite"], "0.5.5");
assert.match(compiler, /format:\s*"parameterized"/);
assert.match(compiler, /numberedParams:\s*true/);
assert.match(compiler, /fallbackExpression:\s*FALLBACK_MARKER/);
assert.match(compiler, /record_field_index/);
assert.match(compiler, /facetCount/);
assert.match(fixture, /m00-4-studio-db\/src\/physical-contract\.mjs/);
assert.doesNotMatch(fixture, /CREATE\s+TABLE/i);
assert.match(definition, /UNSUPPORTED_QUERY_OPERATOR/);
assert.doesNotMatch(compiler, /eval\s*\(|new Function/);
assert.doesNotMatch(compiler, /\$\{\s*rule\.value/);
console.log("PASS lint: RQB parametrizado, binding fail-closed, reutiliza contrato M00.4 y no crea schema paralelo.");
