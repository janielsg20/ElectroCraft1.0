# HANDOFF — Eighth Final

Current:
F00 / M00.6 / EN_CURSO.

Completed:
- M00.1 GREEN — capability/ownership map.
- M00.2 GREEN — OSS responsibility/API/license/target audit.
- M00.3 GREEN — Puck Composition ownership/adapter POC.
- M00.4 GREEN — PGlite + Drizzle generic Studio DB with real multi-tab/persistence evidence.
- M00.5 GREEN — RQB 8.23.0 portable query adapter with real PGlite execution, fail-closed safety, facets, multi-source and persistence round-trip.

Read:
AGENTS -> RULES -> MEMORY -> STATE -> TRACKING -> `.ai/microphases/M00_6.md` -> Rete editor/engine/history official APIs.

Next:
Execute M00.6 — POC Action Flow Rete exactly. Build the minimum canonical Trigger -> Condition -> Data/Toast graph, map it to Rete, execute real ControlFlow/Dataflow and prove history undo/redo without persisting Rete classes.

Carry-forward M00.5 invariants:
- RQB owns condition-tree/operator/value parameterization; Electro owns only fail-closed policy and canonical physical binding.
- User values remain bind parameters; unsupported semantics block instead of degrading to a neutral predicate.
- Indexed/faceted fields use `record_field_index`; non-indexed fields read canonical JSONB.
- Query definitions persist as versioned Project Objects, not engine internals.
- CI closure source of truth: run `32063065255`, SUCCESS with `npm ci`.

Carry-forward M00.4 invariants:
- PGlite owns embedded Postgres/persistence/multi-tab Worker; Drizzle owns schema/query/migrations.
- Physical ElectroCraft DB remains six generic tables.

Do not begin M00.7 until M00.6 is green. Do not begin F01 until all F00 POCs and ADR closure are green.
