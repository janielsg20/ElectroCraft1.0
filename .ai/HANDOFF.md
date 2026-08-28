# HANDOFF — ElectroCraft

## Current

F06 / M06.8 — Advanced editor QA — `ACTIVE`.

## Heredado

- F00–F05 están `COMPLETADA / GREEN`.
- M06.1 está `COMPLETADA / GREEN` con evidencia en `.ai/evidence/F06/M06.1/CLOSURE_2026-08-27.md`.
- M06.2 ya llegó a `main` en `97486d53b591f4d71cc848828e5f0a6929a870d8`.
- M06.3–M06.7 están implementadas en `codex/f06-advanced-editor` y esperan el gate final único de F06.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste AppState, selection, history, clipboard, locks, guides ni feedback transitorio.
- Blockers P0/P1 conocidos: `0`.

## Estado de cierre F06

La rama consolidada contiene:

1. responsive inheritance/reset y custom breakpoints;
2. platform overrides Web/Android/iOS con capability diagnostics;
3. rulers/guides/snapping editor-only;
4. multi-select session-only, Group/Ungroup y resize canónico;
5. breadcrumbs, copy/paste canónico, visibilidad, lock, duplicate/remove y reusable block;
6. adaptación tablet/mobile reutilizando el mismo `PuckEditorRoot`;
7. QA contractual y E2E transversal.

Correcciones de M06.8 ya aplicadas:

- eliminada la hoja duplicada `packages/design-system/src/styles/editor-guides.css`;
- `ELECTROCRAFT_STYLE_PROPERTIES` es la fuente única para traversal responsive/plataforma;
- `visibility` opcional funciona también con documentos v4 legacy que no contienen esa key en `base`;
- el runtime prioriza `kind=screen` cuando existen reusable components;
- M06.8 añade contract QA y E2E desktop → mobile 430px.

No existe validación local ejecutable registrada porque el contenedor actual no resuelve `github.com`. No inventar GREEN local.

## Siguiente acción exacta

1. Crear la PR final `codex/f06-advanced-editor` → `main`.
2. Dejar que `ElectroCraft Base CI` ejecute docs, lint, typecheck, test, build, Playwright, empty-repo y artifacts.
3. Si CI falla, corregir únicamente errores reales encontrados y volver a validar dentro del cierre F06.
4. Cuando CI quede GREEN, actualizar continuidad a F06 `COMPLETADA / GREEN` y activar `M07.1 — Modelo de Pantalla, Ruta y Navigation Graph`.
5. Fusionar F06 a `main` solo con gate GREEN.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F06.md → .ai/microphases/M06_8.md → .ai/evidence/F06/CLOSURE_CANDIDATE_2026-08-28.md → packages/domain → packages/editor-puck → packages/design-system → apps/studio/src/features/editor → tooling/vitest → tooling/playwright`.
