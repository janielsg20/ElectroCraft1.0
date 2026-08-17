import { spawnSync } from "node:child_process";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const args = [
  "--noEmit", "--pretty", "false", "--strict", "--target", "ES2022",
  "--module", "ESNext", "--moduleResolution", "Bundler", "--jsx", "preserve",
  join(root, "types/jsx.d.ts"), join(root, "types/puckeditor-core.d.ts"), join(root, "src/composition-shell.contract.tsx")
];
const r = spawnSync("tsc", args, { cwd: root, encoding: "utf8" });
if (r.status !== 0) throw new Error(`Typecheck Composition falló:\n${r.stdout}\n${r.stderr}`);
console.log("PASS typecheck: contrato Puck Composition 0.22.4 compatible.");
