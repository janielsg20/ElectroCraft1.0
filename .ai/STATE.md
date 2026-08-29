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
- M08.1 — Fuentes de datos y ConnectorRegistry: `ACTIVE`.

## Rama activa

`codex/m08-1-data-sources`

## Gate de entrada F08

F07 cerró con Base CI run `33262949215` (#795) completamente verde: documentación, lint, typecheck, Vitest, build, Playwright, empty-repo y artefactos. PR `#68` fue fusionada a `main` en `e697a42546d23f89412e6dd616018759e719e448`.

## Microfase activa

`M08.1 — Fuentes de datos y ConnectorRegistry` tiene implementación funcional preparada y evidencia en `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`. Permanece `ACTIVE` hasta completar su revisión estática de continuidad y abrir la transición a M08.2; la certificación ejecutable completa se reserva para el Gate F08 conforme a la política de no usar Actions por microfase.

## Capacidades M08.1 implementadas

1. `ElectroCraftDataSourceDefinition` con owner único en `packages/domain/src/data/source-definition.ts`.
2. Capabilities canónicas `read/create/update/delete/pagination/filtering/sort/aggregate/realtime/file/transactions`, con aliases legacy solo para migración.
3. Configuración portable por entorno y bloqueo recursivo de passwords/API keys/tokens/credentials; secretos solo por `authRef`.
4. `DataSourceAdapter` con `testConnection`, `listResources`, `getSchema`, `query` y `mutate`.
5. Un único `ConnectorRegistry` de aplicación con validación de adapter/kind/capability/environment y operaciones fail-closed.
6. `packages/connectors` registrado como paquete estable #20 sin crear un registry paralelo.
7. `packages/data-web` consume el registry mediante `WebDataSourceRepository`, reutilizando el owner PGlite/Drizzle existente sin crear otro store.
8. `/data-sources` usa `apps/studio/src/features/data/`: lista 300px, detalle central, inspector seguridad/compatibilidad, Sheet tablet y flujo list→detail móvil.
9. Help contextual `help.data.sources` y tests de registry/security/responsive preparados.

## Límites de fase preservados

- Internal/PGlite adapter: M08.2.
- REST/OpenAPI: M08.3.
- GraphQL: M08.4.
- Gateway/SecretStore: M08.5.

M08.1 no adelanta estas responsabilidades.

## Validación pendiente de fase

El nuevo workspace `packages/connectors` requiere regeneración reproducible de `package-lock.json` y certificación de formato/toolchain antes del Gate F08. No se ejecuta GitHub Actions por microfase.

## Evidencia activa

- `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`

## Siguiente transición

Cerrar la revisión documental de M08.1 y continuar con `M08.2 — Fuente interna ElectroCraft Data sobre PGlite`, manteniendo una sola microfase `ACTIVE`.
