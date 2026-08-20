# HANDOFF — ElectroCraft

## Current
F03 / M03.10 — Infraestructura español-primero e i18n tipado — `ACTIVE`.

## Estado heredado
- M03.9 cerró GREEN sobre `codex/m03-9-editor-session-appearance-profile`, head `457375512fcc3cc9da056720b86bad0c7233d920`, PR `#23` abierto contra `main`.
- Workflow propietario M03.9: run `32315742507` success; job `96267423764`; artifact `9388009972`; digest `sha256:d802096889a8ffed4a3806e5bb3bce8e11e570676cdee142afc9ba74a3a3cb5d`.
- M03.9 dedicado: unit `8/8`, contract `4/4`, integration `2/2`, Playwright `7/7`; full gate Node `37/37`, Vitest `244/244`, Playwright `52/52`, lint/typecheck/build GREEN.
- Base CI run `32315742400` GREEN y gates históricos M03.1–M03.8 revalidados GREEN.
- M01.4 Studio PWA Bootstrap fue reparado para usar `npm ci` y provisionar Chromium; run `32315742430` GREEN.

## Siguiente acción exacta
1. Leer `.ai/microphases/M03_10.md`, `.ai/I18N_SPEC.md` y los catálogos actuales de `apps/studio/src/i18n/` como contrato ejecutable.
2. Introducir `packages/i18n/` como owner/adaptador estable, no un segundo catálogo paralelo.
3. Configurar `i18next + react-i18next` con `es` inicial/fallback y namespaces `common`, `navigation`, `editor`, `content`, `queries`, `forms`, `backend`, `media`, `themes`, `export`, `settings`, `help`, `ai`.
4. Crear `locales/es/*.json` y migrar primero el AppShell/Settings conservando los wrappers tipados existentes durante la transición.
5. Implementar missing-key failure en dev/test, type-safe keys, ui-string lint/test e impedir labels inglesas OSS visibles.
6. Mantener component IDs, route IDs y slugs internos estables en inglés; solo el copy visible se traduce.
7. Implementar `Configuración > General > Idioma`, español por defecto, Guardar/Cancelar y HelpDescriptor con `Más información`.
8. Añadir Intl para fecha/número/moneda/pluralización y normalización error-code -> texto español.
9. Actualizar boundaries/aliases/grafo del monorepo para el nuevo owner `@electrocraft/i18n` sin relajar reglas arquitectónicas.
10. Añadir unit/contract/integration/E2E y gate M03.10; ejecutar lint, typecheck, test, build y browser audit antes de cerrar.

## Decisiones vigentes
- M03.9 Studio appearance es workspace/user preference y permanece aislada del Theme del proyecto y ExportIR.
- El Design System se consume solo desde su root público.
- La IA del Studio clasifica información como `primary | contextual | advanced | diagnostic`.
- Advanced usa Progressive Disclosure Radix; diagnostics críticos no se ocultan.
- `/content` es la ruta canónica List/Detail; rutas desconocidas fallan cerradas.
- Puck conserva ownership detrás de `@electrocraft/editor-puck`.
- Los catálogos TS españoles existentes son seam de compatibilidad que M03.10 debe centralizar, no duplicar.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_10.md → .ai/I18N_SPEC.md → UI_UX_LAYOUT_RULES.md → apps/studio/src/i18n → apps/studio/src/shell → packages/design-system`.
