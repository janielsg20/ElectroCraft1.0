# TRACKING — ElectroCraft current position

Date: 2026-08-28.

| Scope | Estado | Evidencia |
| --- | --- | --- |
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1–M04.8 | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md` |
| F05 / M05.1–M05.8 | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` |
| F06 / M06.1–M06.8 | IMPLEMENTACIÓN FUSIONADA; cierre CI heredado con reparación pendiente | `main` PR `#64`; correction PR `#67`; run `33203881217` |
| F07 / M07.1 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.1/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.2 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.2/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.3 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.3/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.4 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.4/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.5 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.5/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.6 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.6/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.7 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.7/IMPLEMENTATION_2026-08-28.md` |
| F07 / M07.8 | IMPLEMENTADA / PENDIENTE GATE F07 | `.ai/evidence/F07/M07.8/IMPLEMENTATION_2026-08-28.md` |

## Rama activa

`codex/m07-1-navigation-model`

La rama parte de la corrección F06 y contiene toda F07. No se ejecutaron Actions por microfase; la estrategia sigue siendo un único gate al cerrar la fase.

## F06 — estado de verificación heredado

El rerun `33203881217`, job `99035169190`, terminó `failure` únicamente en `Playwright repository gate` después de que documentación, lint, typecheck, Vitest y build terminaran `success`.

La revisión de logs identificó blockers E2E heredados y esta rama ya contiene reparaciones para:

- Inspector avanzado sin selección: el test valida ahora el estado vacío accesible; M06.1 conserva tests de controles reales con selección.
- metadata responsive transitoria de Puck: el test valida que no se persista en el documento canónico.
- topbar a 1600px: herramientas secundarias se compactan al Sheet sin invadir Undo/Redo.
- Lock contextual: la reconexión por `refreshPermissions()` ya no elimina locks; el cambio real de Pantalla sí reinicia los locks de sesión.
- breadcrumbs de F06 se alinean con M07.3: `App > Pantalla > Node`.

Estas reparaciones todavía no están certificadas por un nuevo gate.

## F07 — implementación consolidada

- M07.1: Route v2 + Navigation Graph v2, migrations y validación de refs/ciclos.
- M07.2: Pantallas CRUD, detalle responsive, rutas/navegación y delete blocker.
- M07.3: Screen Composer con selector de Pantalla, history aislado y un solo Puck.
- M07.4: Navigation Builder tree + Stack/Tabs/Drawer/Modal + reorder accesible.
- M07.5: params/deep links/binding de Ruta + ActionGraph Navegar + URL externa segura.
- M07.6: Guards Público/Auth/Permiso/Condición + redirects sin loops + Preview fail-closed.
- M07.7: compiler boundaries React Router/Expo/LAMP-Slim/WordPress/Capacitor/Static.
- M07.8: flujo integrado, `/preview` contractual y Playwright desktop/tablet/mobile preparado.

## Siguiente acción exacta

`Gate F07 — Pantallas, navegación y rutas`.

Debe validar una sola vez la rama completa: docs conventions, lint/Prettier, typecheck, Vitest/integración, build y Playwright repository gate. F07 no se marcará GREEN hasta resultado `success`.
