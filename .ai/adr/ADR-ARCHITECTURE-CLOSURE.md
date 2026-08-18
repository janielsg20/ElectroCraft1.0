# ADR — F00 Architecture Closure

Date: 2026-08-17

Status: **PROPOSED — M00.10 SUCCESS + M00.11 REAL-API CI REQUIRED**

## Context
F00 has progressively proven editor composition, local data, portable queries, workflows, native runtime, AI code generation, Data Sources/Gateway and export-target parity. M00.11 must freeze ownership before product implementation starts.

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
The M00.11 CI probe executes real APIs/imports for Puck, PGlite/Drizzle, Rete, i18next, Zustand, Tiptap, TanStack Query/Table, Refine, AI SDK/Google and Scalar. M00.7 remains the dedicated real Expo evidence; M00.10 remains the dedicated real Capacitor/LAMP/WordPress evidence.

## Phase-order invariant
Every dependency in the F00–F27 closure graph points backward. F07 Navigation precedes F08 Data Sources, and F08 precedes F09 Queries and F15 Administration.

## Consequences
- F01 can begin only after M00.10 succeeds and the M00.11 workflow emits `PASS_M00_11_ARCHITECTURE_CLOSURE`.
- Engine upgrades may change version pins but not ownership without a new ADR.
- Optional/fallback target classification remains forbidden.

## Closure rule
Do **not** change this ADR to `ACCEPTED — GREEN`, mark M00.11 completed, or start F01 until the automatic M00.11 workflow has a successful run against the exact successful M00.10 head.
