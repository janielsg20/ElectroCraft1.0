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
- F05 — Screen Composer con Puck: `COMPLETADA`; Gate `GREEN`.
- F06 — Layout, responsive y edición avanzada: `IN_PROGRESS`; closure candidate preparado.
- M06.1 — ElectroCraftLayout/Style inspector: `COMPLETADA`; Gate `GREEN`.
- M06.2 — Responsive inheritance y reset: `IMPLEMENTADA`; incluida en gate final F06.
- M06.3 — Platform overrides y diagnostics: `IMPLEMENTADA`; incluida en gate final F06.
- M06.4 — Advanced canvas guides/snapping: `IMPLEMENTADA`; incluida en gate final F06.
- M06.5 — Multi-select, Group/Ungroup y Resize: `IMPLEMENTADA`; incluida en gate final F06.
- M06.6 — Breadcrumbs y context actions: `IMPLEMENTADA`; incluida en gate final F06.
- M06.7 — Mobile/tablet editor tools: `IMPLEMENTADA`; incluida en gate final F06.
- M06.8 — Advanced editor QA: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Microfase activa

`M06.8` — Advanced editor QA.

## Closure candidate F06 — 2026-08-28

La rama `codex/f06-advanced-editor` acumula M06.3–M06.8 sobre el `main` que ya contenía M06.2. La estrategia de esta fase evita Actions por microfase: el único gate ejecutable oficial se lanza al final mediante `ElectroCraft Base CI` sobre la PR de F06.

Capacidades implementadas:

- Responsive canónico por breakpoint con presets/custom widths, herencia por propiedad y reset sin persistir viewport transitorio.
- Selector Web/Android/iOS, overrides por propiedad, fallback responsive/native y diagnostics basados en capability registry declarado.
- Reglas/guías/snapping editor-only con prioridad guía > hermano > padre > grid y preferencias locales del Studio.
- Multiselección session-only, Agrupar/Desagrupar mediante acciones públicas Puck y resize canónico solo para definiciones compatibles.
- Breadcrumbs jerárquicos, clipboard como `ElectroCraftDocumentNode`, visibilidad canónica, lock mediante permisos Puck, eliminar/duplicar y Guardar como bloque reutilizable real.
- Un solo `PuckEditorRoot` para desktop/laptop/tablet/mobile; mobile reutiliza Components/Outline/Properties mediante Sheets y mantiene click-to-insert/teclado.
- QA de ownership, ausencia de overrides experimentales release-critical, estado transitorio fuera de persistencia, workload mediano y E2E cross-responsive.

Correcciones QA importantes:

- La visualización avanzada del Canvas quedó con una sola hoja propietaria; se eliminó el stylesheet duplicado del Design System.
- `visibility` permanece opcional para documentos v4 antiguos, pero responsive/plataforma recorren una lista canónica única de propiedades para no perder overrides legacy.
- Los reusable blocks no pueden desplazar accidentalmente a la `screen` principal al reabrir `/editor`.
- Clipboard, locks, multiselección, guides y feedback no entran al payload canónico ni al autosave.

Evidencia candidate: `.ai/evidence/F06/CLOSURE_CANDIDATE_2026-08-28.md`.

## Cierres heredados

- F04: `.ai/evidence/F04/CLOSURE_2026-08-25.md`; PR `#48`; Base CI GREEN.
- F05: PR `#60`, squash `a81ca149c17391b9fe77aaaf57b125d229320173`, Base CI `33101434587` (#742) GREEN.
- M06.1: `.ai/evidence/F06/M06.1/CLOSURE_2026-08-27.md`; gate local GREEN.
- M06.2 llegó a `main` en `97486d53b591f4d71cc848828e5f0a6929a870d8` antes de abrir la rama consolidada de cierre F06.

## Siguiente transición

Cuando `ElectroCraft Base CI` de la PR F06 quede GREEN:

1. marcar F06 y M06.2–M06.8 `COMPLETADA / GREEN`;
2. fusionar la PR de F06;
3. activar `M07.1 — Modelo de Pantalla, Ruta y Navigation Graph`.

Referencias: `.ai/TRACKING.md`, `.ai/HANDOFF.md`, `.ai/phases/F06.md`, `.ai/microphases/M06_8.md`.
