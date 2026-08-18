# M00.11 OSS API review

Review date: 2026-08-17.

The architecture closure rechecked public APIs before freezing ownership. This does not silently upgrade dedicated POC baselines; it verifies that the selected ownership still matches current public surfaces.

## Current public API findings used by the closure POC

- Puck: `<Puck>`, Slot fields, permissions and `PuckApi` remain public composition/editor surfaces. Sources: `https://puckeditor.com/docs/api-reference/components/puck`, `https://puckeditor.com/docs/api-reference/fields/slot`, `https://puckeditor.com/docs/api-reference/permissions`.
- shadcn/ui: current CLI exposes `init --base <base>` with `radix` supported. Base UI is now the default for new projects, so ElectroCraft must keep explicit `--base radix`. Source: `https://ui.shadcn.com/docs/cli`.
- PGlite: `PGliteWorker`/`worker()` continue to be the official multi-tab path. Source: `https://pglite.dev/docs/multi-tab-worker`.
- Rete: `DataflowEngine` and `ControlFlowEngine` remain official `rete-engine` APIs. Source: `https://retejs.org/docs/api/rete-engine/`.
- i18next: `createInstance`, `init`, `t` and `fallbackLng` remain the supported APIs. Current observed npm version: `26.3.6`.
- Refine: Data Provider remains the data-layer integration point and Refine data hooks use TanStack Query; current observed `@refinedev/core` version: `5.0.12`.
- TanStack Query: `QueryClient` and `invalidateQueries` remain v5 APIs; current observed `@tanstack/query-core`: `5.101.2`.
- TanStack Table: v8 headless `getCoreRowModel` remains the stable Core lane; current observed `@tanstack/table-core`: `8.21.3`.
- Tiptap: StarterKit and JSON-to-HTML utilities remain official OSS APIs; current observed Tiptap v3 line used by the closure probe: `3.29.2`.
- Zustand: `createStore` and `persist` remain official APIs; current observed npm version: `5.0.14`.
- AI SDK: `generateText`, `streamText`, `Output` and tool calling remain provider-agnostic core APIs. M00.8's exact pinned AI SDK/Google versions remain authoritative for F00.
- Expo Router remains the native routing owner; current docs expose the SDK 57 Router line. M00.7 remains the exact native POC baseline and M00.11 does not silently migrate it.

## Decision impact

No ownership reversal was found. The architecture remains single-engine-per-responsibility, with ElectroCraft limited to canonical mapping, configuration, portability, UX, adapters and target semantics.
