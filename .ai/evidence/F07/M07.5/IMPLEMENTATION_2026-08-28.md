# M07.5 — Route params, deep links y navegación por acciones

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Implementación
- `Route.params` tipados por origen `path|query` y tipo `string|number|boolean`.
- Binding `source='route'` reutiliza el sistema canónico de bindings y valida Ruta, parámetro y tipo.
- Acción portable `Navegar` admite destino por Ruta/Pantalla y modos `push|replace|back` con mappings tipados.
- Acción `Abrir enlace externo` es un contrato separado y acepta exclusivamente URLs `http/https`; no concatena URL strings.
- `ActionGraph` real persiste la acción y `Route.actionRefs` mantiene la referencia estable.
- Detalle de Ruta expone Path, Parámetros, Enlace profundo, Guards y Acciones en español.
- Ayuda contextual `help.navigation.routes` conectada al detalle real.

## Archivos principales
- `packages/domain/src/navigation/actions.ts`
- `packages/application/src/navigation/navigation-action-service.ts`
- `apps/studio/src/features/navigation/route-action-editor.tsx`
- `apps/studio/src/features/navigation/route-navigation-action-runtime.ts`

## Pruebas preparadas
- binding de Route Param tipado.
- required param y type mismatch.
- deep link y rename con refs estables.
- bloqueo de protocolo externo inseguro.
- `tooling/vitest/integration/navigation-e2e-flow.test.ts` integra acción con params dentro del flujo F07.

## Gate
No se ejecutaron Actions por esta microfase. La certificación final pertenece al Gate F07.

**Siguiente:** M07.6 — Guards y navegación por autenticación/permisos.
