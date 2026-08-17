import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url).pathname;
const dirs = ["src", "scripts", "test", "harness"];
const files = [];
for (const dir of dirs) {
  for (const rel of await readdir(join(root, dir), { recursive: true })) {
    if (rel.endsWith(".mjs")) files.push(join(root, dir, rel));
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${file}\n${result.stderr}`);
}
console.log(`PASS syntax-check: ${files.length} módulos ESM.`);
