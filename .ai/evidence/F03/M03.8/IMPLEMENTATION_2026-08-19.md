# M03.8 — Evidencia de implementación — 2026-08-19

## Scope

Implementación de la Palette descubrible de F03/M03.8 sobre el AppShell existente, sin introducir un owner paralelo de componentes.

## Precondición verificada

- PR #21/M03.7 integrado en `main` mediante merge `8eeeb40cf0965db880bf6b451dee28c0c0c2041f`.
- Gate propietario `electrocraft/M03.7` sobre ese merge: GREEN.
- Rama limpia M03.8 creada desde ese SHA: `agent/m03-8-palette-discoverability`.

## Implementación

- `apps/studio/src/shell/palette-catalog.ts`
  - catálogo ejecutable basado en `.ai/PALETTE_CATALOG_MATRIX.md`;
  - categorías exactas M03.8;
  - nombre/descripción/icon/kind/componentRef/presetId/keywords;
  - synonym index para posts/menu/login/JetEngine/social/commerce;
  - resolución fail-closed de inserción.
- `apps/studio/src/shell/palette-preferences.ts`
  - Favoritos y Recientes por `paletteItemId`;
  - límite/dedupe de Recientes;
  - round-trip JSON;
  - fallback seguro si localStorage no está disponible.
- `apps/studio/src/shell/palette-panel.tsx` + `.css`
  - Search arriba;
  - Favoritos/Recientes;
  - categorías;
  - grid 2 columnas por container query cuando el Context útil lo permite;
  - una columna en menor ancho;
  - click-to-insert accesible;
  - diagnóstico bloqueado visible;
  - Puck.Components conservado como fuente de drag;
  - integración desktop/tablet/mobile en el mismo Context existente.
- `packages/editor-puck/src/puck-editor-composition.ts`
  - bridge de dispatch Puck aislado detrás del adapter;
  - Studio no importa `@puckeditor/core`.
- i18n español y `help.studio.shell` actualizados.
- `.ai/PALETTE_UX_SPEC.md` y `.ai/PALETTE_SEARCH_SYNONYM_INDEX.md` añadidos.

## Adaptación de fase

F03/M03.8 posee la UX de descubrimiento, no los ComponentDefinitions finales del Screen Composer. La configuración Puck estructural actual todavía puede estar vacía; el mapping real pertenece a F05. Por ello:

- la Palette es funcional para búsqueda, navegación, Favoritos, Recientes y estados;
- Puck sigue siendo owner del drag/composition;
- click-to-insert solo despacha si el `componentRef` existe realmente en la configuración Puck activa;
- si el mapping no existe, el item queda `blocked` con código, ubicación, causa y acción sugerida;
- no se crean definiciones demo ni success falso para cerrar M03.8.

## Cobertura añadida

- Structural: `tooling/test/m03-8-palette.test.mjs`.
- Unit: catálogo y preferencias.
- Contract: boundary ElectroCraft/Puck y anti-duplicación.
- Integration: discovery -> preferences -> insertion resolution.
- Browser/E2E: search conceptual, categorías, grid, favoritos/recientes, diagnóstico, keyboard/focus y mobile Sheet.
- Workflow owner: `.github/workflows/m03-8-palette.yml` con contexto `electrocraft/M03.8`.

## Validación GREEN

Head funcional `b3e66bf4d85518ea3f3102e8ffe0db472aea9947` validado por `M03.8 Discoverable Palette Gate`, run `32308655658`, job `96246831243`, artifact `9385669357`, digest `sha256:1692ec47ef5cab4a30a480d8c3b7fb2763c9f2daf2faf5ad0e88b5aa1429434c`.

- Structural M03.8: `7/7`.
- M03.5 successor composition: `1/1`.
- Vitest dedicado: `27/27`.
- Playwright dedicado: `11/11`.
- Full gate: Node `37/37`, Vitest `230/230` en 63 archivos, Playwright `45/45`, lint/format, TypeScript strict, boundaries y builds GREEN.

M03.8 queda contractualmente cerrable sin blockers P0/P1 conocidos.
