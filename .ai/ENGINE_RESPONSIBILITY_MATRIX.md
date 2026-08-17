# ENGINE RESPONSIBILITY MATRIX — ElectroCraft Eighth Final

Review date: 2026-08-17 (M00.2).
Canonical machine-readable audit: `experiments/m00-2-oss-audit/engine-audit.json`.

## Global ownership rules
- Engine public APIs own engine mechanics; ElectroCraft owns portable semantics, adapters, configuration, UX and target compilers.
- Do not persist engine internals as canonical project data.
- Do not install a parallel CRUD/table/form/query-cache/workflow/rich-text/state engine.
- Preview/beta APIs require an explicit capability gate and may not become Core defaults by accident.

# Studio primitives

## shadcn/ui + Radix
Own: Dialog/Popover/Tooltip/Menu/Sheet/Tabs/Fields and accessible focus/keyboard primitives copied into project source.

2026 baseline correction: Base UI is the default for new shadcn projects, but Radix remains supported. ElectroCraft therefore initializes with explicit Radix base (`shadcn init -b radix` / equivalent current CLI form) and never relies on the CLI default.

ElectroCraft owns Spanish copy, tokens, density, composition, AppShell and product semantics. Base UI is the upstream default for new projects and React Aria is also supported, but ElectroCraft explicitly initializes the Radix base. Do not mix bases in Core without ADR.

## Lucide
Own: tree-shakable icons. License ISC. ElectroCraft owns semantic icon IDs and accessible labels.

## i18next/react-i18next
Own: translation lookup, pluralization, namespaces and React bindings. Typed resources/default namespace/selector tooling are preferred. ElectroCraft requires `fallbackLng: 'es'` and owns Spanish source copy/catalog policy.

# AI-native UI

## AI Elements
Own selected standard AI UI: Conversation, Message/MessageResponse, PromptInput, Tool, Plan and required display helpers.
ElectroCraft owns artifact picker, context/privacy inspector, Draft Preview, Diff, Validation and Apply. AI Elements never owns the workflow graph and its React Flow canvas/node components are not installed for Core.

# Screen Composer

## Puck
Own: visual insertion/DnD, compositional `Puck.Components`, `Puck.Fields`, `Puck.Outline`, `Puck.Preview`, Slots, permissions, editor history, viewports and theming hooks.
New nesting uses Slot. DropZone is migration-only. Puck AI remains separate/beta and is not the ElectroCraft AI architecture.
ElectroCraft owns canonical Document, Screen context, Layout/Style, responsive/platform overrides, Bindings, Actions, accessibility and target mapping.

# Studio/local data

## PGlite + Drizzle
PGlite owns embedded PostgreSQL/WASM, transactions, persistence mechanics and the single-connection runtime. Multi-tab uses the official PGlite Worker/leader-election model rather than opening uncoordinated databases per tab.
Drizzle owns typed SQL/schema access plus migration generation/application. Use stable package lines by default; Drizzle 1.0 RC is not adopted implicitly.
ElectroCraft owns repositories, `project_objects`, `project_revisions`, Internal Data semantics and migration policy.

# Runtime async data

## TanStack Query
Own: the JS async cache/fetch/retry/invalidation lifecycle (`QueryClient`/`QueryCache`). No second async query cache.

# Data sources

## ConnectorRegistry/DataSourceAdapter
ElectroCraft contract because one portable app must describe Internal/REST/GraphQL/connector sources independently of a target. Framework/native HTTP/DB APIs remain target adapters.

# Administration

## Refine Core
Own: headless Administration resource/CRUD orchestration via data/access/audit providers and hooks. Refine is not the normal Screen runtime.

## TanStack Table
Own: headless table state/algorithms. Stay on the current stable API line; v9 beta is not a Core baseline until separately approved. Native targets use native list/card presentation rather than shipping a DOM table dependency only for parity.

# Forms

## React Hook Form + Zod
RHF owns JS/React/React Native form state. Zod owns Studio/Web/Native validation schemas. No custom parallel form-state or JS validation engine.
LAMP/WordPress compilers generate target-native server validation from portable constraints; they do not execute Zod in PHP.

# Query authoring

## React Query Builder
Own: condition-tree authoring, validation diagnostics and supported formatting helpers. It does not own DataSource, operation selection, TanStack cache or target compiler.

# Workflow

## Rete
Own: graph editor, sockets/connections, history plugin and JS Dataflow/ControlFlow mechanics. `ElectroCraftActionGraph` is canonical. LAMP/WordPress compile it to target services/hooks/endpoints. No React Flow workflow graph in Core.

# Rich text

