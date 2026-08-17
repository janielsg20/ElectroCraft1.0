# MEMORY — ElectroCraft Eighth Final

Product:
ElectroCraft — No-Code App Builder.

Execution:
F00 / M00.1 and M00.2 COMPLETADAS; M00.3 activa.

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
