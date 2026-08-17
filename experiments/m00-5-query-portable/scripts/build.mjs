import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { compilePortableWhere } from "../src/compiler.mjs";
import { createQueryDefinition } from "../src/query-definition.mjs";
import { dataSchema } from "../src/schema-fixture.mjs";

const root = new URL("..", import.meta.url);
await mkdir(new URL("dist/", root), { recursive: true });
const source = await readFile(new URL("src/compiler.mjs", root), "utf8");
const definition = createQueryDefinition({
  id: "build-probe",
  modelId: "article",
  query: { combinator: "and", rules: [{ field: "category", operator: "=", value: "power" }, { field: "title", operator: "=", value: "Power Bank 20K" }] },
});
const compiled = compilePortableWhere(definition, dataSchema);
const summary = {
  status: "PASS_BUILD",
  dependencies: { "@react-querybuilder/core": "8.23.0", "@electric-sql/pglite": "0.5.5" },
  compilerSha256: createHash("sha256").update(source).digest("hex"),
  bindings: compiled.bindings,
  parameterCount: compiled.params.length,
};
await writeFile(new URL("dist/build-summary.json", root), JSON.stringify(summary, null, 2));
await writeFile(new URL("artifacts/build-summary.json", root), JSON.stringify(summary, null, 2));
console.log(`PASS build M00.5: ${summary.compilerSha256}`);
