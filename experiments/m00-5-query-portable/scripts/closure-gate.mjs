import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const integration = JSON.parse(await readFile(new URL("artifacts/integration-result.json", root), "utf8"));
const build = JSON.parse(await readFile(new URL("artifacts/build-summary.json", root), "utf8"));
assert.equal(integration.status, "PASS_QUERY_ENGINE");
assert.equal(build.status, "PASS_BUILD");
const required = [
  "indexedAndJsonBinding",
  "nestedAndOrRealQuery",
  "unsupportedOperatorBlocks",
  "injectionRemainsParameter",
  "facetCountUsesIndexer",
  "multiSourceShapeCompatible",
  "canonicalRoundTripPersistence",
];
for (const key of required) assert.equal(integration.checks[key], true, `Closure gate missing: ${key}`);
assert.equal(integration.versions.rqb, "8.23.0");
assert.equal(integration.versions.pglite, "0.5.5");
console.log("PASS closure gate M00.5: RQB real + PGlite real + safety + persistence + facets + multi-source.");
