# CHANGELOG — ElectroCraft current

El changelog histórico original hasta M00.8 se preserva sin modificaciones en `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`.

## 2026-08-18 — F00 completada
- M00.9 cerró Data Sources con parser OpenAPI real y contratos REST/GraphQL/Gateway.
- M00.10 cerró Export Target Parity con static parity, Capacitor, LAMP/MySQL/PDO/CSRF y WordPress wp-env reales.
- M00.11 cerró Architecture Closure y habilitó F01.
- La evidencia detallada permanece en `.ai/evidence/F00/` y en el tracking histórico.

## 2026-08-18 — F01 completada
- M01.1 estableció monorepo, workspaces y ownership boundaries.
- M01.2 fijó TypeScript strict, aliases públicos y prohibición de deep/cross-owner imports.
- M01.3 fijó el quality pipeline raíz y el fixture de repositorio vacío.
- M01.4 creó el Studio React/Vite/PWA técnico con Project Home temporal y artifact PWA canónico.
- M01.5 añadió CI reproducible con `package-lock.json`, `npm ci`, cache npm por lockfile y permisos read-only.
- M01.6 normalizó `AGENTS/.ai`, separó MEMORY/STATE/TRACKING/HANDOFF, archivó reviews históricos, añadió ADR y un gate documental fail-closed.
- F01 quedó cerrada y la ejecución pasó a F02.

## 2026-08-18 — F02 progreso técnico M02.1–M02.9
- M02.1 fijó `ElectroCraftProjectDefinition`, `ElectroCraftDocument`, IDs/refs y boundary Zod canónico.
- M02.2 fijó Component/Layout/Style portables y el adapter real de Puck.
- M02.3 fijó ownership de DataSource/DataSchema/DataModel/Query/Form y adapters RQB/PGlite.
- M02.4 fijó ActionGraph/State/Route/Navigation/Role/PermissionPolicy con Rete/Zustand y permisos fail-closed.
- M02.5 fijó Theme, Blueprint, registries y capability analysis, manteniendo exactamente 17 owner packages y schema v3.
- M02.6 consolidó serialización JSON determinista, checksum portable, `ElectroCraftMigrationRegistry` v1→v2→v3 e import transaccional sin mutación de storage ante errores.
- M02.7 añadió `ElectroCraftExportIR` immutable/versionado y neutral a targets, los nueve `ExportTargetId`, `TargetCompileContext` separado, `ExportValidationReport` fail-closed, Media manifest portable y boundary común de revisión para web/native.
- M02.8 fijó una taxonomía ejecutable de 26 modelos: 14 Project Objects, 6 Application Registries y 6 Content Entities; documentó storage/serializer/migration/export ownership y añadió un boundary fail-closed contra registries completos o content collections embebidos en ProjectDefinition/ExportIR.
- M02.9 añadió wrappers OSS portables `{ engine, schemaVersion, value }`, Compatibility Analyzer fail-closed, RQB rules v1 con `@react-querybuilder/core@8.23.0` y Tiptap rich-text JSON v1 con un grafo mínimo exacto `3.29.2` de core/html/Document/Paragraph/Text.
- M02.9 mantiene Puck AppState/history, Rete NodeEditor/history, Zustand store y TanStack Query cache fuera del proyecto canónico; ProjectDefinition/Document siguen en schema v3 sin migración adicional.
- M02.9 cerró técnicamente en `main` con suite dedicada `11/11`, acumulada Node `27/27`, Vitest `128/128`, Playwright `1/1`, run `32196416073`, artifact `9346006290`, digest `sha256:0083bf96e88e0935a9876a37d8fc465b8315e03ec836dcd1d8bd8609c0d8770b`.
- La transición a F03 queda retenida exclusivamente por el Gate final de F02.
