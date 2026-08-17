import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dirs = ["src", "scripts", "test"];
const files = [];
for (const dir of dirs) {
  for (const entry of await readdir(join(root, dir), { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".mjs")) files.push(join(root, dir, entry.name));
  }
}
for (const file of files) {
  const checked = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (checked.status !== 0) {
    process.stderr.write(checked.stderr);
    process.exit(checked.status ?? 1);
  }
}
console.log(`PASS syntax/type contract: ${files.length} módulos ESM.`);
