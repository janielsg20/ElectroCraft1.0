# HANDOFF — ElectroCraft

## Current
F03 / M03.6 — Adaptar laptop/tablet/mobile — `ACTIVE`.

## Estado heredado
- M03.5 cerró GREEN en PR `#18`, head validado `5044a3456cee87094f66d8c5f262b457ea338020`.
- Run propietario `32296070741` success; job `96207545673`.
- Artifact `9381289623`; digest `sha256:c78ebf5db9dd87d2235a08907f2f9e51ce9e00a070190540322530d026f4c73c`.
- Gate M03.5: structural `1/1`, Vitest dedicado `7/7`, Playwright dedicado `4/4`, Node global `28/28`, Vitest global `176/176`, Playwright global `20/20`, typecheck/build GREEN.

## Siguiente acción exacta
1. Confirmar que el gate M03.5 post-cierre sigue GREEN con `M03.5 COMPLETADA` y `M03.6 ACTIVE`.
2. Integrar PR `#18` en `main` sin introducir cambios ajenos al scope validado.
3. Ejecutar/revisar el gate propietario M03.5 sobre `main` y exigir GREEN.
4. Crear una rama limpia desde ese `main` y comenzar M03.6 según `.ai/microphases/M03_6.md`.
5. No implementar M03.7 ni funciones futuras mientras M03.6 esté ACTIVE.

## Decisiones vigentes
- Contexto desktop: 288px, min 240px, max 380px.
- Canvas domina el espacio restante y usa `Puck.Preview` por medio del adapter propietario.
- Inspector desktop: 320px, min 280px, max 440px.
- Statusbar owner de AppShell se reutiliza a 26px y continúa solo informativo.
- Sheets de herramientas usan triggers Radix reales y restore-focus nativo.
- `help.studio.shell` pertenece al AppShell y no se duplica en el workspace del editor.
- M03.6 debe preservar capacidades: laptop usa colapso/overlay según ancho útil, tablet rail + Sheets y móvil Topbar compacta + bottom nav.
- En móvil, Properties pertenece a bottom Sheet y Outline a Sheet full-height; objetivos táctiles y navegación por teclado deben seguir accesibles.
- `@puckeditor/core` no se importa desde Studio; el owner continúa siendo `@electrocraft/editor-puck`.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_6.md → .ai/APP_SHELL_SPEC.md`.
