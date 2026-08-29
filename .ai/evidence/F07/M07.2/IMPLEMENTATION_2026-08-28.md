# M07.2 — Pantallas: lista, árbol y propiedades

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Implementación
- `ScreensWorkspace` en `Construir > Pantallas` con lista de alta densidad, búsqueda, estado, orden, detalle y CTA `Nueva pantalla`.
- CRUD canónico de `ElectroCraftDocument kind=screen` con creación de Ruta y conexión al Navigation Graph.
- Duplicación regenera IDs de documento/nodos y propone una Ruta nueva sin copiar referencias inestables.
- Eliminación fail-closed cuando Ruta, Navegación, ActionGraph u otro documento mantiene referencias.
- `Abrir en Editor` usa `/editor?screen=<id>` y carga exactamente la Pantalla seleccionada.
- Responsive móvil lista → detalle; tablet/desktop conservan contexto y propiedades.
- Ayuda contextual `help.screens`.

## Archivos principales
- `packages/application/src/navigation/navigation-service.ts`
- `packages/application/src/navigation/screen-navigation-service.ts`
- `apps/studio/src/features/navigation/navigation-workspace-runtime.ts`
- `apps/studio/src/features/navigation/screens-workspace.tsx`
- `apps/studio/src/features/navigation/screens-workspace.css`
- `apps/studio/src/features/editor/puck-editor-runtime.ts`
- `apps/studio/src/features/editor/use-puck-editor-runtime.ts`

## Pruebas preparadas
- `tooling/vitest/unit/screen-crud.test.ts`
- cobertura integrada posterior en `tooling/vitest/integration/navigation-e2e-flow.test.ts`
- cobertura browser posterior en `tooling/playwright/m07-8-navigation-e2e.spec.ts`

## Gate
No se ejecutaron Actions por esta microfase. La certificación `lint/typecheck/test/build/Playwright` se reserva para el Gate F07.

**Siguiente:** M07.3 — Editor visual orientado a Pantallas.
