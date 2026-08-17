# HANDOFF — Eighth Final

Current:
F00 / M00.7 / EN_CURSO.

Completed:
- M00.1 GREEN — capability/ownership map.
- M00.2 GREEN — OSS responsibility/API/license/target audit.
- M00.3 GREEN — Puck Composition ownership/adapter POC.
- M00.4 GREEN — PGlite + Drizzle generic Studio DB with real multi-tab/persistence evidence.
- M00.5 GREEN — RQB portable query adapter with real PGlite execution.
- M00.6 GREEN — canonical Action Flow mapped to real Rete ControlFlow/Dataflow + real node/connection undo/redo.

M00.6 closure source of truth:
- final runtime pins: rete 2.0.6 / rete-engine 2.1.1 / rete-area-plugin 2.3.2 / rete-history-plugin 2.1.1;
- committed lockfile; install gate = `npm ci`;
- final reproducibility run `32069657914`, job `95509740663`, head `917ed319f1c5c0af1bc7f4b068b2693dbe9d5ebc`, SUCCESS;
- final artifact `9301226707`, digest `sha256:9a34d39785c8283a5f6f59272b30964939cacae04931f5bb79ce1899e946cd9b`;
- `PASS_REAL_RETE_ENGINE`;
- `PASS_REAL_RETE_HISTORY` node + connection undo/redo;
- `PASS_CLOSURE_GATE`;
- no Rete classes/history internals in canonical persistence.

Read next:
AGENTS -> RULES -> MEMORY -> STATE -> TRACKING -> `.ai/microphases/M00_7.md`.

Next:
Execute M00.7 exactly. Keep the POC isolated under `experiments/`; use official Expo/Expo Router/Expo SQLite/Drizzle/Zustand/Refine APIs before custom code. Do not add product routes or claim Android/iOS artifacts that were not actually built.

Do not begin M00.8 until M00.7 is GREEN. Do not begin F01 until all F00 POCs and ADR closure are GREEN.
