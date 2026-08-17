# HANDOFF — Eighth Final

Current:
F00 / M00.4 / EN_CURSO.

Completed:
- M00.1 GREEN — capability/ownership map.
- M00.2 GREEN — OSS responsibility/API/license/target audit.
- M00.3 GREEN — Puck Composition ownership/adapter POC with exact-source mechanics/history, Slot mapping and canonical onAction sync.

Read:
AGENTS -> RULES -> MEMORY -> STATE -> TRACKING -> `.ai/microphases/M00_4.md` -> PGlite/Drizzle official APIs.

Next:
Execute M00.4 — POC Studio DB genérica exactly. Use PGlite + Drizzle ownership already frozen by M00.2; prove schema/migrations/persistence/multi-tab strategy without creating a second Studio DB engine.

Carry-forward M00.3 install note:
The F00 container could not resolve npm registry, so the first Studio workspace that installs `@puckeditor/core` must smoke-mount the published Composition package. Do not replace Puck with a mock/parallel editor.

Do not begin M00.5 until M00.4 is green. Do not begin F01 until all F00 POCs and ADR closure are green.
