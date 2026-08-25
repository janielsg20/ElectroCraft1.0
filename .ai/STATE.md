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
- M05.1 — Crear PuckAdapter y component mapping: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Cierre F04 / M04.8

M04.8 cerró sobre head funcional `1df11b22fcd3bee7ea37846a459e28374271fc85` y PR `#48`. `ElectroCraft Base CI` run `32859794266` terminó `success`: documentación, lint/Prettier, typecheck, tests, build, Playwright repository gate, empty repository fixture y artifacts base quedaron verdes. La corrección final mantuvo recovery/autosave M04.3 sobre el nuevo `ProjectRevisionService`.

La PR `#48` fue fusionada mediante squash a `main` en `ad64c0e5468b13a3fa3a712adb6621fa33d22fd0` (`feat(f04): complete project revision checkpoints and restore`). F04 queda cerrada con object versions deduplicadas, checkpoints tipados, restore no destructivo, historial de revisiones y persistencia multi-tab real.

El workflow dedicado de M04.7 se archiva tras el cierre de F04; el quality gate transversal continúa siendo `.github/workflows/ci.yml`.

## Microfase activa

`M05.1` — Crear PuckAdapter y component mapping.

Referencias: `.ai/microphases/M05_1.md`, `.ai/TRACKING.md`, `.ai/HANDOFF.md`.
