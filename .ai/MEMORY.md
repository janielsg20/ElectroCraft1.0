# MEMORY — ElectroCraft Eighth Final

Product:
ElectroCraft — No-Code App Builder.

Execution:
F00 / M00.1, M00.2 and M00.3 COMPLETADAS; M00.4 activa.

M00.1 frozen invariants:
- R001–R084 tienen owner canónico, fase y aplicabilidad.
- CMS se subordina a Datos/Pantallas/Administración; no es la raíz del producto.
- Pantallas y Navegación/Rutas tienen ownership separado.
- all nine export destinations are Core and equal-status requirements.
- Target-specific behavior remains in capabilities/adapters/compilers, never parallel canonical trees.
- executable ownership fixture: `experiments/m00-1-requirements/`.

M00.2 frozen invariants:
- 30 audited OSS decisions are frozen in `experiments/m00-2-oss-audit/engine-audit.json` and ADR-0002.
- Puck owns visual authoring; Puck AI is not ElectroCraft AI.
- shadcn/ui base = Radix explicitly even though Base UI is upstream default for new projects.
- i18next owns i18n catalogs/fallback; Spanish is mandatory fallback.
- PGlite owns embedded local Postgres runtime and official multi-tab Worker behavior; Drizzle owns typed SQL/schema/migrations. Their real F00 runtime POC is M00.4.
- TanStack Query owns async cache. Refine is Administration only. TanStack Table owns table mechanics. RHF owns React form state. Zod owns schemas. RQB owns narrow condition authoring.
- Rete owns workflow graph/processing; Tiptap owns rich text; Zustand owns declared JS runtime state.
- Gemini Interactions core is GA in API `v1`; `v1beta`, preview models/agents/tools remain capability-gated. AI SDK + `@ai-sdk/google` remains the primary abstraction; `@google/genai` is narrow/capability-specific.
- AI only writes Draft; Apply remains explicit.
- Expo SQLite native lane is stable; web is alpha/capability-gated.
- dnd-kit upstream package/API transition must be pinned by the owning POC and never duplicates Puck surfaces.
- Secrets are references only; permission evaluation fails closed.

M00.3 frozen invariants:
- F00 Puck POC pins `@puckeditor/core@0.22.4`/MIT to tag `v0.22.4` for reproducible source evidence; product install must reverify the lockfile version.
- Puck owns insert/reorder/edit/Slot/history; ElectroCraft owns the canonical mapping and never a parallel visual-editor engine.
- `Container.children[]` canonical <-> Puck `children` Slot is the nesting boundary.
- Palette `Section` is `Container{semanticElement:"section"}`, not another canonical node type.
- Composition shell = Puck.Components + Puck.Outline + Puck.Preview + Puck.Fields with `onAction`.
- `onAction` rebuilds `ElectroCraftDocument` from public `newState.data`; Puck ui/index/zone/history internals cannot enter persistence.
- Exact upstream Puck blobs are SHA-verified and execute insert/reorder/replace/history including undo/redo in `experiments/m00-3-puck-composition/`.
- Full published React package mount must be smoke-tested when the Studio workspace can install packages; the F00 container had no npm-registry DNS and no mock mount was accepted.

Core mental model:
Screens, Navigation, Components, Data Sources, Queries, State, Actions, Forms, Auth, Administration, Resources.

Export targets — all Core:
local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress.

Export:
one TargetRegistry, one Capability Analyzer, one Export Target Contract.

LAMP:
Slim 4 + PSR-7 + Slim-CSRF + PDO + MySQL/MariaDB.

WordPress:
Block Theme + Companion Plugin, native WP APIs.

No optional export category.