## Tiptap
Own: one rich-text editing JSON format and Web static-rendering tools. Static renderer does not execute Editor plugins/hooks. No second persistent rich-text payload.

# State

## Zustand
Own: JS runtime state mechanics and optional persistence middleware. `ElectroCraftStateDefinition` remains canonical and targets adapt scopes.

# AI

## Vercel AI SDK + @ai-sdk/google
Primary owner for provider/model invocation, streaming, structured output, tool calls and bounded agent loops where the provider abstraction covers the capability.
The current Google provider documentation uses the Google Generative Language v1beta base endpoint and does not document the Gemini Interactions endpoint.

## @google/genai — narrow approved Gemini-native adapter
M00.2 confirms a real architectural gap for Interactions-specific capabilities: Google now recommends the Interactions API for new Gemini projects and its core is GA in `v1`, while that endpoint is not documented by the current `@ai-sdk/google` provider surface. ElectroCraft may therefore use `@google/genai` only behind `GeminiNativeCapabilityAdapter` for Interactions API / Gemini-native features not covered by AI SDK.
Configure stable `v1` explicitly for GA Interactions behavior; the GenAI SDK otherwise defaults to `v1beta`. API keys are server-side SecretRefs only and never shipped in browser/mobile source. Preview models/tools remain capability-gated.

AI never mutates canonical project state directly: Draft -> Preview/Diff -> Validate -> explicit Apply.

# Native

## React Native + Expo
Own Android/iOS native runtime/device ecosystem. Stable Expo SDK only; beta/canary is not Core baseline.

## Expo Router
Own Expo target file routing. Stable routing APIs are allowed; experimental server middleware/data loaders/SSR and ExperimentalStack are excluded from Core default.

## Expo SQLite
Own native local SQLite runtime/persistence. Generated schema/repositories remain ElectroCraft target output.

# Hybrid

## Capacitor
Own native WebView shell/platform projects/plugin runtime for the Capacitor target. It does not replace Expo and is not a fallback label.

# LAMP

## Slim 4 + PSR-7
Own HTTP routing/middleware/request-response.
## Slim-CSRF
Own CSRF middleware mechanism.
## PDO/MySQL/MariaDB
Own PHP DB access/runtime.
ElectroCraft owns code generation from canonical semantics.

# WordPress

## WordPress native APIs
Own blocks, Block Theme/theme.json, templates/parts/patterns, CPTs, taxonomies, metadata, options, users/roles/capabilities, REST, HTTP API, Media Library, hooks/nonces/admin. ElectroCraft owns the Theme/Plugin compiler.

# Auxiliary target adapters
- Apache ECharts: Web charts, Apache-2.0.
- Victory Native: Native charts, MIT; current upstream repository is `victory-native-xl` while package usage remains `victory-native`.
- FullCalendar Standard: Web calendar, MIT. Premium plugins are not silently included.
- react-native-calendars: Native calendar, MIT.
- dnd-kit: Web Kanban DnD, MIT; current package architecture is in transition, so F15 pins the exact supported API after POC rather than assuming legacy `@dnd-kit/core` signatures.

Everything is dependency-pruned and included only when a generated target needs it.

## M00.2 — ownership audit closure (2026-08-17)

Source of executable truth: `experiments/m00-2-oss-audit/engine-audit.json`.

Frozen ownership rules:
- Puck owns visual authoring capabilities already exposed by its public API; Puck AI is not ElectroCraft AI architecture.
- shadcn/ui uses the Radix base only; do not mix Base UI into the same primitive layer.
- i18next owns catalogs/fallback (`es`); react-i18next is only the React binding.
- PGlite owns local Postgres runtime and documented multi-tab Worker integration; Drizzle owns typed SQL schema/query/migrations.
- Refine is Administration orchestration only. TanStack Query owns async cache; TanStack Table owns table mechanics; RHF owns form state; Zod owns schemas/validation; RQB owns narrow condition authoring.
- Rete owns workflow graph/processing; Tiptap owns rich text; Zustand owns declared runtime/client state.
- AI SDK owns AI orchestration, `@ai-sdk/google` is the Gemini provider, and `@google/genai` is reserved for Google-specific APIs/capabilities. AI writes Draft only; Apply remains explicit.
- Expo/Router/SQLite are target adapters/runtime for native exports, never canonical model owners.
- Auxiliary libraries are target-scoped: Lucide icons, ECharts web charts, Victory Native native charts, FullCalendar Standard web calendar, react-native-calendars native calendar, dnd-kit Studio-only interactions outside Puck-owned surfaces.

Any future microphase that duplicates one of these engines must be rewritten before implementation.
