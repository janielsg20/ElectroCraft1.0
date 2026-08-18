# M00.11 — Architecture Closure Matrix

Status: **PROPOSED — awaiting automatic M00.10-success-triggered CI gate**.

This matrix closes ownership decisions without creating replacement engines. Formal `ACCEPTED — GREEN` requires the M00.11 workflow marker `PASS_M00_11_ARCHITECTURE_CLOSURE`.

## Canonical product decisions

- ElectroCraft remains a **No-Code App Builder**, not a CMS-centered model.
- Core mental models: **Screens, Navigation, Data Sources**.
- Internal Data is exactly `DataSourceDefinition(kind=internal)`; it is not a parallel data subsystem.
- One canonical document/app representation feeds all runtimes and exporters.
- All nine export destinations remain first-class Core targets under one Export Target Contract.

## Engine closure

| Area | Decision | Engine owner | ElectroCraft ownership | Evidence |
|---|---|---|---|---|
| Screen composition | ACCEPT | Puck | canonical mapping, adapter, UX, target semantics | M00.3 + M00.11 published-package smoke |
| Studio primitives | ACCEPT | shadcn/ui with explicit Radix base | density, tokens, composition | M00.2 + current CLI `--base radix` contract |
| AI UI | ACCEPT SELECTED ONLY | AI Elements | AI state, Draft/Apply semantics | M00.2 source audit |
| i18n | ACCEPT | i18next/react-i18next | Spanish resources, typed keys | M00.2 + M00.11 real i18next API |
| Studio/Internal Data | ACCEPT | PGlite + Drizzle | canonical data schema/mapping | M00.4 + M00.11 real SQL/ORM probe |
| External Data Sources | CONDITIONAL | Fetch/OpenAPI/GraphQL + Gateway | DataSourceAdapter/DataResult/SecretRef | M00.9 real Scalar gate |
| Query authoring/cache | ACCEPT | RQB + TanStack Query | portable QueryDefinition/compiler | M00.5 + M00.11 QueryClient probe |
| Administration | ACCEPT, ADMIN ONLY | Refine + TanStack Table | AdminDocument/resource mapping/UI | M00.2 + M00.11 real package probes |
| Workflows | ACCEPT | Rete | ActionGraph mapping/runtime/export semantics | M00.6 + M00.11 Rete probe |
| Rich text | ACCEPT OSS CORE | Tiptap | portable rich-text field contract | M00.2 + M00.11 JSON→HTML probe |
| JS runtime state | ACCEPT | Zustand | StateDefinition/scopes/persistence policy | M00.7 + M00.11 store probe |
| Native runtime | ACCEPT | Expo/Expo Router/Expo SQLite | capability mapping/export semantics | M00.7 |
| AI invocation | ACCEPT PRIMARY | AI SDK + `@ai-sdk/google` | context policy, drafts, tools, Apply | M00.8 |
| Gemini narrow native gap | ACCEPT NARROW | `@google/genai` behind adapter | capability gate only | M00.8 live Interactions v1 evidence |
| Capacitor/LAMP/WordPress | CONDITIONAL | official runtimes | ExportIR mapping/compiler/verifier | M00.10 real runtime gate |

## GeminiNativeCapabilityAdapter decision

It **is retained**, but only for the already proven narrow capability gap: Gemini Interactions API `v1`. It is forbidden from becoming:
- a second generic provider abstraction;
- a duplicate of AI SDK `generateText`/`streamText`;
- a client-side credential path.

AI SDK + `@ai-sdk/google` remains the primary invocation/orchestration stack.

## Rejected/default alternatives

- Craft.js: rejected as Core because it overlaps the selected Puck Screen Composer ownership.
- GrapesJS: rejected as Core because it would introduce another editor/document/runtime representation.
- React Flow: rejected for workflows because Rete already owns graph editing/processing.
- Full low-code platforms: rejected as Core engines because they would own too much project/editor/runtime state and violate ElectroCraft canonical ownership.
- Parallel AI provider layer: rejected because AI SDK owns provider abstraction.
- Second query cache: rejected because TanStack Query is the sole JS async cache owner.

## Duplications eliminated

1. parallel screen editors;
2. parallel editor histories;
3. CMS-centered canonical project model;
4. proprietary AI provider abstraction;
5. physical dynamic DDL per logical model;
6. universal CRUD runtime trying to replace target-native runtimes;
7. second query cache;
8. target-specific canonical project models.

## Phase dependency audit

`experiments/architecture-closure-poc/fixtures/phase-dependencies.json` contains all F00–F27 owners and explicit dependency edges. The executable validator requires:
- exactly F00…F27, no gaps/duplicates;
- every phase has an owner;
- every dependency points to a lower phase number;
- F08 depends on F07 Navigation;
- F09 depends on F08 Data Sources;
- F15 Administration depends on F08 Data Sources.

## Formal closure condition

M00.11 cannot close on local-only evidence. The workflow is triggered by `workflow_run` only after **M00.10 Export Target Parity POC = success**, checks out that exact head SHA, installs exact closure-probe dependencies and executes real OSS APIs. Only `PASS_M00_11_ARCHITECTURE_CLOSURE` authorizes the documentation/state closure patch and transition to F01.
