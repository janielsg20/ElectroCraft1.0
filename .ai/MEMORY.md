# MEMORY — ElectroCraft Eighth Final

Product:
ElectroCraft — No-Code App Builder.

Execution:
F00 / M00.1 COMPLETADA; M00.2 activa.

M00.1 frozen invariants:
- R001–R084 tienen owner canónico, fase y aplicabilidad.
- CMS se subordina a Datos/Pantallas/Administración; no es la raíz del producto.
- Pantallas y Navegación/Rutas tienen ownership separado.
- all nine export destinations are Core and equal-status requirements.
- Target-specific behavior remains in capabilities/adapters/compilers, never parallel canonical trees.
- executable ownership fixture: `experiments/m00-1-requirements/`.

Core mental model:
Screens, Navigation, Components, Data Sources, Queries, State, Actions, Forms, Auth, Administration, Resources.

Studio:
- shadcn/ui Radix.
- Tailwind.
- Lucide.
- i18next.
- HelpRegistry.
- selected AI Elements.
- Puck.
- PGlite.
- Rete.
- Refine for Administration.

AI:
AI SDK + @ai-sdk/google.
Gemini default.
Draft/Preview/Diff/Apply.
AI Elements for standard streaming/tool/plan UI.

Export targets — all Core:
local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress.

Export:
one TargetRegistry, one Capability Analyzer, one Export Target Contract.

LAMP:
Slim 4 + PSR-7 + Slim-CSRF + PDO + MySQL/MariaDB.

WordPress:
Block Theme + Companion Plugin, native WP APIs.

No optional export category.
