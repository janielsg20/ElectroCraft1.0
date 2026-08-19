# M03.5 — Implementation evidence — 2026-08-19

## Estado
`COMPLETADA / GREEN` en PR `#18`. El cierre canónico vive en `.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md`.

## Scope implementado
- Contexto desktop: 288px, rango 240–380px.
- Lienzo: `flex/minmax` dominante y composición `Puck.Preview` real.
- Inspector desktop: 320px, rango 280–440px.
- Statusbar: se reutiliza el owner AppShell existente de 26px; no se duplica y sigue siendo informativo.
- Resizers accesibles con puntero, touch-action y teclado; Home/End y flechas respetan min/max.
- Portátil 1024–1279: Contexto 240px + Lienzo; Inspector pasa a Sheet.
- Tablet 768–1023 y móvil <768: Lienzo prioritario; Contexto e Inspector pasan a Sheet.
- Puck se consume exclusivamente por `@electrocraft/editor-puck`; Studio no importa `@puckeditor/core`.
- Placeholders estructurales explícitos; no se crean widgets, persistencia ni funciones demo.
- i18n española dedicada y ayuda persistente ampliada sin duplicar `help.studio.shell` fuera de AppShell.
- Contexto/Inspector usan `SheetTrigger asChild` real para preservar restore-focus Radix.
- `verify-m03-4-topbar.mjs` soporta regresión post-cierre de M03.4.
- `tooling/test/m03-5-editor-layout.test.mjs` soporta estado activo y regresión post-cierre M03.5.

## Verificación incluida
- Unit: `tooling/vitest/unit/editor-layout-model.test.ts`.
- Contract: `tooling/vitest/contract/editor-workspace-boundary.test.ts`.
- Integration: `tooling/vitest/integration/editor-puck-composition.test.ts`.
- Node structural gate: `tooling/test/m03-5-editor-layout.test.mjs`.
- E2E/visual: `tooling/playwright/m03-5-editor-layout.spec.ts`.
- Workflow propietario: `.github/workflows/m03-5-editor-layout.yml`.

## Gate GREEN
- Head funcional validado: `5044a3456cee87094f66d8c5f262b457ea338020`.
- Run `32296070741`; job `96207545673`.
- Structural Node `1/1`.
- Vitest dedicado `7/7`.
- Playwright dedicado `4/4`.
- Full Node `28/28`.
- Full Vitest `176/176` en 53 archivos.
- Full Playwright `20/20`.
- Typecheck, boundaries y build GREEN.
- Artifact `9381289623`; digest `sha256:c78ebf5db9dd87d2235a08907f2f9e51ce9e00a070190540322530d026f4c73c`.
- Closure marker `PASS_M03_5_EDITOR_LAYOUT`.

## Continuidad
M03.6 es la única microfase `ACTIVE`. Antes de implementar su scope se debe integrar PR `#18` y revalidar el gate propietario M03.5 sobre `main`.
