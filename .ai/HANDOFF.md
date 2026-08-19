# HANDOFF — ElectroCraft

## Current
F03 / M03.9 — Apariencia del Studio Editor completo — `ACTIVE`.

## Estado heredado
- M03.8 cerró GREEN en la rama `agent/m03-8-palette-discoverability` sobre head funcional `b3e66bf4d85518ea3f3102e8ffe0db472aea9947`.
- Workflow propietario `M03.8 Discoverable Palette Gate`: run `32308655658` success; job `96246831243`.
- Artifact `9385669357`; digest `sha256:1692ec47ef5cab4a30a480d8c3b7fb2763c9f2daf2faf5ad0e88b5aa1429434c`.
- Gate M03.8: structural `7/7`, M03.5 successor `1/1`, Vitest dedicado `27/27`, Playwright dedicado `11/11`, Node global `37/37`, Vitest global `230/230` en 63 archivos, Playwright global `45/45`, lint/format/typecheck/build GREEN.
- Palette discovery usa matriz ElectroCraft, Favoritos/Recientes por ID y fail-closed insertion; Puck mantiene ownership de drag/composition.

## Siguiente acción exacta
1. Leer `.ai/microphases/M03_9.md` como contrato ejecutable y auditar los tokens/preferences de Studio ya existentes antes de crear tipos nuevos.
2. Definir `StudioAppearanceProfile` como workspace/user preference schema, nunca como `ElectroCraftTheme` del proyecto.
3. Mapear todos los valores a design tokens existentes o añadir tokens compartidos en `packages/design-system` solo cuando falten.
4. Implementar `Configuración > Apariencia del Studio` con grupos Modo/Colores/Tipografía/Iconos/Forma/Densidad/Movimiento y copy español antes de renderizar controles.
5. Implementar Preview/Apply/Revert y presets personales; cerrar Settings con cambios pendientes debe ofrecer una decisión explícita.
6. Respetar reduced-motion del sistema y advertir combinaciones de contraste/accesibilidad inválidas con Restore Accessible Defaults.
7. Probar aislamiento: la apariencia del Studio no puede mutar ElectroCraftDocument, frontend Theme ni ExportIR.
8. Añadir unit/contract/integration/negative/persistence/E2E y ejecutar lint, typecheck, test, build y browser gate antes de cerrar M03.9.

## Decisiones vigentes
- La IA del Studio clasifica información como `primary | contextual | advanced | diagnostic`.
- Advanced usa Progressive Disclosure Radix encapsulado por `packages/design-system`; diagnostics críticos no se ocultan en Advanced.
- `/content` es la ruta canónica List/Detail; rutas redundantes/desconocidas fallan cerradas.
- Desktop conserva geometría M03.5; laptop, tablet y móvil conservan las adaptaciones M03.6.
- Puck conserva ownership detrás de `@electrocraft/editor-puck`.
- La Palette usa `.ai/PALETTE_CATALOG_MATRIX.md` como catálogo de descubrimiento, no el registry runtime de Puck.
- Favoritos/Recientes de Palette son preferences por `paletteItemId` y no Project Objects.
- Click-to-insert solo se habilita si el componentRef existe de verdad; mappings pendientes muestran diagnostics visibles.
- Apariencia del Studio pertenece a workspace/user preferences y debe permanecer aislada del Theme del proyecto y ExportIR.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_9.md → UI_UX_LAYOUT_RULES.md → packages/design-system → apps/studio/src/shell`.
