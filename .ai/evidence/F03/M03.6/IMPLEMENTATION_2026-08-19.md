# M03.6 — Implementation evidence — 2026-08-19

## Estado
`COMPLETADA / GREEN` en PR `#19`. El cierre canónico vive en `.ai/evidence/F03/M03.6/CLOSURE_2026-08-19.md`.

## Scope implementado
- Desktop >=1280 conserva el editor completo M03.5 sin cambios de geometría.
- Laptop 1024–1279 conserva rail AppShell de 64px; `resolveLaptopPanelStrategy` usa split >=1152 y overlay para Contexto/Inspector cuando el viewport es 1024–1151.
- Tablet 768–1023 usa rail global de 56px con targets >=44px, navegación completa en Sheet y herramientas Contexto/Inspector en Sheets.
- Móvil <768 elimina el rail global, conserva Topbar compacta y añade dock inferior de 58px con exactamente `Componentes | Pantallas | Lienzo | Propiedades | Más`.
- Pantallas reutiliza el href del registry canónico `studioSidebarNavigation`.
- Componentes usa un Sheet inferior con `Puck.Components`.
- Propiedades usa el `Sheet` Radix existente con `side="bottom"` y `Puck.Fields`.
- Más abre Outline/Capas con `Puck.Outline` en Sheet full-height.
- Lienzo conserva `Puck.Preview` y permite retorno de foco explícito desde el dock móvil.
- Las superficies controladas usan un único estado activo por grupo y `SheetTrigger` real para restore-focus Radix.
- `SheetContent` se extendió en design-system con `SheetSide = left | right | bottom`; no se creó otro subsystem de drawer.
- HelpRegistry e icon registry Lucide documentan/exponen el comportamiento responsive.

## Compatibilidad preservada
- Contexto desktop 288px 240–380.
- Inspector desktop 320px 280–440.
- Statusbar AppShell 26px.
- Sidebar desktop 240/64 y laptop rail 64px.
- Topbar 52px y Settings gear/restore-focus existentes.
- Studio no importa `@puckeditor/core` directamente.
- M03.2 tablet fue actualizado únicamente en la expectativa superseded `sidebar hidden -> 56px rail + Sheet`; desktop/laptop/mobile se conservan.

## Cobertura GREEN
- Structural: `tooling/test/m03-6-responsive-shell.test.mjs` — `1/1`.
- Unit/contract/integration dedicado — `12/12` en `3` archivos.
- Playwright dedicado — `4/4`.
- Full Node — `29/29`.
- Full Vitest — `188/188` en `56` archivos.
- Full Playwright — `24/24`.
- Typecheck, boundaries y build GREEN.
- Workflow `M03.6 Responsive Shell Gate` run `32299990614`, job `96220101415`.
- Artifact `9382670739`; digest `sha256:8220e02ccde96f013de24c4ee258f3bbe36fb1600d486e6b65277ba4353bb67f`.
- Closure marker `PASS_M03_6_RESPONSIVE_SHELL`.

## Predecesor
M03.5 fue revalidado GREEN en `main` mediante run `32297534296`, job `96212236246`, artifact `9381789348`, digest `sha256:b5d07c57b0a24e8c1a4cf9df94707cd5eaf23948639fd8e0ab24081e46ac361b`.

## Continuidad
M03.7 es la única microfase `ACTIVE`, pero su implementación queda bloqueada hasta integrar PR `#19` y revalidar el gate M03.6 sobre `main`.
