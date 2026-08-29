# M07.4 — Navigation Builder UX

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Implementación
- `NavigationBuilder` edita el mismo `ElectroCraftNavigation` persistido; no existe segundo modelo UI.
- Desktop: árbol 300px, estructura derivada central e inspector; tablet/móvil trasladan propiedades a Sheet.
- Navigators portables `Pila`, `Pestañas`, `Menú lateral` y `Modal`.
- Alta/baja de orden entre hermanos mediante drag y alternativa accesible `Mover arriba/abajo` por botones/teclado.
- Selección de `Pantalla inicial` limitada a hijos directos.
- Presentación portable por nodo: icono/visibilidad, header/back behavior, tabs, drawer y modal.
- Preview diagram se deriva del tree y no persiste coordenadas.
- Ayuda contextual `help.navigation.builder`.

## Archivos principales
- `packages/domain/src/navigation/builder.ts`
- `packages/application/src/navigation/navigation-builder-service.ts`
- `apps/studio/src/features/navigation/navigation-builder.tsx`
- `apps/studio/src/features/navigation/navigation-builder.css`
- `apps/studio/src/features/navigation/navigation-workspace-runtime.ts`

## Pruebas preparadas
- `tooling/vitest/unit/navigation-builder.test.ts`
- integración posterior en `tooling/vitest/integration/navigation-e2e-flow.test.ts`
- browser posterior en `tooling/playwright/m07-8-navigation-e2e.spec.ts`.

## Decisión de arquitectura
No se usa Rete/React Flow para esta navegación jerárquica. El árbol canónico es suficiente y evita persistir layout coordinates.

## Gate
No se ejecutaron Actions por esta microfase. La certificación final pertenece al Gate F07.

**Siguiente:** M07.5 — Route params, deep links y navegación por acciones.
