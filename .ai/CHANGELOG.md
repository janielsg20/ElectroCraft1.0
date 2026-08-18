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

## 2026-08-18 — F02 completada
- M02.1 fijó `ElectroCraftProjectDefinition`, `ElectroCraftDocument`, IDs/refs y boundary Zod canónico.
- M02.2 fijó Component/Layout/Style portables y el adapter real de Puck.
- M02.3 fijó ownership de DataSource/DataSchema/DataModel/Query/Form y adapters RQB/PGlite.
- M02.4 fijó ActionGraph/State/Route/Navigation/Role/PermissionPolicy con Rete/Zustand y permisos fail-closed.
- M02.5 fijó Theme, Blueprint, registries y capability analysis, manteniendo exactamente 17 owner packages y schema v3.
- M02.6 consolidó serialización JSON determinista, checksum portable, `ElectroCraftMigrationRegistry` v1→v2→v3 e import transaccional sin mutación de storage ante errores.
- M02.7 añadió `ElectroCraftExportIR` immutable/versionado y neutral a targets, nueve `ExportTargetId`, `TargetCompileContext` separado y validación fail-closed.
- M02.8 fijó la taxonomía ejecutable 14 Project Objects + 6 Application Registries + 6 Content Entities y bloqueó registries/content collections embebidos.
- M02.9 añadió wrappers OSS `{ engine, schemaVersion, value }`, RQB rules v1 y Tiptap rich-text JSON v1, manteniendo runtime internals fuera del modelo canónico.
- Gate final F02 ejecutó las nueve suites dedicadas + `npm run check`: Node `27/27`, Vitest `128/128`, Playwright `1/1`, 17 owners, P0/P1 `0`.
- Gate F02 run `32197039836`: `success`; artifact `9346213452`; digest `sha256:160658d864ba742265c958ecab629fe855e5d425a78a3f643ecfce908c0aaa12`.
- F02 quedó cerrada y la ejecución pasó a F03 / M03.1.

## 2026-08-18 — F03 iniciada
- M03.1 activa: inicialización del design system con shadcn/ui sobre Radix, Lucide, Tailwind/tokens semánticos ElectroCraft, temas light/dark/system, i18n/help y galería técnica accesible.
