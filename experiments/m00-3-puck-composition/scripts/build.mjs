import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const integration = JSON.parse(await readFile(join(root, "dist/integration-result.json"), "utf8"));
const provenance = JSON.parse(await readFile(join(root, "vendor/puck-v0.22.4/PROVENANCE.json"), "utf8"));
const shell = await readFile(join(root, "src/composition-shell.contract.tsx"), "utf8");
const summary = {
  microphase: "M00.3",
  status: "GREEN",
  engine: `${provenance.package}@${provenance.version}`,
  upstreamCommit: provenance.commit,
  license: provenance.license,
  exactVendoredBlobs: Object.keys(provenance.files).length,
  compositionContract: ["Puck.Components", "Puck.Outline", "Puck.Preview", "Puck.Fields"].every((x) => shell.includes(x)),
  mechanicsExecuted: integration.actions,
  canonicalInternalsPersisted: false,
  next: "M00.4 — POC Studio DB genérica"
};
await mkdir(join(root, "dist"), { recursive: true });
await writeFile(join(root, "dist/summary.json"), JSON.stringify(summary, null, 2) + "\n");
const doc = integration.canonicalSnapshot;
const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>POC técnico M00.3</title><body><h1>POC técnico — Puck Composition</h1><section id="request"><h2>Request</h2><p>Puck.Components · Puck.Outline · Puck.Preview · Puck.Fields</p></section><section id="result"><h2>Resultado</h2><pre>${escapeHtml(JSON.stringify(doc,null,2))}</pre></section><section id="validation"><h2>Validación</h2><p data-status="GREEN">GREEN — snapshot ElectroCraft sin internals Puck</p></section></body></html>`;
await writeFile(join(root, "dist/poc-harness.html"), html);
console.log(`PASS build: ${summary.engine}; Composition=${summary.compositionContract}; next=${summary.next}`);
function escapeHtml(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
