# F06 — Closure candidate — 2026-08-28

## Alcance

F06 — Layout, responsive y edición avanzada.

Rama consolidada: `codex/f06-advanced-editor`.

Base: `97486d53b591f4d71cc848828e5f0a6929a870d8` (`feat(M06.2): add responsive inheritance and breakpoint authoring`).

Estado al crear esta evidencia: implementación completa M06.2–M06.8; `ElectroCraft Base CI` todavía no ejecutado para la rama consolidada.

## Engine/API owner

- Puck 0.22.4 permanece como owner del editor visual, selección primaria, DnD, history, Composition y acciones authoring.
- ElectroCraft conserva únicamente contratos portables, adapters, UX española, diagnostics, preferencias editor-only y persistencia canónica.
- APIs públicas usadas: `viewports`, `createUsePuck/PuckApi`, `getItemById`, `getSelectorForId`, `insert`, `move`, `remove`, `duplicate`, `replace`, `setUi`, `resolvePermissions`, `refreshPermissions`, `Puck.Preview`, `Puck.Components`, `Puck.Outline`, `Puck.Fields`.
- No se usa `componentOverlay` ni un override experimental como dependencia release-critical.

## M06.2 — Responsive inheritance y reset

- Presets y custom breakpoints canónicos.
- Puck viewports solo como UI transitoria.
- Base + overrides por propiedad con herencia y reset.
- `ELECTROCRAFT_STYLE_PROPERTIES` garantiza traversal completo incluso para keys opcionales legacy.

## M06.3 — Platform overrides y diagnostics

- Contexto Web/Android/iOS session-only.
- Orden efectivo responsive → native → plataforma específica.
- Capability registry declarado en Studio y proyectado por `editor-puck` sin segundo registry persistente.
- Badges y diagnostics visibles por plataforma.

## M06.4 — Guides/snapping

- Rulers, guides y feedback de snap editor-only.
- Prioridad: guía > sibling > parent > grid.
- Preferencias persistidas solo como configuración local del Studio.
- Keyboard move/delete para guías.

## M06.5 — Multi-select, Group/Ungroup y Resize

- IDs extra de multiselección únicamente session-only.
- Primary selection continúa en Puck.
- Group/Ungroup delegan a `insert/move/remove` públicos.
- Resize escribe Style canónico solo para definitions `resizable`.
- `Shift+Enter` ofrece alternativa al pointer multi-select.

## M06.6 — Breadcrumbs y context actions

- Breadcrumbs derivados del árbol Puck actual.
- Copy/Paste transporta `ElectroCraftDocumentNode` y regenera IDs al pegar.
- Visibilidad usa `style.base.visibility`.
- Lock usa `resolvePermissions/refreshPermissions` y no se persiste.
- Save as block crea `ElectroCraftDocument(kind="reusable-component")` mediante autosave F04.
- El runtime prioriza documentos `kind=screen` al abrir el editor.

## M06.7 — Mobile/tablet editor tools

- Un solo `PuckEditorRoot` para desktop/laptop/tablet/mobile.
- Tablet/laptop reutilizan Sheets existentes.
- Mobile conserva cinco destinos: Componentes, Pantallas, Lienzo, Propiedades y Más.
- Preview, context actions, selection toolbar y guides se anclan al mismo Canvas.

## M06.8 — QA

Correcciones realizadas antes del gate:

1. Eliminado `packages/design-system/src/styles/editor-guides.css` por duplicar estilos ya owned por `apps/studio/src/features/editor/puck-composition.css`.
2. Añadido `ELECTROCRAFT_STYLE_PROPERTIES` como fuente única de traversal responsive/plataforma.
3. Añadidas regresiones legacy para `visibility` cuando un documento v4 antiguo no contiene esa key en `base`.
4. Añadido contract `advanced-editor-qa.test.ts` para ownership, ausencia de persistencia transient y workload mediano.
5. Añadido `m06-8-advanced-editor-qa.spec.ts` para desktop → mobile 430px con una sola sesión Puck.

## Tests añadidos/acumulados F06

### Unit

- `tooling/vitest/unit/responsive-inheritance.test.ts`
- `tooling/vitest/unit/platform-overrides.test.ts`
- `tooling/vitest/unit/canvas-guides.test.ts`
- `tooling/vitest/unit/puck-advanced-selection.test.ts`
- `tooling/vitest/unit/puck-context-controls.test.ts`

### Integration

- `tooling/vitest/integration/responsive-canvas-style.test.ts`
- `tooling/vitest/integration/platform-canvas-style.test.ts`
- round-trip/Puck persistence heredados de M06.1–M06.2.

### Contract

- `tooling/vitest/contract/platform-overrides-boundary.test.ts`
- `tooling/vitest/contract/puck-advanced-selection-boundary.test.ts`
- `tooling/vitest/contract/puck-context-actions-boundary.test.ts`
- `tooling/vitest/contract/mobile-tablet-editor-tools-boundary.test.ts`
- `tooling/vitest/contract/advanced-editor-qa.test.ts`

### E2E

- `tooling/playwright/m06-3-platform-overrides.spec.ts`
- `tooling/playwright/m06-4-canvas-guides.spec.ts`
- `tooling/playwright/m06-5-advanced-selection.spec.ts`
- `tooling/playwright/m06-6-context-actions.spec.ts`
- `tooling/playwright/m06-7-mobile-tablet-tools.spec.ts`
- `tooling/playwright/m06-8-advanced-editor-qa.spec.ts`

## Persistencia / boundaries

No deben aparecer en `ElectroCraftDocument`:

- Puck `AppState`/UI/history;
- viewport actual;
- multiselect IDs;
- guide geometry/feedback;
- clipboard;
- locked IDs;
- context menu state;
- transient drag geometry.

Sí pueden persistir:

- Layout/Style canónico;
- responsive breakpoints/overrides canónicos;
- platform style overrides canónicos;
- `visibility` canónica;
- reusable component documents explícitamente creados por el usuario.

## Validación ejecutable

El entorno de contenedor disponible durante esta sesión no pudo resolver `github.com`, por lo que no se registra un supuesto gate local.

Gate oficial pendiente: `.github/workflows/ci.yml` — `ElectroCraft Base CI`, activado al abrir la PR final F06. Debe cubrir docs, lint/Prettier, typecheck, tests, build, Playwright, empty repository fixture y artifacts.

F06 solo puede pasar a `COMPLETADA / GREEN` tras ese resultado.

## Siguiente fase tras GREEN

`F07 / M07.1 — Modelo de Pantalla, Ruta y Navigation Graph`.
