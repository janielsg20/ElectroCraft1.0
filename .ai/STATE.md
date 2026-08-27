# STATE — ElectroCraft

## Estado actual

- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`; Gate `GREEN`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`; Gate `GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA`; Gate `GREEN`.
- F03 — Design System, AppShell, español y ayuda: `COMPLETADA`; Gate `GREEN`.
- M03.1 — Design System del Studio: `COMPLETADA`; Gate `GREEN`.
- M03.2 — AppShell base del Studio: `COMPLETADA`; Gate `GREEN`.
- M03.3 — Sidebar global: `COMPLETADA`; Gate `GREEN`.
- M03.4 — Topbar global + Settings: `COMPLETADA`; Gate `GREEN`.
- M03.5 — Context / Canvas / Inspector / Status: `COMPLETADA`; Gate `GREEN`.
- M03.6 — AppShell y editor responsive: `COMPLETADA`; Gate `GREEN`.
- M03.7 — Progressive Disclosure y arquitectura de información: `COMPLETADA`; Gate `GREEN`.
- M03.8 — Palette descubrible: `COMPLETADA`; Gate `GREEN`.
- M03.9 — Apariencia del Studio Editor: `COMPLETADA`; Gate `GREEN`.
- M03.10 — Infraestructura español-primero e i18n tipado: `COMPLETADA`; Gate `GREEN`.
- M03.11 — Sistema de ayuda contextual: `COMPLETADA`; Gate `GREEN`.
- M03.12 — E2E AppShell completo: `COMPLETADA`; Gate `GREEN`.
- F04 — Persistencia local, proyectos y revisiones: `COMPLETADA`; Gate `GREEN`.
- M04.1 — Schema físico estable con PGlite/Drizzle + storage browser: `COMPLETADA`; Gate `GREEN`.
- M04.2 — Inicializar PGlite Multi-Tab Worker y migrations: `COMPLETADA`; Gate `GREEN`.
- M04.3 — Persistencia incremental, autosave y recovery: `COMPLETADA`; Gate `GREEN`.
- M04.4 — Project Home real: `COMPLETADA`; Gate `GREEN`.
- M04.5 — New Project Wizard y project actions: `COMPLETADA`; Gate `GREEN`.
- M04.6 — Import/Backup/Restore: `COMPLETADA`; Gate `GREEN`.
- M04.7 — Workspace preferences: `COMPLETADA`; Gate `GREEN`.
- M04.8 — Project Revision Checkpoints y Restore: `COMPLETADA`; Gate `GREEN`.
- F05 — Screen Composer con Puck: `IN_PROGRESS`.
- M05.1 — Crear PuckAdapter y component mapping: `COMPLETADA`; Gate `GREEN`.
- M05.2 — Componer Components/Outline/Preview/Fields: `COMPLETADA`; Gate `GREEN`.
- M05.3 — Nested Slots, permissions y Puck data migration: `COMPLETADA`; Gate `GREEN`.
- M05.4 — Sincronizar Puck actions con ElectroCraftDocument: `COMPLETADA`; Gate `GREEN`.
- M05.5 — Usar Puck visual history: `COMPLETADA`; Gate `GREEN`.
- M05.6 — Text/RichText inline editing: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Cierre F04 / M04.8

M04.8 cerró sobre head funcional `1df11b22fcd3bee7ea37846a459e28374271fc85` y PR `#48`. `ElectroCraft Base CI` run `32859794266` terminó `success`: documentación, lint/Prettier, typecheck, tests, build, Playwright repository gate, empty repository fixture y artifacts base quedaron verdes.

La PR `#48` fue fusionada mediante squash a `main` en `ad64c0e5468b13a3fa3a712adb6621fa33d22fd0` (`feat(f04): complete project revision checkpoints and restore`). F04 queda cerrada con object versions deduplicadas, checkpoints tipados, restore no destructivo, historial de revisiones y persistencia multi-tab real.

El workflow dedicado de M04.7 se archiva tras el cierre de F04; el quality gate transversal continúa siendo `.github/workflows/ci.yml`.

## Cierre F05 / M05.1

M05.1 cerró sobre head `9aa330dbf44b39485516ee0d3dc181a9aee4196b` y PR `#49`. `ElectroCraft Base CI` run `32868029914` (#656) terminó `success` con documentación, lint/Prettier, typecheck, tests, build, Playwright repository gate, empty repository fixture y artifacts base en GREEN.

La PR `#49` fue fusionada mediante squash a `main` en `733abdc44f21d16b56b4624c7bec61f0131bd3f1` (`feat(f05): add canonical Puck adapter and component mapping`). El adapter canónico preserva IDs/nesting, mantiene diagnostics recuperables y mantiene el historial del editor separado de Project Revisions.

## Cierre F05 / M05.2

M05.2 cerró con head funcional corregido `9321356994e5cc48748f1d406c920e28b8c9b141`. `ElectroCraft Base CI` run `32990513971` (#661) terminó `success`. La implementación se fusionó mediante squash por PR `#50` a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6` (`feat(f05): compose Puck editor surfaces`).

## Cierre F05 / M05.3

M05.3 cerró sobre head `176b41a31a017f800cb8f63b41be3b7e65f52324`. `ElectroCraft Base CI` run `33016557679` (#674) terminó `success`: documentación, lint, typecheck, 360 tests Vitest, build, Playwright repository gate y artifacts base quedaron GREEN.

La PR `#52` fue fusionada mediante squash a `main` en `fd5901dff66acca5d92ffee832a2ac881721458b` (`feat(M05.3): add nested Slots permissions and Puck migration`). Quedan activos Slots anidados, `allow/disallow`, permisos públicos Puck, migración oficial `zones -> slots`, `walkTree()` y fallo cerrado estable para migraciones incompletas.

## Cierre F05 / M05.4

M05.4 cerró sobre head `a56575ab62660eb94d70ae08aaf0df6c5cd6a010`. `ElectroCraft Base CI` run `33035570789` (#692) terminó `success`: documentación, lint/Prettier, typecheck, 371 tests Vitest, build, Playwright repository gate, empty repository fixture y artifacts base quedaron GREEN.

La PR `#56` fue fusionada mediante squash a `main` en `98b51b7ad35b3204f0b67899b4fd2392d1c100e7` (`feat(M05.4): sync Puck actions with canonical documents`). Puck `onAction(action, appState, prevAppState)` sincroniza únicamente cambios authoring reales hacia `ElectroCraftDocument`, reutiliza el autosave incremental F04 y mantiene selection/ui/history del engine fuera del payload canónico y separado de Project Revisions.

## Cierre F05 / M05.5

M05.5 cerró sobre head `9d61c1e3f9976893594b518e952320e723b59f81`. `ElectroCraft Base CI` run `33081006606` (#702) terminó `success`: documentación, lint/Prettier, typecheck, 381 tests Vitest, build, Playwright repository gate, empty repository fixture y artifacts base quedaron GREEN.

La PR `#57` fue fusionada mediante squash a `main` en `7aeaf701b077781f5b6ca0d659be2726dec7412b` (`feat(M05.5): use Puck visual history`). Deshacer/Rehacer del Topbar delega en la history pública de Puck, `visualHistoryLimit` queda local al Studio con rango seguro y el stack visual permanece session-only y separado de Project Revisions.

## Microfase activa

`M05.6` — Text/RichText inline editing.

Referencias: `.ai/microphases/M05_6.md`, `.ai/TRACKING.md`, `.ai/HANDOFF.md`.
