# M03.5 — Local static validation — 2026-08-19

Base consultada: `main@dd6ac8ea28276d9a1fc05f387338cba5980462a5`.

## Checks ejecutados sobre el paquete
- TypeScript parser (`typescript 5.8.3`, `transpileModule`) sobre 14 archivos `.ts/.tsx` del paquete: `PASS_TS_PARSE files=14`.
- `node --check` sobre `tooling/scripts/verify-m03-4-topbar.mjs`: `PASS`.
- `node --check` sobre `tooling/test/m03-5-editor-layout.test.mjs`: `PASS`.
- Gate estructural M03.5 (`node --test tooling/test/m03-5-editor-layout.test.mjs`) con el contrato AppShell 26px simulado exclusivamente para el archivo base `apps/studio/src/styles.css`, que no se duplica en el overlay: `1/1 PASS`.
- Balance sintáctico de llaves CSS: `PASS_CSS_BALANCE`.
- Regresión de ayuda M03.4 (`AppShell del Studio`, `WorkspacePreferencesPort`, `Configuración`, restore-focus) + geometría M03.5: `PASS_HELP_REGRESSION_TOKENS`.
- Compatibilidad estática del verifier M03.4 con transición post-cierre (`M03.4 GREEN` → `M03.5 ACTIVE`): `PASS_M03_4_POST_CLOSURE_VERIFIER_STATIC`.

## Checks no ejecutados aquí
No se declara GREEN para M03.5 porque este entorno no materializó el checkout completo con el grafo de dependencias instalado del repositorio. Quedan obligatorios sobre el árbol aplicado:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- o el agregado `npm run check`.

Este documento no sustituye evidencia de cierre.
