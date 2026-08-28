# TRACKING — ElectroCraft current position

Date: 2026-08-28.

| Scope | Estado | Evidencia |
| --- | --- | --- |
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1–M04.8 | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md` |
| F05 / M05.1–M05.8 | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` (#742) |
| F06 / M06.1 | COMPLETADA / GREEN | `.ai/evidence/F06/M06.1/CLOSURE_2026-08-27.md` |
| F06 / M06.2 | IMPLEMENTADA / GATE F06 | `main` `97486d53b591f4d71cc848828e5f0a6929a870d8` |
| F06 / M06.3 | IMPLEMENTADA / GATE F06 | Platform overrides + diagnostics |
| F06 / M06.4 | IMPLEMENTADA / GATE F06 | Guides/snapping + editor preferences |
| F06 / M06.5 | IMPLEMENTADA / GATE F06 | Multi-select + group/ungroup + resize |
| F06 / M06.6 | IMPLEMENTADA / GATE F06 | Breadcrumbs + context actions + reusable block |
| F06 / M06.7 | IMPLEMENTADA / GATE F06 | Mobile/tablet tools 360/430/768 |
| F06 / M06.8 | ACTIVE | QA integral y gate final de F06 |

## F06 — implementación consolidada

Rama de cierre: `codex/f06-advanced-editor`.

Base de la rama: `97486d53b591f4d71cc848828e5f0a6929a870d8` (`feat(M06.2): add responsive inheritance and breakpoint authoring`).

### M06.2 — Responsive inheritance y reset

- Presets Desktop/Laptop/Tablet/Mobile y custom breakpoints canónicos.
- `viewports` público de Puck para la superficie visible; viewport transitorio queda fuera del documento.
- Base + overrides por breakpoint con origen Base/Heredado/Anulado y reset por propiedad.
- `ELECTROCRAFT_STYLE_PROPERTIES` centraliza traversal para compatibilidad con propiedades opcionales legacy.
- Tests: `responsive-inheritance.test.ts`, `responsive-canvas-style.test.ts`, adapter/round-trip y E2E de M06.2 heredados de `main`.

### M06.3 — Platform overrides y diagnostics

- `puckPlatformControls` mantiene Web/Android/iOS como contexto session-only.
- Orden efectivo: responsive → native → plataforma específica.
- `platform-capabilities.ts` declara capacidades en Studio; `puck-platform-capabilities.ts` solo las proyecta a metadata del Config Puck.
- Inspector muestra origen, Anular/Restablecer, badges y diagnostics recuperables.
- Tests: `platform-overrides.test.ts`, `platform-canvas-style.test.ts`, `platform-overrides-boundary.test.ts`, `m06-3-platform-overrides.spec.ts`.

### M06.4 — Advanced canvas guides/snapping

- Reglas y guías editor-only alrededor de `Puck.Preview`.
- Prioridad de snap: guía > sibling > parent > grid.
- Geometría/feedback transient; preferencias de Regla/Guías/Ajuste/grid se guardan como preferencias locales del Studio, no como documento.
- Alternativa de teclado para mover/eliminar guías.
- Tests: `canvas-guides.test.ts`, `m06-4-canvas-guides.spec.ts`.

### M06.5 — Multi-select, Group/Ungroup y Resize

- La selección única de Puck sigue siendo engine-owned; ElectroCraft conserva únicamente IDs extra session-only para multi-select.
- `Ctrl/Cmd/Shift+clic` y `Shift+Enter` alternan multiselección.
- Agrupar inserta `Container` y mueve hermanos mediante `insert/move`; Desagrupar usa `move/remove` públicos Puck.
- Resize escribe `ElectroCraftStyle` canónico solo para definiciones con `metadata.resizable=true`; no depende de `componentOverlay` experimental.
- Tests: `puck-advanced-selection.test.ts`, `puck-advanced-selection-boundary.test.ts`, `m06-5-advanced-selection.spec.ts`.

### M06.6 — Breadcrumbs y context actions

- Breadcrumbs `Página > ... > Seleccionado` derivados de `getItemById/getSelectorForId`.
- Copy/Paste usa `ElectroCraftDocumentNode`; Paste regenera IDs y materializa el subárbol con acciones públicas Puck.
- Visibilidad se expresa como `style.base.visibility`; lock permanece session-only y se aplica con `resolvePermissions` + `refreshPermissions`.
- Guardar como bloque crea `ElectroCraftDocument(kind="reusable-component")` mediante el autosave existente.
- Runtime prioriza una `screen` al abrir proyecto para que reusable blocks no sustituyan el documento principal.
- Tests: `puck-context-controls.test.ts`, `puck-context-actions-boundary.test.ts`, `m06-6-context-actions.spec.ts`.

### M06.7 — Mobile/tablet editor tools

- Existe un solo `PuckEditorRoot` para todos los breakpoints.
- Tablet/laptop reutilizan Sheets; mobile conserva `Componentes / Pantallas / Lienzo / Propiedades / Más`.
- Preview y overlays avanzadas quedan ancladas al mismo Puck; no hay editor móvil alternativo.
- Tests: `mobile-tablet-editor-tools-boundary.test.ts`, `m06-7-mobile-tablet-tools.spec.ts` con 360/430/768.

### M06.8 — QA integral

- Se eliminó `packages/design-system/src/styles/editor-guides.css`; `puck-composition.css` queda como único owner visual de la overlay avanzada.
- `visibility` opcional legacy usa una lista canónica única de propiedades tanto para responsive como para plataforma.
- Contract QA: `advanced-editor-qa.test.ts` bloquea segundo runtime, uso release-critical de overrides experimentales, persistencia de session state y ownership duplicado; incluye workload mediano.
- E2E transversal: `m06-8-advanced-editor-qa.spec.ts` valida una misma sesión Puck al cambiar desktop → 430px mobile, plataforma Android, Properties Sheet y ausencia de overflow.
- El contenedor de ejecución local no puede resolver `github.com`; no se registra un falso gate local. El gate ejecutable oficial será `ElectroCraft Base CI` al abrir la PR final F06.

## Gate final pendiente

`ElectroCraft Base CI` debe ejecutar una vez abierta la PR de `codex/f06-advanced-editor` hacia `main`:

1. docs conventions;
2. lint/Prettier;
3. typecheck;
4. Node + Vitest;
5. build;
6. Playwright repository gate;
7. empty repository fixture;
8. artifacts base.

F06 no se marcará `GREEN` hasta que ese gate termine `success`.

Blockers funcionales P0/P1 conocidos: `0`.

## Siguiente microfase después del gate F06

`M07.1 — Modelo de Pantalla, Ruta y Navigation Graph`.
