# HANDOFF — ElectroCraft

## Current

F07 — Pantallas, navegación y rutas — `IMPLEMENTADA / PENDIENTE GATE`.

Rama activa: `codex/m07-1-navigation-model`.

Siguiente acción exacta: **Gate F07**.

## Heredado

- F00–F05 están `COMPLETADA / GREEN`.
- F06 fue fusionada funcionalmente a `main` mediante PR `#64`.
- La PR correctiva F06 `#67` ejecutó run `33203881217`; docs/lint/typecheck/Vitest/build pasaron y Playwright falló.
- La rama F07 actual parte de esa corrección y añade reparaciones de los blockers Playwright encontrados, todavía sin certificar.
- `@electrocraft/editor-puck` sigue siendo el único boundary del engine Puck. No persistir AppState, selection, visual history, clipboard, locks, guides ni feedback transitorio.

## F07 implementada

### M07.1
Route/Navigation v2, migración legacy, refs, cycles, params, guards, deep links y compiler source portable.

### M07.2
Pantallas CRUD, búsqueda/detalle responsive, Ruta/Navigator, duplicación, apertura exacta en Editor y delete blocker por referencias.

### M07.3
Screen Composer: selector de Pantalla en topbar/context/mobile, un solo `PuckEditorRoot`, history aislado por documento y breadcrumb `App > Pantalla > Node`.

### M07.4
Navigation Builder tree con Pila/Pestañas/Menú lateral/Modal, reorder drag + teclado, Pantalla inicial, inspector portable y preview derivado.

### M07.5
Route params/deep links, binding `source=route`, ActionGraph Navegar `push|replace|back` y URL externa http/https separada.

### M07.6
Guards Público/Auth/Permiso/Condición, redirect sin loops y Preview fail-closed; auth real sigue reservado para F12.

### M07.7
`NavigationCompilerPort` y contratos React Router, Expo Router, LAMP/Slim, WordPress, Capacitor y Static Web sin persistir objetos target.

### M07.8
`/preview` contractual, integración de cuatro Pantallas y Playwright de flujo UX/responsive preparado.

## Reparaciones QA heredadas incluidas

- Inspector avanzado sin selección: testea estado vacío accesible; controles reales permanecen cubiertos por M06.1.
- Responsive metadata de Puck: transitoria en la sesión, ausente del documento persistido.
- Topbar 1600px: cluster central compactado para no interceptar Undo/Redo.
- Lock contextual: no se pierde al refrescar permisos; `clearSessionLocks()` se ejecuta al cambiar proyecto/Pantalla.
- Breadcrumb E2E alineado con semántica F07.

## Gate requerido

Abrir PR `codex/m07-1-navigation-model` → `main` y dejar que `ElectroCraft Base CI` ejecute una sola validación de fase:

1. documentación;
2. lint/Prettier;
3. typecheck;
4. Vitest/integración;
5. build;
6. Playwright repository gate;
7. fixtures/artifacts base.

Si falla, corregir solo errores reales y rerun únicamente el job/failed jobs necesarios. No activar F08 hasta GREEN.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F07.md → .ai/microphases/M07_1.md … M07_8.md → .ai/evidence/F07/ → packages/domain/src/navigation → packages/application/src/navigation → apps/studio/src/features/navigation → tooling/vitest → tooling/playwright`.
