import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { MIGRATION_SQL, STUDIO_TABLES } from "../src/physical-contract.mjs";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "src"), join(dist, "src"), { recursive: true });
await cp(join(root, "harness"), join(dist, "harness"), { recursive: true });
await cp(join(root, "drizzle"), join(dist, "drizzle"), { recursive: true });
await writeFile(join(dist, "0000_studio_db.sql"), MIGRATION_SQL);
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const summary = {
  microphase: "M00.4",
  package: pkg.name,
  dependencies: pkg.dependencies,
  tables: STUDIO_TABLES,
  migrationSha256: createHash("sha256").update(MIGRATION_SQL).digest("hex"),
  note: "Build estructural del POC; la integración del engine se registra por separado y no se infiere de este build.",
};
await writeFile(join(dist, "build-summary.json"), JSON.stringify(summary, null, 2));
console.log(`PASS build: ${STUDIO_TABLES.length} tablas, migration ${summary.migrationSha256}.`);
