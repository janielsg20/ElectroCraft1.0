# HANDOFF — Eighth Final

Current:
F00 / M00.8 / EN_CURSO.

Completed:
- M00.1 GREEN — capability/ownership map.
- M00.2 GREEN — OSS responsibility/API/license/target audit.
- M00.3 GREEN — Puck Composition ownership/adapter POC.
- M00.4 GREEN — PGlite + Drizzle generic Studio DB with real multi-tab/persistence evidence.
- M00.5 GREEN — RQB portable query adapter with real PGlite execution.
- M00.6 GREEN — canonical Action Flow mapped to real Rete ControlFlow/Dataflow + real node/connection undo/redo.
- M00.7 GREEN — Expo Native runtime with real Android SQLite/Drizzle/Zustand/Refine + deep-link guard evidence.

M00.7 closure source of truth:
- final run `32078336103`, head `c6e05a475fa0df7fd7ba2a8138e1392bcf6df797`, SUCCESS;
- source/build job `95536145137`; Android runtime job `95536362004`;
- 13/13 tests, strict TS, lockfile v3, Android+iOS target exports, Android prebuild pruning and x86_64 release APK GREEN;
- visible Android runtime `M00.7 runtime OK` with SQLite/Drizzle/DataProvider/Zustand persistence;
- guarded deep link -> `Inicio de sesión requerido`;
- final Android artifact `9304563117`; source/build artifact `9304237635`;
- final fix serializes SQLite-backed Zustand hydration with `skipHydration` + explicit `rehydrate()` after DB initialization.

M00.8 current:
- isolated `experiments/gemini-provider-poc/` is on main;
- deterministic lockfile committed in `1c09876e4f59911d9cd1af95f012c07595c59d3f`;
- AI SDK + `@ai-sdk/google` primary; Zod validation;
- direct `@google/genai` restricted to Interactions `v1` probe;
- server gateway only; client has no provider/key fields;
- allowed read/draft/validate policy; Apply/DB/SQL/files/install/deploy/secrets denied;
- AI SDK structured output, bounded tools, stream/cancel, Gemini image;
- model IDs runtime-only; canonical data stores logical profile only;
- run `32082944290`: verify-static job `95549362334` GREEN across registry/npm ci/versions/lock/lint/strict TS/build/tests/integration/security/static closure;
- live job `95549443577` fails only at `Require server-only Gemini secret` because repository Actions secret `GEMINI_API_KEY` is absent;
- no live Gemini request has been executed yet, so M00.8 is not DONE.

Read next:
AGENTS -> RULES -> MEMORY -> STATE -> TRACKING -> `.ai/microphases/M00_8.md` -> AI_ARCHITECTURE -> AI_PROVIDER_GEMINI -> AI_TOOL_CATALOG -> AI_SECURITY_PRIVACY.

Next:
Add `GEMINI_API_KEY` as a GitHub Actions repository secret and rerun `Verify M00.8 Gemini Provider`. Only after live structured/tools/stream/cancel/image/Interactions and final commit status are GREEN may M00.8 close. Do not begin M00.9 before that.
