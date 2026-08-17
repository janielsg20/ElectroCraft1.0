import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { fixture } from "../src/fixture.mjs";
import { addLogicalField } from "../src/data-schema.mjs";
import { MIGRATION_SQL, STUDIO_TABLES } from "../src/physical-contract.mjs";

const root = new URL("..", import.meta.url).pathname;
const artifactPath = join(root, "artifacts/integration-result.json");
await mkdir(join(root, "artifacts"), { recursive: true });

function isDependencyUnavailable(error) {
  return error?.code === "ERR_MODULE_NOT_FOUND" || /Cannot find package|Cannot find module/.test(String(error?.message));
}

let api;
try {
  api = await import("../src/node-test-db.mjs");
} catch (error) {
  if (!isDependencyUnavailable(error)) throw error;
  const result = {
    status: "SKIPPED",
    reason: "DEPENDENCIES_UNAVAILABLE_IN_EXECUTION_CONTAINER",
    required: { "@electric-sql/pglite": "0.5.5", "drizzle-orm": "0.45.2" },
    error: String(error?.message ?? error),
  };
  await writeFile(artifactPath, JSON.stringify(result, null, 2));
  console.log(`SKIP integration real PGlite/Drizzle: ${result.error}`);
  process.exit(0);
}

const {
  getProjectObject,
  listElectroCraftPhysicalTables,
  queryFacetedText,
  saveProjectObject,
  saveRecordAndIndex,
  upsertProject,
} = await import("../src/repository.mjs");

const dataDir = await mkdtemp(join(tmpdir(), "electrocraft-m00-4-"));
const result = {
  status: "RUNNING",
  versions: { pglite: "0.5.5", drizzle: "0.45.2" },
  checks: {},
  latencyMs: {},
};

try {
  let { client, db } = await api.createNodeStudioDb(dataDir);
  await upsertProject(db, fixture.project);

  const objectA = await saveProjectObject(db, fixture.projectObjects[0]);
  const objectB = await saveProjectObject(db, fixture.projectObjects[1]);
  const beforeB = (await getProjectObject(db, objectB.projectId, objectB.objectId)).checksum;
  await saveProjectObject(db, { ...fixture.projectObjects[0], version: 2, payload: { ...fixture.projectObjects[0].payload, title: "Inicio modificado" } });
  const afterB = (await getProjectObject(db, objectB.projectId, objectB.objectId)).checksum;
  assert.equal(beforeB, afterB);
  result.checks.objectIsolation = true;

  await saveProjectObject(db, {
    projectId: fixture.project.id,
    objectId: fixture.dataSchema.id,
    kind: "data-schema",
    version: 1,
    payload: fixture.dataSchema,
  });
  const tablesBeforeRecords = await listElectroCraftPhysicalTables(db);
  for (const record of fixture.records) await saveRecordAndIndex(db, { record, schema: fixture.dataSchema });
  const tablesAfterRecords = await listElectroCraftPhysicalTables(db);
  assert.deepEqual(tablesAfterRecords, tablesBeforeRecords);
  assert.deepEqual([...tablesAfterRecords].sort(), [...STUDIO_TABLES].sort());
  result.checks.twoLogicalModelsNoPhysicalTables = true;

  const categoryRows = await queryFacetedText(db, {
    projectId: fixture.project.id,
    modelId: "article",
    fieldId: "category",
    value: "power",
  });
  assert.equal(categoryRows.length, 1);
  assert.equal(categoryRows[0].id, "article-001");
  result.checks.facetedIndex = true;

  const expandedSchema = addLogicalField(fixture.dataSchema, "article", { id: "sku", type: "text", searchable: true });
  await saveProjectObject(db, {
    projectId: fixture.project.id,
    objectId: fixture.dataSchema.id,
    kind: "data-schema",
    version: 2,
    payload: expandedSchema,
  });
  const tablesAfterSchemaChange = await listElectroCraftPhysicalTables(db);
  assert.deepEqual(tablesAfterSchemaChange, tablesBeforeRecords);
  assert.equal(/\bALTER\s+TABLE\b/i.test(MIGRATION_SQL), false);
  result.checks.schemaEvolutionZeroAlterTable = true;

  await assert.rejects(
    db.transaction(async (tx) => {
      await tx.insert((await import("../src/schema.mjs")).projects).values({ id: "rollback-project", name: "Rollback" });
      throw new Error("forced rollback");
    }),
    /forced rollback/,
  );
  result.checks.negativeRollback = true;

  const saveSamples = [];
  for (let index = 0; index < 20; index += 1) {
    const started = performance.now();
    await saveProjectObject(db, {
      projectId: fixture.project.id,
      objectId: "latency-probe",
      kind: "diagnostic",
      version: index + 1,
      payload: { index },
    });
    saveSamples.push(performance.now() - started);
  }
  const querySamples = [];
  for (let index = 0; index < 20; index += 1) {
    const started = performance.now();
    await queryFacetedText(db, { projectId: fixture.project.id, modelId: "article", fieldId: "category", value: "power" });
    querySamples.push(performance.now() - started);
  }
  const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
  result.latencyMs.saveObjectAverage20 = Number(average(saveSamples).toFixed(3));
  result.latencyMs.facetedQueryAverage20 = Number(average(querySamples).toFixed(3));

  await client.close();
  ({ client, db } = await api.createNodeStudioDb(dataDir));
  const persistedObject = await getProjectObject(db, fixture.project.id, fixture.projectObjects[1].objectId);
  const persistedFacet = await queryFacetedText(db, { projectId: fixture.project.id, modelId: "article", fieldId: "category", value: "power" });
  assert.ok(persistedObject);
  assert.equal(persistedFacet.length, 1);
  result.checks.closeReopenPersistence = true;
  await client.close();

  result.status = "PASS_NODE_ENGINE";
  result.browserTwoTab = "REQUIRED_SEPARATELY";
  await writeFile(artifactPath, JSON.stringify(result, null, 2));
  console.log(`PASS integration PGlite/Drizzle real: ${JSON.stringify(result)}`);
} finally {
  await rm(dataDir, { recursive: true, force: true });
}
