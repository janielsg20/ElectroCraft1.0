import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

const root = new URL("..", import.meta.url).pathname;
const provenance = JSON.parse(await readFile(join(root, "vendor/puck-v0.22.4/PROVENANCE.json"), "utf8"));
const gitBlob = (buffer) => createHash("sha1").update(`blob ${buffer.length}\0`).update(buffer).digest("hex");

for (const [rel, expected] of Object.entries(provenance.files)) {
  const data = await readFile(join(root, "vendor/puck-v0.22.4", rel));
  const actual = gitBlob(data);
  if (actual !== expected) throw new Error(`Vendor drift ${rel}: ${actual} != ${expected}`);
}
const shell = await readFile(join(root, "src/composition-shell.contract.tsx"), "utf8");
for (const token of ["<Puck", "Puck.Components", "Puck.Outline", "Puck.Preview", "Puck.Fields", "onAction"]) {
  if (!shell.includes(token)) throw new Error(`Shell incompleto: ${token}`);
}
if (shell.includes("DropZone")) throw new Error("M00.3 no puede introducir DropZone nuevo");
const adapter = await readFile(join(root, "src/puck-adapter.mjs"), "utf8");
if (!adapter.includes('children: { type: "slot"')) throw new Error("Container no declara Slot");
const canonical = await readFile(join(root, "src/canonical-document.mjs"), "utf8");
if (canonical.includes('type: "Section"')) throw new Error("Section no puede ser tipo canónico");
console.log(`PASS lint: ${Object.keys(provenance.files).length} blobs Puck verificados, shell Composition completo, Slot-only nesting.`);
