# HANDOFF — ElectroCraft

## Current
F03 / M03.5 — Construir Context/Canvas/Inspector/Status — `ACTIVE`.

## Estado heredado
- `main@dd6ac8ea28276d9a1fc05f387338cba5980462a5` cerró M03.4 con run `32278183037` success.
- M03.4 artifact `9374817606`; digest `sha256:7f22461f600be17afa7b72a2cb54cccf0d08115ca9fe30c8dd2b583567847dd9`.
- Full gate M03.4: Node `27/27`, Vitest `169/169`, build PASS, Playwright `16/16` y `npm run check` GREEN.

## Siguiente acción exacta
1. Aplicar el paquete M03.5 sobre `main@dd6ac8ea28276d9a1fc05f387338cba5980462a5` sin eliminar archivos no incluidos.
2. Ejecutar `npm ci --ignore-scripts --no-audit --no-fund` y `npm run check`.
3. Resolver únicamente fallos reales de formato, typecheck, tests, build o Playwright dentro del scope M03.5.
4. Con M03.5 GREEN, registrar `CLOSURE` y solo entonces activar M03.6.

## Decisiones vigentes
- Contexto desktop: 288px, min 240px, max 380px.
- Canvas domina el espacio restante y usa `Puck.Preview` por medio del adapter propietario.
- Inspector desktop: 320px, min 280px, max 440px.
- Statusbar owner de AppShell se reutiliza a 26px y continúa solo informativo.
- Laptop reduce primero Inspector a Sheet; tablet/móvil trasladan Contexto e Inspector a Sheet.
- Separadores desktop admiten puntero y teclado con límites explícitos.
- `@puckeditor/core` no se importa desde Studio; el owner es `@electrocraft/editor-puck`.
- No hay widgets, datos demo, persistencia ni funciones simuladas adelantadas.
- Ayuda crítica continúa bajo `help.studio.shell`.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_5.md → .ai/APP_SHELL_SPEC.md`.
