import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { compilePuckRuntime } from "./runtime-lib.mjs";
import { canonicalToPuckData, puckDataToCanonical, createOnActionSync } from "../src/puck-adapter.mjs";
import { assertNoPuckInternals, makeSectionPreset } from "../src/canonical-document.mjs";

const root = new URL("..", import.meta.url).pathname;
const fixture = JSON.parse(await readFile(join(root, "fixtures/minimal-document.json"), "utf8"));
const runtime = await compilePuckRuntime();
try {
  const data = canonicalToPuckData(fixture);
  data.content = runtime.insert(data.content, 1, {
    type: "Container",
    props: { id: "section-offer", semanticElement: "section", gap: 16, children: [] }
  });
  data.content[1].props.children = runtime.insert(data.content[1].props.children, 0, {
    type: "Text", props: { id: "offer-title", text: "Oferta" }
  });
  data.content = runtime.reorder(data.content, 1, 0);
  const item = data.content[0].props.children[0];
  data.content[0].props.children = runtime.replace(data.content[0].props.children, 0, {
    ...item, props: { ...item.props, text: "Oferta editada" }
  });

  let synced;
  const onAction = createOnActionSync({ onDocument: (doc) => { synced = doc; }, documentId: fixture.id });
  onAction({ type: "replace" }, { data, ui: { selectedItem: "offer-title" } }, { data: canonicalToPuckData(fixture) });
  assertNoPuckInternals(synced);
  if (synced.nodes[0].props.semanticElement !== "section") throw new Error("Section preset semantics perdidas");
  if (makeSectionPreset().type !== "Container") throw new Error("Section se convirtió en tipo paralelo");

  const result = {
    status: "GREEN",
    engine: "@puckeditor/core",
    version: "0.22.4",
    actions: ["insert", "slot-nesting", "reorder", "replace", "onAction-sync"],
    canonicalNodeOrder: synced.nodes.map((n) => n.id),
    canonicalSnapshot: synced
  };
  await mkdir(join(root, "dist"), { recursive: true });
  await writeFile(join(root, "dist/integration-result.json"), JSON.stringify(result, null, 2) + "\n");
  console.log("PASS integration: Puck 0.22.4 insert/reorder/replace + Slot + onAction canonical sync.");
} finally {
  await runtime.cleanup();
}
