import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const worker = await readFile(join(root, "src/browser/studio-db.worker.mjs"), "utf8");
const client = await readFile(join(root, "src/browser/client.mjs"), "utf8");
const harness = await readFile(join(root, "harness/index.html"), "utf8");
const checks = {
  workerExport: worker.includes('worker } from "@electric-sql/pglite/worker"') || worker.includes('worker } from "@electric-sql/pglite/worker";'),
  pgliteWorker: client.includes("PGliteWorker"),
  dedicatedWorker: client.includes("new Worker"),
  persistentIdb: worker.includes("idb://electrocraft-m00-4-studio-db"),
  threeRegions: ["Request", "Resultado", "Validación"].every((label) => harness.includes(label)),
};
if (Object.values(checks).some((value) => !value)) throw new Error(`Browser contract falló: ${JSON.stringify(checks)}`);
await mkdir(join(root, "artifacts"), { recursive: true });
await writeFile(join(root, "artifacts/browser-contract.json"), JSON.stringify({ status: "PASS_STATIC_CONTRACT", checks, runtimeTwoTab: "EXECUTED_BY_two-tab-runtime" }, null, 2));
console.log("PASS browser-contract estático; runtime real cubierto por scripts/two-tab-runtime.mjs.");
