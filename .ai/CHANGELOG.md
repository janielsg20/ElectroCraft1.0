# CHANGELOG — ElectroCraft current

El changelog histórico original hasta M00.8 se preserva sin modificaciones en `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`.

## 2026-08-18 — F00 completada
- M00.9 cerró Data Sources con parser OpenAPI real y contratos REST/GraphQL/Gateway.
- M00.10 cerró Export Target Parity con static parity, Capacitor, LAMP/MySQL/PDO/CSRF y WordPress wp-env reales.
- M00.11 cerró Architecture Closure y habilitó F01.

## 2026-08-18 — F01 completada
- Se establecieron monorepo, ownership boundaries, TypeScript strict, quality pipeline, Studio técnico, CI reproducible y continuidad `.ai` fail-closed.

## 2026-08-18 — F02 completada
- Se cerró el modelo canónico portable v3, Component/Layout/Style, Data/Query/Form, Action/State/Navigation/Permissions, Theme/Blueprint/registries, serialización/checksum/migrations, ExportIR, ownership taxonomy y wrappers OSS.

## 2026-08-20 — F03 completada
- Design System shadcn/Radix, AppShell responsive, Sidebar/Topbar/Context/Canvas/Inspector/Status, Progressive Disclosure, Palette, tema light/dark, i18n español y HelpRegistry quedaron `GREEN` hasta M03.12.

## 2026-08-25 — F04 completada
- M04.1–M04.2: PGlite/Drizzle browser storage, migrations, Multi-Tab Worker y leader handoff.
- M04.3: autosave incremental, dirty-set, checkpoints y recovery explícito.
- M04.4–M04.5: Project Home, New Project Wizard y project actions reales.
- M04.6: backup/import/restore portable con checksums y estrategias de colisión.
- M04.7: workspace preferences y saved layouts sobre el mismo storage multi-tab.
- M04.8: `project_object_versions` deduplicado, Project Revision Service, diff/history y restore no destructivo.
- Base CI `32859794266` cerró `GREEN`; PR `#48` se fusionó mediante squash a `main` en `ad64c0e5468b13a3fa3a712adb6621fa33d22fd0`.

## 2026-08-27 — F05 completada
- M05.1–M05.8 integraron Puck como único Screen Composer con mapping/Slots, composition pública, action sync, history visual, inline editing, extensiones mínimas y Editor core E2E real.
- Base CI `33101434587` cerró `GREEN`; PR `#60` se fusionó mediante squash a `main` en `a81ca149c17391b9fe77aaaf57b125d229320173`.

## 2026-08-28 — F06 implementación fusionada y cierre correctivo
- M06.1–M06.8 implementaron Layout/Style, responsive, platform overrides, guides/snapping, multiselección, context actions y QA avanzada.
- La implementación F06 se fusionó a `main` mediante PR `#64`.
- La PR correctiva `#67` ejecutó Base CI `33203881217`: docs/lint/typecheck/Vitest/build terminaron `success`; Playwright terminó `failure` con seis E2E heredados.
- La rama F07 posterior incorporó reparaciones para estado vacío de Inspector avanzado, metadata responsive transitoria, solapamiento de topbar, lock contextual y breadcrumbs `App > Pantalla > Node`.

## 2026-08-29 — F07 completada
- M07.1 introdujo Route/Navigation v2, migración legacy, graph validation, params, guards y deep links.
- M07.2 añadió Pantallas CRUD, propiedades, Ruta/Navigator, apertura exacta en Editor y delete blocker por refs.
- M07.3 convirtió el Editor en Screen Composer orientado a Pantallas con selector compartido, un solo Puck e historial aislado.
- M07.4 añadió Navigation Builder tree con Pila/Pestañas/Menú lateral/Modal, reorder accesible y presentación portable.
- M07.5 añadió Route Params/deep links/bindings y ActionGraph Navegar `push|replace|back`, más URL externa http/https separada.
- M07.6 añadió Acceso Público/Auth/Permiso/Condición, redirects sin loops y Preview fail-closed sin implementar auth real antes de F12.
- M07.7 añadió `NavigationCompilerPort` y contratos React Router, Expo Router, LAMP/Slim, WordPress, Capacitor y Static Web sin persistir objetos target.
- M07.8 añadió `/preview` contractual, integración de cuatro Pantallas y Playwright de flujo completo desktop/tablet/mobile.
- Base CI run `33262949215` (#795) certificó documentación, lint, typecheck, Vitest, build, Playwright, empty-repo y artifacts en `success`.
- Las reparaciones QA heredadas de F06 quedaron incluidas y certificadas por ese gate.
- PR `#68` se fusionó a `main` en `e697a42546d23f89412e6dd616018759e719e448`.

## 2026-08-29 — F08 / M08.1 Fuentes de datos y ConnectorRegistry
- Se creó un owner único `ElectroCraftDataSourceDefinition` en `packages/domain/src/data/source-definition.ts` con environment scope y 11 capability flags canónicos.
- Aliases legacy `write/filter/paginate/subscribe/files` se normalizan sin crear un segundo contrato.
- Se endureció la exclusión recursiva de secrets; el proyecto solo conserva configuración portable y `authRef`.
- `DataSourceAdapter` expone testConnection/listResources/getSchema/query/mutate y `ConnectorRegistry` bloquea operaciones incompatibles fail-closed.
- `packages/connectors` se incorporó al grafo arquitectónico como paquete estable #20 reutilizando el mismo registry de aplicación.
- `packages/data-web` añadió `WebDataSourceRepository` sobre el registry existente; no se creó otra base PGlite.
- Studio añadió `/data-sources` en `apps/studio/src/features/data/` con List/Detail/Inspector responsive, estados honestos y Help `help.data.sources`.
- Se añadieron tests de registry, security, operation capability, round-trip, repository facade, Help y responsive contract.
- M08.1 queda implementada con evidencia `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`; la ejecución completa, regeneración del lockfile y formato se reservan para el Gate F08, sin Actions por microfase.
