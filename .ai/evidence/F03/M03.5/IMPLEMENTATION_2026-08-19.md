# M03.5 — Implementation evidence — 2026-08-19

## Estado
`ACTIVE` — implementación preparada sobre `main@dd6ac8ea28276d9a1fc05f387338cba5980462a5`; cierre pendiente de ejecutar el gate completo sobre el árbol aplicado.

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
- i18n española dedicada y `help.studio.shell` ampliado.
- `verify-m03-4-topbar.mjs` actualizado para soportar regresión post-cierre (`M03.4 COMPLETADA/GREEN` + `M03.5 ACTIVE`), evitando que el workflow M03.4 falle al cambiar los archivos de continuidad.

## Verificación incluida
- Unit: `tooling/vitest/unit/editor-layout-model.test.ts`.
- Contract: `tooling/vitest/contract/editor-workspace-boundary.test.ts`.
- Integration: `tooling/vitest/integration/editor-puck-composition.test.ts`.
- Node structural gate: `tooling/test/m03-5-editor-layout.test.mjs`.
- E2E/visual: `tooling/playwright/m03-5-editor-layout.spec.ts`.

## Validación estática local
- TypeScript parse: PASS.
- Node structural gate: PASS.
- CSS balance: PASS.
- Evidencia: `.ai/evidence/F03/M03.5/LOCAL_STATIC_VALIDATION_2026-08-19.md`.

## Gate pendiente
Después de aplicar este paquete al repo:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run check
```

No marcar M03.5 `DONE` hasta que lint, typecheck, tests, build y Playwright estén GREEN en el árbol final.
