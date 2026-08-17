import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

async function readJson(name) {
  try {
    return JSON.parse(await readFile(join(root, "artifacts", name), "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

const integration = await readJson("integration-result.json");
const twoTab = await readJson("two-tab-runtime.json");
const failures = [];

if (integration?.status !== "PASS_NODE_ENGINE") {
  failures.push(`engine integration=${integration?.status ?? "MISSING"}`);
}
if (twoTab?.status !== "PASS_TWO_TAB") {
  failures.push(`two-tab runtime=${twoTab?.status ?? "MISSING"}`);
}

if (failures.length > 0) {
  console.error(`BLOCKED M00.4 closure gate: ${failures.join("; ")}`);
  process.exit(2);
}

console.log("PASS M00.4 closure gate: engine real + two-tab runtime evidence presentes.");
