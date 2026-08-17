import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile(new URL("../src/composition-shell.contract.tsx", import.meta.url), "utf8");

test("shell compone los cuatro primitives oficiales requeridos", () => {
  for (const part of ["Puck.Components", "Puck.Outline", "Puck.Preview", "Puck.Fields"]) assert.ok(shell.includes(part), part);
});

test("shell cablea onAction y no usa DropZone", () => {
  assert.ok(shell.includes("onAction={onAction}"));
  assert.equal(shell.includes("DropZone"), false);
});
