import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { MIGRATION_SQL, STUDIO_TABLES } from "../src/physical-contract.mjs";

const root = new URL("..", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("M00.4 define exactamente las seis tablas físicas requeridas", () => {
  assert.deepEqual(STUDIO_TABLES, [
    "projects", "project_objects", "project_revisions", "content_records", "relation_edges", "record_field_index",
  ]);
});

test("ElectroCraftDataSchema no provoca ALTER TABLE", () => {
  assert.equal(/\bALTER\s+TABLE\b/i.test(MIGRATION_SQL), false);
  assert.equal(/CREATE\s+TABLE[^;]*(article|customer)/i.test(MIGRATION_SQL), false);
});

test("Worker usa la API oficial PGliteWorker + worker() y persistencia idb", async () => {
  const worker = await read("src/browser/studio-db.worker.mjs");
  const client = await read("src/browser/client.mjs");
  assert.match(worker, /@electric-sql\/pglite\/worker/);
  assert.match(worker, /worker\s*\(\s*\{/);
  assert.match(worker, /idb:\/\/electrocraft-m00-4-studio-db/);
  assert.match(client, /PGliteWorker/);
  assert.match(client, /new Worker/);
  assert.doesNotMatch(client, /new PGlite\s*\(/);
});

test("dependencias quedan fijadas a versiones revalidadas", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.equal(pkg.dependencies["@electric-sql/pglite"], "0.5.5");
  assert.equal(pkg.dependencies["drizzle-orm"], "0.45.2");
});


test("Drizzle migrator tiene migration journal reproducible", async () => {
  const journal = JSON.parse(await read("drizzle/meta/_journal.json"));
  const migration = await read("drizzle/0000_studio_db.sql");
  assert.equal(journal.entries[0].tag, "0000_studio_db");
  assert.equal(journal.entries[0].breakpoints, true);
  assert.match(migration, /--> statement-breakpoint/);
  assert.doesNotMatch(migration, /\bALTER\s+TABLE\b/i);
});
