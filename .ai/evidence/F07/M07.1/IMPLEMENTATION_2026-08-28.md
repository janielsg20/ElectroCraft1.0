# M07.1 — Implementation evidence — 2026-08-28

Estado: `IMPLEMENTADA / PENDIENTE GATE FINAL F07`.

## Resultado

ElectroCraft ya dispone de un modelo portable de `Screen`, `Route` y `Navigation Graph` sin persistir objetos de React Router, Expo Router ni routers específicos de target.

## Archivos principales

- `packages/domain/src/navigation/index.ts`
- `packages/domain/src/navigation/serialization.ts`
- `packages/domain/src/navigation/export-ir.ts`
- `packages/application/src/navigation/navigation-service.ts`
- `packages/application/src/app-behavior-service.ts`
- `apps/studio/src/features/navigation/navigation-workspace.tsx`
- `apps/studio/src/features/navigation/navigation-workspace-runtime.ts`
- `tooling/fixtures/canonical-model/route-v2.json`
- `tooling/fixtures/canonical-model/navigation-v2.json`
- `tooling/vitest/unit/navigation-model.test.ts`

## Contratos entregados

- `ElectroCraftDocument(kind="screen")` continúa como unidad canónica; la migración legacy `page -> screen` ya existente se reutiliza.
- `Route v2`: nombre, path, `screenRef`, parent route, parámetros path/query tipados, guards, deep-link aliases, action/state refs y metadata.
- `Navigation v2`: `rootNodeRef` y nodos `stack | tabs | drawer | modal | screen`.
- Migración automática `Route v1 -> v2` y `Navigation v1 -> v2`.
- Serialización canónica v2 y ExportIR compatible con los nuevos contratos.
- Boundary portable para futuros compilers multi-target.

## Integridad

El validador detecta, entre otros:

- rutas/path duplicados;
- screen refs inexistentes o no-screen;
- parent routes inexistentes o cíclicos;
- redirect route inexistente en guards;
- Navigation Graph cíclico;
- child/root refs inexistentes;
- initial node inválido;
- route refs de Navigation inexistentes o duplicados.

Un ciclo de navegación se trata fail-safe en Studio y no se renderiza recursivamente.

## UI / consumidor real

`App > Navegación` consume los contratos persistidos del proyecto, muestra el árbol portable, sus tipos de Navigator y el detalle de Ruta/Parámetros/Guards/Deep link. Puede crear y persistir una navegación inicial.

Ayuda contextual: `help.navigation`.

## Pruebas preparadas

- round-trip v2;
- migración v1 -> v2;
- params/guards/deep links;
- compiler source sin objetos target-specific;
- invalid initial node;
- ciclos;
- duplicate route path;
- missing screen;
- estabilidad de `screenRef` al renombrar.

No se ejecutó GitHub Actions para M07.1. Por estrategia del proyecto, lint/typecheck/test/build/Playwright se ejecutarán en el gate final único de F07.

## Siguiente

`M07.2 — Pantallas: lista, árbol y propiedades`.
