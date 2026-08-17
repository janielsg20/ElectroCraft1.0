import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compilePuckRuntime } from "../scripts/runtime-lib.mjs";
import { canonicalToPuckData, puckDataToCanonical } from "../src/puck-adapter.mjs";

const fixture = JSON.parse(await readFile(new URL("../fixtures/minimal-document.json", import.meta.url), "utf8"));
let runtime;
test.before(async () => { runtime = await compilePuckRuntime(); });
test.after(async () => { await runtime?.cleanup(); });

test("Puck insert real inserta Text dentro del Slot", () => {
  const data = canonicalToPuckData(fixture);
  const children = data.content[0].props.children;
  const inserted = runtime.insert(children, 1, { type: "Text", props: { id: "text-inserted", text: "Insertado" } });
  assert.deepEqual(inserted.map((x) => x.props.id), ["text-title", "text-inserted", "button-continue"]);
});

test("Puck reorder real reordena el Slot", () => {
  const data = canonicalToPuckData(fixture);
  const moved = runtime.reorder(data.content[0].props.children, 0, 1);
  assert.deepEqual(moved.map((x) => x.props.id), ["button-continue", "text-title"]);
});

test("Puck replace real edita props sin cambiar id", () => {
  const data = canonicalToPuckData(fixture);
  const children = data.content[0].props.children;
  const edited = runtime.replace(children, 0, { ...children[0], props: { ...children[0].props, text: "Editado" } });
  assert.equal(edited[0].props.id, "text-title");
  assert.equal(edited[0].props.text, "Editado");
});

test("secuencia Puck real vuelve a Electro sin internals", () => {
  const data = canonicalToPuckData(fixture);
  let children = data.content[0].props.children;
  children = runtime.insert(children, 1, { type: "Text", props: { id: "text-inserted", text: "Insertado" } });
  children = runtime.reorder(children, 2, 0);
  children = runtime.replace(children, 1, { ...children[1], props: { ...children[1].props, text: "Editado" } });
  data.content[0].props.children = children;
  const electro = puckDataToCanonical(data, fixture.id);
  assert.deepEqual(electro.nodes[0].children.map((n) => n.id), ["button-continue", "text-title", "text-inserted"]);
  assert.equal(electro.nodes[0].children[1].props.text, "Editado");
});

test("Puck history real registra, undo y redo", async () => {
  const initial = { data: canonicalToPuckData(fixture), ui: { field: { focus: "field" } } };
  const state1 = structuredClone(initial);
  state1.data.content[0].props.children[0].props.text = "Uno";
  const state2 = structuredClone(state1);
  state2.data.content[0].props.children[0].props.text = "Dos";
  let current = initial;
  const store = {
    dispatch(action) { if (action.type === "set") current = action.state; }
  };
  const set = (partial) => Object.assign(store, partial);
  const get = () => store;
  store.history = runtime.createHistorySlice(set, get);
  store.history.initialAppState = initial;
  store.history.histories = [{ id: "initial", state: initial }];
  store.history.index = 0;
  store.history.record(state1);
  await new Promise((r) => setTimeout(r, 300));
  store.history.record(state2);
  await new Promise((r) => setTimeout(r, 300));
  assert.equal(store.history.histories.length, 3);
  assert.match(store.history.histories[2].id, /^history-/);
  store.history.back();
  assert.equal(current.data.content[0].props.children[0].props.text, "Uno");
  assert.equal(current.ui.field.focus, null);
  store.history.forward();
  assert.equal(current.data.content[0].props.children[0].props.text, "Dos");
});
