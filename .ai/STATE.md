# STATE — ElectroCraft

## Estado actual

- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA / GREEN`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA / GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA / GREEN`.
- F03 — Design System, AppShell, español y ayuda: `COMPLETADA / GREEN`.
- F04 — Persistencia local, proyectos y revisiones: `COMPLETADA / GREEN`.
- F05 — Screen Composer con Puck: `COMPLETADA / GREEN`.
- F06 — Layout, responsive y edición avanzada: implementación fusionada; reparaciones heredadas certificadas dentro del gate F07.
- F07 — Pantallas, navegación y rutas: `COMPLETADA / GREEN`.
- F08 — Fuentes de datos, modelos, registros y conectores: `IN_PROGRESS`.
- M08.1 — Fuentes de datos y ConnectorRegistry: `IMPLEMENTADA / PENDIENTE GATE F08`.
- M08.2 — Fuente interna ElectroCraft Data sobre PGlite: `IMPLEMENTADA / PENDIENTE GATE F08`.
- M08.3 — REST API Connector y OpenAPI import: `ACTIVE`.

## Rama activa

`codex/m08-1-data-sources`

## Gate de entrada F08

F07 cerró con Base CI run `33262949215` (#795) completamente verde y PR `#68` fusionada a `main` en `e697a42546d23f89412e6dd616018759e719e448`.

## M08.1 implementada

- Owner único `ElectroCraftDataSourceDefinition` en `packages/domain/src/data/source-definition.ts`.
- 11 capability flags canónicos y aliases legacy solo para migración.
- Secrets excluidos recursivamente del payload; `authRef` conserva solo referencia.
- `DataSourceAdapter` + único `ConnectorRegistry` fail-closed por adapter/kind/capability/environment.
- `packages/connectors` registrado como paquete estable #20.
- `packages/data-web` consume el registry mediante `WebDataSourceRepository`.
- `/data-sources` usa `apps/studio/src/features/data/` con List/Detail/Inspector responsive y `help.data.sources`.

## M08.2 implementada

- `InternalDataSourceAdapter` `internal.pglite` sobre PGlite + Drizzle.
- Reutiliza la tabla genérica F04 `content_records`; no crea otra base ni una tabla por modelo.
- `InternalDataRepository` expone CRUD/query/stats y schema discovery desde `ElectroCraftDataSchema` canónico.
- Browser companion usa el mismo `electrocraft-studio-storage`, worker, migraciones y leader-election pattern de F04.
- Permission port inyectable fail-closed; Studio restringe al proyecto actualmente abierto sin adelantar F12.
- Studio ofrece `Crear ElectroCraft Data`, `Local`, `Disponible sin conexión`, Modelos, Registros, tamaño aproximado y Copia de seguridad.
- Help `help.data.internal`.
- Fixtures + unit tests + integración PGlite real preparados.

## M08.3 implementación actual

- `RestDataSourceAdapter` implementado con Fetch, timeout, params tipados, normalización 4xx/5xx/pagination y fallback a ConnectorGateway.
- `OpenAPI import adapter` implementado con `@scalar/openapi-parser@0.28.11`.
- `packages/connectors` expone públicamente REST/OpenAPI.
- Studio registra `rest.fetch` en el mismo `ConnectorRegistry`.
- Wizard REST funcional de seis pasos: Endpoint base → Autenticación → OpenAPI/Manual → Operaciones → Probar → Guardar.
- Fixtures REST/OpenAPI y tests M08.3 preparados.
- Evidencia: `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md`.

## Microfase activa

`M08.3 — REST API Connector y OpenAPI import` — `ACTIVE`.

Owner aprobado: Web Fetch API + DataSourceAdapter + `@scalar/openapi-parser@0.28.11`.

## Validación pendiente de microfase/fase

- El contenedor de esta sesión no resuelve `github.com`; no se pudo clonar/instalar el workspace para ejecutar la suite real.
- No se ejecutan Actions por microfase.
- Antes de cerrar M08.3 falta el descriptor exacto `help.data.rest` y una validación ejecutable lint/typecheck/Vitest/build.
- Antes del Gate F08 deben regenerarse `package-lock.json`, ampliar `format/format:check` a connectors/data-web y ejecutar el gate transversal una sola vez.

## Evidencia F08

- `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md`

## Siguiente transición

Cerrar los dos pendientes reales de M08.3: `help.data.rest` + validación ejecutable. Corregir solo errores reales y mantener M08.3 como única `ACTIVE`; no activar M08.4 antes de evidencia verde.
