# M07.8 — Navigation E2E y UX

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Flujo integrado
M07.8 une las capacidades F07 en una sola experiencia verificable:
1. crear cuatro Pantallas;
2. crear/conectar Rutas;
3. construir Stack con Pestañas y Modal;
4. navegar con Parámetros tipados;
5. aplicar Guard con redirect;
6. abrir la Pantalla exacta en Editor;
7. ejecutar Preview contractual;
8. impedir eliminar una Pantalla referenciada;
9. mantener UX española, ayuda contextual y responsive.

## Preview stub
`/preview` dejó de ser un bootstrap genérico. `NavigationPreview` consume el mismo Navigation Graph canónico, permite seleccionar Ruta, muestra Parámetros y estructura derivada, y simula decisiones de Guards con `evaluateRouteAccessPreview` en modo fail-closed. No ejecuta auth real ni routers de target.

## Pruebas preparadas
### Integración
`tooling/vitest/integration/navigation-e2e-flow.test.ts`
- 4 Pantallas: Inicio, Productos, Detalle, Iniciar sesión.
- Stack raíz + Tabs + Modal.
- route param `productId` + query `preview` + deep link.
- ActionGraph Navegar con parámetros.
- Guard de Permiso y redirect.
- Preview deny/allow.
- delete blocker con referencias de Ruta, Navegación y Acción.
- compiler source React Router/Expo sin diagnostics.

### Browser / responsive
`tooling/playwright/m07-8-navigation-e2e.spec.ts`
- crea proyecto por el wizard público;
- crea Pantallas desde la UI y las abre exactamente en Editor;
- verifica aviso de Pantalla en uso y `Eliminar` deshabilitado;
- añade Pestañas y Modal desde Navigation Builder;
- abre Preview real;
- audita 768px y 375px sin overflow horizontal;
- comprueba Sheet móvil del Editor y propiedades responsive.

## Screenshots de gate
Playwright generará al ejecutar el Gate F07:
- `screens-desktop.png`
- `editor-screen-desktop.png`
- `navigation-builder-desktop.png`
- `preview-desktop.png`
- `screens-mobile.png`
- `preview-mobile.png`

## Archivos principales
- `apps/studio/src/features/navigation/navigation-preview.tsx`
- `apps/studio/src/features/navigation/navigation-preview.css`
- `apps/studio/src/App.tsx`
- `tooling/vitest/integration/navigation-e2e-flow.test.ts`
- `tooling/playwright/m07-8-navigation-e2e.spec.ts`

## Gate
No se afirma GREEN todavía. El cierre requiere el único Gate F07 con `lint`, `typecheck`, `test`, `build` y Playwright, además de revisar diagnostics P0/P1.

**Siguiente exacto:** Gate F07 — Pantallas, navegación y rutas.
