# M07.7 — Boundaries de compilers de navegación multi-target

**Estado:** IMPLEMENTADA · pendiente Gate F07.

## Implementación
- `NavigationCompilerPort<TTargetOutput>` es independiente de routers concretos.
- `ElectroCraftNavigation + Route` permanece como única fuente canónica.
- Contratos de salida para React Router y Expo Router sin generar source final ni persistir objetos del engine.
- Contratos adicionales para LAMP/Slim y WordPress.
- Capacitor consume el contrato Web más un adapter de deep links; no crea otro modelo de navegación.
- Static Web clasifica Rutas como `pre-generate` o `runtime-blocked` y devuelve blockers explícitos.
- Diagnostics de compatibilidad para navigator options, guards y deep links no representables directamente.
- Ayuda contextual registrada como `help.navigation.compiler`; no existe pantalla propia de compiler en F07.

## Archivos principales
- `packages/domain/src/navigation/compiler.ts`
- `packages/application/src/navigation/navigation-compiler-service.ts`
- `tooling/fixtures/navigation-compiler/`

## Pruebas preparadas
- mismo Navigation model compilado a React Router/Expo y demás targets de contrato.
- Stack/Tabs mapping.
- diagnostics para Drawer/Modal y Static blockers.
- guards/deep links target diagnostics.
- integración F07 verifica React Router/Expo sobre el grafo completo.

## Decisión de arquitectura
`domain` no importa React Router ni Expo Router, y no persiste `RouteObject`, rutas de archivo, objetos WordPress o Slim.

## Gate
No se ejecutaron Actions por esta microfase. La certificación final pertenece al Gate F07.

**Siguiente:** M07.8 — Navigation E2E y UX.
