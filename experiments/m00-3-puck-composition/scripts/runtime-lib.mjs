import { mkdtemp, mkdir, cp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const here = new URL("..", import.meta.url).pathname;
const vendor = join(here, "vendor/puck-v0.22.4");

async function put(root, rel, content) {
  const file = join(root, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

export async function compilePuckRuntime() {
  const root = await mkdtemp(join(tmpdir(), "electrocraft-puck-"));
  const src = join(root, "src");
  const out = join(root, "out");
  await mkdir(src, { recursive: true });

  for (const rel of [
    "lib/data/insert.ts",
    "lib/data/reorder.ts",
    "lib/data/replace.ts",
    "lib/generate-id.ts",
    "lib/uuid/index.ts",
    "lib/uuid/rng.ts",
    "lib/uuid/stringify.ts",
    "store/slices/history.ts"
  ]) {
    await mkdir(dirname(join(src, rel)), { recursive: true });
    await cp(join(vendor, rel), join(src, rel));
  }

  await put(src, "types/index.ts", `export type AppState = any;\nexport type History<D = any> = { state: D; id: string };\n`);
  await put(src, "store/index.ts", `export type AppStore = any;\nexport function useAppStoreApi(): any { throw new Error("POC shim: hook no ejecutable"); }\n`);
  await put(src, "lib/use-hotkey.ts", `export function useHotkey(..._args: any[]): void {}\n`);
  await put(src, "global.d.ts", `declare namespace NodeJS { type Timeout = ReturnType<typeof setTimeout>; }\ndeclare module "react" { export function useEffect(...args: any[]): void; }\n`);
  await put(root, "tsconfig.json", JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "CommonJS",
      moduleResolution: "Node",
      outDir: "./out",
      rootDir: "./src",
      esModuleInterop: true,
      skipLibCheck: true,
      strict: false,
      lib: ["ES2022", "DOM"]
    },
    include: ["src/**/*.ts", "src/**/*.d.ts"]
  }, null, 2));

  const result = spawnSync("tsc", ["-p", join(root, "tsconfig.json"), "--pretty", "false"], {
    cwd: root,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    await rm(root, { recursive: true, force: true });
    throw new Error(`No se pudo compilar el runtime Puck fijado:\n${result.stdout}\n${result.stderr}`);
  }

  await put(out, "package.json", JSON.stringify({ type: "commonjs" }));
  await put(out, "node_modules/react/package.json", JSON.stringify({ name: "react", version: "poc-shim", main: "index.js" }));
  await put(out, "node_modules/react/index.js", `exports.useEffect = function useEffect() {};\n`);

  const req = createRequire(join(out, "loader.cjs"));
  return {
    root,
    insert: req(join(out, "lib/data/insert.js")).insert,
    reorder: req(join(out, "lib/data/reorder.js")).reorder,
    replace: req(join(out, "lib/data/replace.js")).replace,
    createHistorySlice: req(join(out, "store/slices/history.js")).createHistorySlice,
    cleanup: () => rm(root, { recursive: true, force: true })
  };
}
