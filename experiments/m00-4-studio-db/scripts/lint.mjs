import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { MIGRATION_SQL, STUDIO_TABLES } from "../src/physical-contract.mjs";

const root = new URL("..", import.meta.url).pathname;
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
if (pkg.dependencies["@electric-sql/pglite"] !== "0.5.5") throw new Error("PGlite debe estar pinneado a 0.5.5");
if (pkg.dependencies["drizzle-orm"] !== "0.45.2") throw new Error("Drizzle debe estar pinneado a 0.45.2");
if (/\bALTER\s+TABLE\b/i.test(MIGRATION_SQL)) throw new Error("M00.4 no permite ALTER TABLE por cambios de schema lógico");
for (const table of STUDIO_TABLES) {
  if (!MIGRATION_SQL.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) throw new Error(`Falta tabla física: ${table}`);
}
for (const forbidden of ["CREATE TABLE IF NOT EXISTS article", "CREATE TABLE IF NOT EXISTS customer", "CREATE TABLE ${"]) {
  if (MIGRATION_SQL.includes(forbidden)) throw new Error(`Tabla dinámica detectada: ${forbidden}`);
}
const drizzleMigration = await readFile(join(root, "drizzle/0000_studio_db.sql"), "utf8");
const journal = JSON.parse(await readFile(join(root, "drizzle/meta/_journal.json"), "utf8"));
if (/\bALTER\s+TABLE\b/i.test(drizzleMigration)) throw new Error("Drizzle migration contiene ALTER TABLE");
if (journal.entries?.[0]?.tag !== "0000_studio_db" || journal.entries?.[0]?.breakpoints !== true) throw new Error("Drizzle migration journal inválido");
const worker = await readFile(join(root, "src/browser/studio-db.worker.mjs"), "utf8");
const client = await readFile(join(root, "src/browser/client.mjs"), "utf8");
if (!worker.includes('from "@electric-sql/pglite/worker"') || !worker.includes("worker({")) throw new Error("Worker oficial PGlite incompleto");
if (!client.includes("PGliteWorker") || client.includes("new PGlite(")) throw new Error("Client debe usar PGliteWorker, no singleton main-thread");
const files = await readdir(join(root, "src"), { recursive: true });
if (files.some((name) => /product|app\//i.test(name))) throw new Error("POC no debe importar implementación de producto");
console.log(`PASS lint: ${STUDIO_TABLES.length} tablas genéricas, Worker oficial, cero ALTER TABLE, pins exactos.`);
