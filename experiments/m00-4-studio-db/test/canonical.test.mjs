import test from "node:test";
import assert from "node:assert/strict";
import { canonicalProjectObject, checksumCanonical, stableJson } from "../src/canonical.mjs";

test("stableJson ordena objetos sin reordenar arrays", () => {
  assert.equal(stableJson({ b: 2, a: { d: 4, c: [2, 1] } }), '{"a":{"c":[2,1],"d":4},"b":2}');
});

test("checksum canónico es estable frente al orden de keys", async () => {
  assert.equal(await checksumCanonical({ a: 1, b: 2 }), await checksumCanonical({ b: 2, a: 1 }));
});

test("dos Project Objects mantienen checksums independientes", async () => {
  const first = await canonicalProjectObject({ projectId: "p", objectId: "a", kind: "document", payload: { title: "A" } });
  const second = await canonicalProjectObject({ projectId: "p", objectId: "b", kind: "theme", payload: { title: "B" } });
  const changed = await canonicalProjectObject({ projectId: "p", objectId: "a", kind: "document", version: 2, payload: { title: "A2" } });
  assert.notEqual(first.checksum, changed.checksum);
  assert.equal(second.checksum, await checksumCanonical({ kind: second.kind, version: second.version, payload: second.payload }));
});
