# ADR — F00 Architecture Closure

Date: 2026-08-17
Closed: 2026-08-18

Status: **ACCEPTED — GREEN**

## Context
F00 has progressively proven editor composition, local data, portable queries, workflows, native runtime, AI code generation, Data Sources/Gateway and export-target parity. M00.11 freezes ownership before product implementation continues.

## Decision
1. Keep one canonical ElectroCraft product model; engine internals never become canonical persistence.
2. Screens, Navigation and Data Sources are Core. Internal Data is one Data Source.
3. Puck owns visual screen composition/history surfaces exposed by its public API.
4. PGlite + Drizzle own Studio/Internal Data SQL runtime/schema/query/migration mechanics.
5. RQB owns condition authoring/formatting; TanStack Query owns the single JS async query cache.
6. Refine is Administration-only and composes TanStack Table; neither becomes the canonical data model.
7. Rete owns workflow graph editing/processing/history mechanics; ElectroCraft owns ActionGraph portability.
8. Tiptap OSS owns rich-text editing/JSON↔HTML semantics; paid/cloud features are not implicit Core dependencies.
9. Zustand owns JS runtime local state only; it is neither query cache nor database.
10. Expo owns native runtime/router/device/SQLite integration behind canonical mappings.
11. AI SDK + `@ai-sdk/google` is the primary AI provider/orchestration stack.
12. `GeminiNativeCapabilityAdapter` is retained only for the proven Gemini Interactions `v1` gap; no generic duplicate provider layer.
13. shadcn/ui is initialized with Radix explicitly; AI Elements are selected presentation components only.
14. All nine targets are Core and implement the same Export Target Contract; target runtime differences stay in adapters/compilers/verifiers.
15. Craft.js, GrapesJS and React Flow are rejected as default Core engines because they duplicate responsibilities already assigned to Puck/Rete or introduce competing representations.
16. No second editor history, query cache, AI provider abstraction, CMS-centered canonical model, dynamic-DDL-per-model strategy or universal CRUD runtime is permitted.

## Real API evidence
The M00.11 CI probe executed real APIs/imports for Puck, PGlite/Drizzle, Rete, i18next, Zustand, Tiptap, TanStack Query/Table, Refine, AI SDK/Google and Scalar. M00.7 remains the dedicated real Expo evidence; M00.10 remains the dedicated real Capacitor/LAMP/WordPress evidence.

Executed closure:
- upstream M00.10 run: `32100542215` — success;
- M00.11 run: `32100737146` — success;
- exact head: `3fe3815824d7847e88c7f91006d7a6236f00e527`;
- `PASS_REAL_ENGINE_MATRIX 11`: PASS;
- `PASS_M00_11_ARCHITECTURE_CLOSURE`: PASS;
- artifact `9311457041` — `m00-11-architecture-closure-evidence`;
- commit status `electrocraft/M00.11 = success`.

## Phase-order invariant
Every dependency in the F00–F27 closure graph points backward. F07 Navigation precedes F08 Data Sources, and F08 precedes F09 Queries and F15 Administration.

## Consequences
- F00 is formally closed.
- F01 is authorized and M01.1–M01.3 subsequently passed on the exact same head.
- Engine upgrades may change version pins but not ownership without a new ADR.
- Optional/fallback target classification remains forbidden.

## Closure
This ADR is ACCEPTED/GREEN because M00.10 and M00.11 completed successfully against the exact same validated head with the required real-engine markers and uploaded evidence.
