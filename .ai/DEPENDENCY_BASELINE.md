# DEPENDENCY BASELINE — ElectroCraft Eighth Final
Review date: 2026-08-17 (M00.2); i18n owner reverified 2026-08-19 (M03.10).

Versions are reverified immediately before product installation. M00.2 freezes responsibility/stability lanes; the owning implementation/POC phase pins the final workspace versions.

# Studio
React 19 / Vite / Tailwind 4 compatible stack.
shadcn/ui uses explicit `radix` base. Since July 2026 Base UI is the default for new shadcn projects, ElectroCraft must never rely on the implicit default: initialize with `shadcn init --base radix` (or equivalent current CLI flag). React Aria is also a supported upstream base, but it is not ElectroCraft Core unless a future ADR changes the base.
Lucide.

M03.10 i18n owner exact workspace pins:
- `i18next@26.3.6`;
- `react-i18next@17.0.11`;
- `i18next-cli@1.69.0`.

The runtime is consumed only through `@electrocraft/i18n`; Spanish is the initial/fallback locale and `locales/es/*.json` is the catalog source of truth for migrated surfaces. i18next CLI owns translation lint/tooling while TypeScript `CustomTypeOptions` plus ElectroCraft strict-key wrappers enforce compile/runtime key contracts.

AI Elements: install only named components required by AI Workbench. Never install the whole registry or graph/canvas pieces just because they exist.

# Editor
M00.3 POC baseline: `@puckeditor/core@0.22.4` (MIT), tag `v0.22.4`, exact source pinned for executable evidence. Reverify the product workspace version immediately before installation.
Puck owns compositional Components/Fields/Outline/Preview, Slots, permissions, PuckApi history and viewport/theming APIs. New nesting = Slot; DropZone migration-only. `Container.children[]` canonical maps to a Puck `slot` prop; Puck Data remains edit representation, never the persisted ElectroCraft document. Puck AI stays outside Core AI architecture.
The M00.3 container could not install the published React bundle because npm-registry DNS is unavailable; the Composition contract is typechecked against the pinned API/source and exact upstream insert/reorder/replace/history source is executed. The first real Studio workspace must smoke-mount the published package after lockfile installation; mocks are not accepted as substitute evidence.

# Data
PGlite stable line + Drizzle stable line.
- Current M00.2 package observation: `@electric-sql/pglite` 0.5.5 exists in the official tagged package; reverify at M00.4 install.
- PGlite multi-tab uses the official Worker integration; persistence remains a PGlite filesystem/runtime responsibility.
- Drizzle owns typed schema/query and migration generation/application. Current stable release observation: 0.45.2; do not jump to 1.0 RC implicitly.
- M00.4 is the dedicated real PGlite/Drizzle Studio DB POC; M00.2 does not duplicate it.
TanStack Query = the single JS async cache/invalidation engine.
OpenAPI parser is chosen by its dedicated F00 POC. GraphQL remains a protocol adapter. No server DB drivers in browser Studio Core unless a connector extension requires them.

# Administration
Refine Core + TanStack Table stable line. Refine only for Administration. TanStack Table v8 remains stable; v9 is currently beta and requires the `@beta` lane, so do not adopt it in Core without an explicit later ADR/pin.

# Forms / validation
React Hook Form + Zod. Current Zod family is v4; no parallel JS form-state/validation engine.

# Query UI
React Query Builder for condition authoring/diagnostics only.

# Workflows
Rete + exact plugins required. No React Flow workflow engine in Core.

# Rich text
Tiptap OSS core + static renderer as required. One persistent rich-text JSON payload.

# State
Zustand. Persist middleware may store declared runtime slices; canonical state definition remains ElectroCraft.

# AI
AI SDK Core + `@ai-sdk/google` + `@ai-sdk/react` where required is the primary provider abstraction.
`@google/genai` is approved only behind `GeminiNativeCapabilityAdapter` for Interactions/Gemini-native capabilities not adequately exposed by the pinned AI SDK provider.
- Gemini Interactions core is GA in API `v1` and recommended by Google for new projects.
- GenAI SDKs default to `v1beta`; configure API `v1` explicitly for the stable Interactions lane.
- Individual preview models/agents/tools remain capability-gated even when the endpoint is GA.
- Server-side SecretRef only. Never embed Gemini API keys in web/mobile code or repository content.

# Native
Use the stable Expo SDK family compatible with the target workspace. Current Expo documentation exposes an SDK 57 compatibility row (RN 0.86 / React 19.2.3 / Node 22.13.x); reverify the exact tuple at F22/F23 installation rather than hardcoding it throughout the product.
Expo Router remains target navigation runtime, not canonical Navigation ownership.
Expo SQLite is stable on native targets; official web support is alpha and must remain capability-gated.
Do not make experimental Router/server/SSR surfaces Core defaults.

# Capacitor
Current official Capacitor packages/plugins only for used capabilities.

# LAMP
Slim Framework 4, approved PSR-7 implementation, Slim-CSRF, PDO/MySQL, Composer. Pin supported PHP baseline after target-hosting/security verification.

# WordPress
No WordPress runtime npm package is the canonical target. Compiler targets supported native WordPress APIs; use `@wordpress/*` packages as externals where appropriate.

# Auxiliary
- Lucide: icons only.
- Apache ECharts: Web charts, Apache-2.0.
- Victory Native: native charts, MIT; verify native peer stack with Expo baseline.
- FullCalendar Standard: MIT Standard only; Premium is a separate licensing decision.
- react-native-calendars: native calendar, MIT.
- dnd-kit: MIT; upstream is transitioning from legacy `@dnd-kit/core` to the newer `@dnd-kit/react` architecture. Exact package/API pin belongs to its owning POC; never use dnd-kit to rebuild Puck-owned authoring surfaces.

Everything is dependency-pruned.

# M00.2 executable fixture policy
`experiments/m00-2-oss-audit/` has zero external npm dependencies. It executes architecture/security contracts plus a real SQLite storage round-trip/transaction/error fixture through Node 22 `node:sqlite`.

Package observations captured during the 2026-08-17 audit include:
- i18next 26.3.6 latest observed release;
- PGlite 0.5.5 official tag/package;
- Drizzle ORM 0.45.2 stable observed release;
- Zod 4.4.3 latest observed release.

These observations are audit evidence, not a substitute for the owning phase workspace lockfile. M03.10 is the owning implementation for the i18n lane and therefore supersedes the earlier unpinned i18n observation with the exact lockfile pins listed above.
