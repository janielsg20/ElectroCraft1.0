import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { makeSectionPreset, validateCanonicalDocument, assertNoPuckInternals } from "../src/canonical-document.mjs";
import { canonicalToPuckData, puckDataToCanonical, createOnActionSync, puckConfigContract } from "../src/puck-adapter.mjs";

const fixture = JSON.parse(await readFile(new URL("../fixtures/minimal-document.json", import.meta.url), "utf8"));

test("fixture canónica contiene Container, Text y Button", () => {
  assert.equal(validateCanonicalDocument(fixture), true);
  const types = new Set([fixture.nodes[0].type, ...fixture.nodes[0].children.map((n) => n.type)]);
  assert.deepEqual([...types].sort(), ["Button", "Container", "Text"]);
});

test("Section Palette preset produce Container semanticElement=section", () => {
  const section = makeSectionPreset("section-hero");
  assert.equal(section.type, "Container");
  assert.equal(section.props.semanticElement, "section");
});

test("Container declara children como Puck Slot", () => {
  assert.equal(puckConfigContract.components.Container.fields.children.type, "slot");
});

test("round-trip Electro -> Puck -> Electro conserva documento", () => {
  const puck = canonicalToPuckData(fixture);
  const roundTrip = puckDataToCanonical(puck, fixture.id);
  assert.deepEqual(roundTrip, fixture);
});

test("Puck Slot se serializa como ComponentData[] en props.children", () => {
  const puck = canonicalToPuckData(fixture);
  assert.ok(Array.isArray(puck.content[0].props.children));
  assert.equal(puck.content[0].props.children[0].type, "Text");
  assert.equal("zones" in puck, false);
});

test("snapshot canónico no contiene internals de Puck", () => {
  assert.equal(assertNoPuckInternals(fixture), true);
  assert.throws(() => assertNoPuckInternals({ ui: {} }), /Internal Puck/);
});

test("adapter rechaza componente Puck fuera del modelo canónico", () => {
  assert.throws(() => puckDataToCanonical({ root: {}, content: [{ type: "Unknown", props: { id: "x" } }] }), /no mapeable/);
});

test("onAction reconstruye ElectroCraftDocument desde newState público", () => {
  const puck = canonicalToPuckData(fixture);
  let captured = null;
  const onAction = createOnActionSync({ onDocument: (doc, meta) => { captured = { doc, meta }; }, documentId: fixture.id });
  const result = onAction({ type: "replace" }, { data: puck }, { data: { root: {}, content: [] }, ui: { selectedItem: "secret" } });
  assert.deepEqual(result, fixture);
  assert.deepEqual(captured.doc, fixture);
  assert.equal(captured.meta.actionType, "replace");
  assertNoPuckInternals(captured.doc);
});

test("validador rechaza IDs duplicados", () => {
  const bad = structuredClone(fixture);
  bad.nodes[0].children[1].id = bad.nodes[0].children[0].id;
  assert.throws(() => validateCanonicalDocument(bad), /duplicado/);
});
