# M07.6 — Guards y navegación por autenticación/permisos

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Implementación
- Configuración portable de Acceso: `Público`, `Usuario autenticado`, `Permiso` y `Condición`.
- Guards reutilizan referencias de auth/permission/action; F07 no implementa un segundo motor de seguridad.
- Redirect target obligatorio para acceso protegido y validado contra Rutas existentes.
- Prevención de self redirect y ciclos de redirección.
- Preview adapter fail-closed para probar contratos antes de conectar el evaluador real de F12.
- UI explica explícitamente que ocultar un elemento de Navegación no equivale a enforcement de seguridad.
- Ayuda contextual `help.navigation.guards` conectada al editor de Acceso.

## Archivos principales
- `packages/domain/src/navigation/guards.ts`
- `packages/application/src/navigation/navigation-guard-service.ts`
- `apps/studio/src/features/navigation/route-guard-editor.tsx`
- `apps/studio/src/features/navigation/route-guard-runtime.ts`
- `apps/studio/src/features/navigation/route-guard-editor.css`

## Pruebas preparadas
- Público/auth/permission/condition.
- redirect loop y self redirect.
- Preview fail-closed.
- `tooling/vitest/integration/navigation-e2e-flow.test.ts` cubre permiso, redirect y decisiones deny/allow.

## Limitación intencional
El evaluator real de autenticación/permisos pertenece a F12. F07 conserva únicamente contratos, referencias, validación y Preview contractual.

## Gate
No se ejecutaron Actions por esta microfase. La certificación final pertenece al Gate F07.

**Siguiente:** M07.7 — Boundaries de compilers de navegación multi-target.
