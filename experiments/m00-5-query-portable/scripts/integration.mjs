import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { compilePortableWhere, executeMultiSource, executePortableQuery, facetCount, formatWithRqb } from "../src/compiler.mjs";
import { createQueryDefinition, validateQueryDefinition } from "../src/query-definition.mjs";
import { dataSchema } from "../src/schema-fixture.mjs";
import { createStudioClient, loadQueryDefinition, PROJECT_ID, saveQueryDefinition, seedStudioFixture } from "../src/studio-fixture.mjs";

const root = new URL("..", import.meta.url);
const artifactPath = new URL("artifacts/integration-result.json", root);
await mkdir(new URL("artifacts/", root), { recursive: true });
const rqbPkg = JSON.parse(await readFile(new URL("node_modules/@react-querybuilder/core/package.json", root), "utf8"));
const pglitePkg = JSON.parse(await readFile(new URL("node_modules/@electric-sql/pglite/package.json", root), "utf8"));

const articleDefinition = createQueryDefinition({
  id: "query-article-portable",
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

const customerDefinition = createQueryDefinition({
  id: "query-customer-vip",
  modelId: "customer",
  query: { combinator: "and", rules: [{ field: "vip", operator: "=", value: true }] },
});

const result = {
  status: "RUNNING",
  versions: { rqb: rqbPkg.version, pglite: pglitePkg.version },
  checks: {},
  latencyMs: {},
  gap: {},
};
const dataDir = await mkdtemp(join(tmpdir(), "electrocraft-m00-5-"));

try {
  assert.equal(rqbPkg.version, "8.23.0");
  assert.equal(pglitePkg.version, "0.5.5");
  let client = await createStudioClient(dataDir);
  await seedStudioFixture(client);

  const compiled = compilePortableWhere(articleDefinition, dataSchema);
  assert.match(compiled.whereSql, /record_field_index/);
  assert.match(compiled.whereSql, /cr\.data ->> 'title'/);
  assert.equal(compiled.oss.sql.includes("record_field_index"), false);
  result.checks.indexedAndJsonBinding = true;

  const article = await executePortableQuery(client, { projectId: PROJECT_ID, definition: articleDefinition, schema: dataSchema });
  assert.deepEqual(article.rows.map((row) => row.id), ["article-001"]);
  result.checks.nestedAndOrRealQuery = true;

  const unsupported = structuredClone(articleDefinition);
  unsupported.query.rules[0].operator = "matchesRegex";
  assert.throws(() => validateQueryDefinition(unsupported, dataSchema), (error) => error.code === "UNSUPPORTED_QUERY_OPERATOR");
  result.checks.unsupportedOperatorBlocks = true;

  const injectionPayload = "x' OR 1=1 --";
  const injectionDefinition = createQueryDefinition({
    id: "query-injection",
    modelId: "article",
    query: { combinator: "and", rules: [{ field: "title", operator: "=", value: injectionPayload }] },
  });
  const injectionCompiled = compilePortableWhere(injectionDefinition, dataSchema);
  assert.ok(injectionCompiled.params.includes(injectionPayload));
  assert.equal(injectionCompiled.whereSql.includes(injectionPayload), false);
  const injectionResult = await executePortableQuery(client, { projectId: PROJECT_ID, definition: injectionDefinition, schema: dataSchema });
  assert.equal(injectionResult.rows.length, 0);
  result.checks.injectionRemainsParameter = true;

  const facets = await facetCount(client, { projectId: PROJECT_ID, modelId: "article", fieldId: "category", schema: dataSchema });
  assert.deepEqual(facets, [{ value: "cables", count: 2 }, { value: "power", count: 1 }]);
  result.checks.facetCountUsesIndexer = true;

  const multiSource = await executeMultiSource(client, {
    projectId: PROJECT_ID,
    schema: dataSchema,
    sources: [
      { id: "articles", definition: articleDefinition },
      { id: "customers", definition: customerDefinition },
    ],
  });
  assert.deepEqual(multiSource.map(({ sourceId, recordId, modelId }) => ({ sourceId, recordId, modelId })), [
    { sourceId: "articles", recordId: "article-001", modelId: "article" },
    { sourceId: "customers", recordId: "customer-001", modelId: "customer" },
  ]);
  assert.ok(multiSource.every((row) => Object.keys(row).sort().join(",") === "data,modelId,recordId,sourceId"));
  result.checks.multiSourceShapeCompatible = true;

  const checksum = await saveQueryDefinition(client, articleDefinition);
  assert.equal(checksum.length, 64);
  await client.close();
  client = await createStudioClient(dataDir);
  const persisted = await loadQueryDefinition(client, articleDefinition.id);
  assert.deepEqual(persisted.payload, articleDefinition);
  const persistedResult = await executePortableQuery(client, { projectId: PROJECT_ID, definition: persisted.payload, schema: dataSchema });
  assert.deepEqual(persistedResult.rows.map((row) => row.id), ["article-001"]);
  result.checks.canonicalRoundTripPersistence = true;

  const samples = 50;
  const rqbTimes = [];
  const electroTimes = [];
  for (let index = 0; index < samples; index += 1) {
    let start = performance.now();
    formatWithRqb(articleDefinition, dataSchema);
    rqbTimes.push(performance.now() - start);
    start = performance.now();
    compilePortableWhere(articleDefinition, dataSchema);
    electroTimes.push(performance.now() - start);
  }
  const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  const rqbAverage = average(rqbTimes);
  const electroAverage = average(electroTimes);
  result.latencyMs.rqbFormatAverage50 = Number(rqbAverage.toFixed(4));
  result.latencyMs.electroCompileAverage50 = Number(electroAverage.toFixed(4));
  result.gap.adapterOverheadMs = Number(Math.max(0, electroAverage - rqbAverage).toFixed(4));
  result.gap.rqbOwns = ["nested boolean tree", "operator formatting", "bind-value parameterization"];
  result.gap.electroOwns = ["fail-closed field/operator policy", "canonical field binding", "index-vs-json physical mapping", "source/result normalization"];

  result.rqbEvidence = { parameterizedSql: compiled.oss.sql, params: compiled.oss.params };
  result.status = "PASS_QUERY_ENGINE";
  await writeFile(artifactPath, JSON.stringify(result, null, 2));
  console.log(`PASS M00.5 integration: ${JSON.stringify(result)}`);
  await client.close();
} finally {
  await rm(dataDir, { recursive: true, force: true });
}
