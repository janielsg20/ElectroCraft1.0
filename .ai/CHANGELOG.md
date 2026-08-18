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

## 2026-08-18 — F02 progreso hasta M02.7
- M02.1 fijó `ElectroCraftProjectDefinition`, `ElectroCraftDocument`, IDs/refs y boundary Zod canónico.
- M02.2 fijó Component/Layout/Style portables y el adapter real de Puck.
- M02.3 fijó ownership de DataSource/DataSchema/DataModel/Query/Form y adapters RQB/PGlite.
- M02.4 fijó ActionGraph/State/Route/Navigation/Role/PermissionPolicy con Rete/Zustand y permisos fail-closed.
- M02.5 fijó Theme, Blueprint, registries y capability analysis, manteniendo exactamente 17 owner packages y schema v3.
- M02.6 consolidó serialización JSON determinista, checksum portable, `ElectroCraftMigrationRegistry` v1→v2→v3 e import transaccional sin mutación de storage ante errores.
- M02.7 añadió `ElectroCraftExportIR` immutable/versionado y neutral a targets, los nueve `ExportTargetId`, `TargetCompileContext` separado, `ExportValidationReport` fail-closed, Media manifest portable y boundary común de revisión para web/native.
- M02.7 cerró con Node `27/27`, Vitest `108/108`, Playwright `1/1`, gate main `32191193359`, artifact `9344256616` y digest `sha256:52f1fd78d673b8094bf29be9d1b47e8aa7a1b92aa8f8c4b9e6f219687a3d375b`.
- La ejecución activa pasa a F02 / M02.8 para clasificar Project Objects vs Registries vs Content Entities.
