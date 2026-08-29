# M07.3 — Editor visual orientado a Pantallas

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Implementación
- Screen Composer mantiene un único `PuckEditorRoot`; no crea una instancia Puck por target.
- Selector de Pantalla compartido entre topbar, tab contextual `Pantallas` y Sheet móvil.
- Cambio de Pantalla actualiza el documento canónico seleccionado y usa `sessionKey=document.id`, aislando historial visual entre documentos.
- Plataforma y breakpoint simulan el target sin cambiar la Pantalla canónica.
- Context tabs de release: `Componentes | Pantallas | Capas`; el concepto legacy `Páginas` no se reintroduce.
- Breadcrumb contextual del lienzo usa `App > Pantalla > Node`.
- Ayuda contextual `help.editor.screens` conectada al panel real de Pantallas.

## Archivos principales
- `apps/studio/src/features/navigation/editor-screen-selection-runtime.ts`
- `apps/studio/src/features/navigation/editor-screen-selector.tsx`
- `apps/studio/src/features/navigation/editor-screen-selector.css`
- `apps/studio/src/features/editor/use-puck-editor-runtime.ts`
- `apps/studio/src/shell/editor-workspace.tsx`
- `apps/studio/src/shell/studio-topbar.tsx`
- `packages/editor-puck/src/puck-context-bridge.tsx`
- `packages/editor-puck/src/puck-history-controls.ts`

## Pruebas preparadas
- contratos de cambio de Pantalla/historial en Vitest.
- `tooling/playwright/m07-8-navigation-e2e.spec.ts` abre Pantalla exacta, comprueba selector/contexto y audita móvil.

## Gate
No se ejecutaron Actions por esta microfase. La certificación final pertenece al Gate F07.

**Siguiente:** M07.4 — Navigation Builder UX.
