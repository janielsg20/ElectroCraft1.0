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
- El workflow dedicado M04.7 se archivó al cerrar F04 para evitar CI duplicado; Base CI queda como gate transversal por defecto.

## 2026-08-25 — F05 iniciada
- M05.1 activa: `PuckAdapter` y component mapping canónico detrás de `@electrocraft/editor-puck`, preservando IDs/Slots, diagnostics recuperables y separación entre editor history y Project Revisions.

## 2026-08-27 — F05 completada
- M05.1–M05.8 integraron Puck como único Screen Composer con mapping/Slots, composition pública, action sync, history visual, inline editing, extensiones mínimas y Editor core E2E real.
- Base CI `33101434587` (#742) cerró `GREEN`; PR `#60` se fusionó mediante squash a `main` en `a81ca149c17391b9fe77aaaf57b125d229320173`.
- F06 inició con M06.1 para `ElectroCraftLayout/Style inspector`.

## 2026-08-27 — M06.1 completada
- `ElectroCraftDocument` avanzó a v4 con Layout/Style por nodo y migración recursiva desde v3.
- El adapter `@electrocraft/editor-puck` integra selección/replace públicos de Puck sin persistir internals ni CSS crudo.
- Inspector Diseño/Estilo, presets/tokens/reset/herencia, ayuda persistente y Canvas semántico quedaron funcionales y verificados.
- Gate local: lint, typecheck, Node 41/41, Vitest 415/415, build Studio/PWA y Playwright M06.1 GREEN.
- M06.2 quedó habilitada para responsive inheritance y reset.

## 2026-08-28 — F06 closure candidate
- M06.2 consolidó responsive inheritance/reset y viewports Puck con breakpoints canónicos.
- M06.3 añadió overrides Web/Android/iOS y capability diagnostics.
- M06.4 añadió rulers/guides/snapping editor-only con preferencias locales y alternativa de teclado.
- M06.5 añadió multiselección session-only, Group/Ungroup mediante acciones Puck y resize canónico compatible.
- M06.6 añadió breadcrumbs, copy/paste de subárbol canónico, visibilidad, lock por permisos y reusable blocks reales.
- M06.7 confirmó un único Puck para desktop/tablet/mobile con Sheets y dock móvil existente.
- M06.8 consolidó ownership, eliminó CSS duplicado, reforzó compatibilidad legacy de `visibility` y añadió QA contractual/E2E transversal.
- El gate `ElectroCraft Base CI` queda reservado para la PR final de F06; M06.8 permanece `ACTIVE` hasta resultado GREEN.
