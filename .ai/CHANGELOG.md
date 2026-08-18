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
- Base CI M01.6 run `32161696542`: docs, lint, typecheck, tests, build, Playwright, empty-repo y artifacts verdes.
- Artifact M01.6 `9333862600`, digest `sha256:dc3d6fbc743725eca017bf4a0b923226ea35546e7cb5ac8e0ced4fb4d86e97f0`.
- Gate heredado M01.4 run `32161696559`: `success`.
- Gate heredado M00.10 run `32161696550`: M00.9, static parity, Capacitor, LAMP, WordPress y closure gate `success`.
- F01 queda cerrada y la ejecución activa pasa a F02 / M02.1.
