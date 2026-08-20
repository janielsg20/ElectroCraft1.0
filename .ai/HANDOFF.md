# HANDOFF — ElectroCraft

## Current
F03 / M03.12 — E2E AppShell completo, responsive, estados y accesibilidad — `ACTIVE`.

## Estado heredado
- M03.11 cerró GREEN en `codex/m03-11-contextual-help`, head `afcb2c304332a4a3819ef878cb9d3e3c3e91ea9d`, PR `#25`.
- Workflow propietario: run `32320190802`, job `96280687167`, artifact `9389415829`, digest `sha256:500c49b1ab6c73ceec1ba80324964cc9b5d64b72cb867ec0707ca33edbaec2a8`.
- M03.11 dedicado `12/12`, browser `5/5`, full repository gate GREEN.
- Base CI `32320190809` confirmó lint, typecheck, tests, build y Playwright GREEN.
- M03.10 i18n y contratos M03.5/M03.6/M03.7 revalidados durante la migración de Help.

## Siguiente acción exacta
1. Leer `.ai/microphases/M03_12.md`, `.ai/APP_SHELL_SPEC.md`, Playwright config y suites F03 existentes.
2. Reutilizar locators semánticos y web-first assertions; prohibir `page.waitForTimeout`/sleeps fijos.
3. Crear helpers de viewport/state/a11y solo si reducen duplicación sin ocultar intención del test.
4. Construir matriz 1440/1280/1024/768/375/320 para AppShell, overflow, paneles/Sheets, touch targets y orden de acciones.
5. Auditar rutas canónicas reales y fail-closed de rutas desconocidas; no añadir pantallas para satisfacer tests.
6. Cubrir Settings, Help/Search, Editor, empty states, disabled/history, save/status seams y diagnostics existentes.
7. Verificar keyboard/focus return y navegación completa; no confiar solo en click de ratón.
8. Buscar labels inglesas conocidas en release UI.
9. Revalidar que StudioAppearanceProfile no cambia ElectroCraftDocument, Theme o ExportIR.
10. Configurar evidencia screenshot/trace para fallos y estados significativos usando APIs Playwright actuales.
11. Crear `docs/qa/` y actualizar `.ai/SCREEN_SPECS` solo con comportamiento observado.
12. Añadir gate M03.12; ejecutar lint/typecheck/tests/build/browser. Cerrar M03.12 y Gate F03; activar M04.1 automáticamente.

## Decisiones vigentes
- Navegación canónica = M03.3/APP_SHELL_SPEC.
- Ayuda = registry único M03.11; no popovers ad hoc.
- i18n = `@electrocraft/i18n`; español inicial/fallback.
- Design System se consume solo por su root público.
- Puck conserva ownership detrás de `@electrocraft/editor-puck`.
- `/content` usa patrón List/Detail.
- Empty states nunca inyectan demo data.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_12.md → .ai/APP_SHELL_SPEC.md → playwright.config.ts → tooling/playwright → apps/studio/src/shell → apps/studio/src/help`.
