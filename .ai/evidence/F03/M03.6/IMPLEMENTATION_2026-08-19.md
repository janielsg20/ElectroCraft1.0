# M03.6 — Implementation evidence — 2026-08-19

## Estado
`ACTIVE`. Implementación escrita; pendiente gate propietario GREEN antes de cierre.

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

## Cobertura preparada
- Unit: `tooling/vitest/unit/responsive-editor-layout.test.ts`.
- Contract: `tooling/vitest/contract/responsive-shell-boundary.test.ts`.
- Integration: `tooling/vitest/integration/responsive-shell-runtime.test.ts`.
- Browser: `tooling/playwright/m03-6-responsive-shell.spec.ts`.
- Pendiente: structural Node gate, workflow propietario y ejecución real de full repository gate.

## Predecesor
M03.5 fue revalidado GREEN en `main` mediante run `32297534296`, job `96212236246`, artifact `9381789348`, digest `sha256:b5d07c57b0a24e8c1a4cf9df94707cd5eaf23948639fd8e0ab24081e46ac361b`.

## Blockers
Ningún blocker funcional P0/P1 conocido. M03.6 no puede marcarse COMPLETADA hasta obtener evidencia real de lint, typecheck, tests, build y Playwright GREEN.
