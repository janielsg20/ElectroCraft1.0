# M03.2 — Implementación 2026-08-19

Estado: `ACTIVE` hasta obtener Gate GREEN en `main`.

## Base
- `main@c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae`.
- Predecesora M03.1 cerrada con run `32267795991` success.

## Implementación
- AppShell global real sobre `100dvh`.
- Geometría: Sidebar `240px` desktop / `64px` laptop; Topbar `52px`; workspace `minmax(0,1fr)` con scroll interno; Statusbar `26px`.
- `body/#root` sin scroll global.
- Tablet/mobile: Sidebar estructural pasa a `Sheet` Radix izquierdo; no se comprime desktop.
- `SheetContent` del design-system soporta `side="left" | "right"` sin crear primitive paralelo.
- `studio.menu` añadido al registry semántico Lucide.
- Copy visible nuevo pasa por `studio-shell.es.ts`; se preservan los 21 labels españoles exigidos.
- HelpRegistry `help.studio.shell` actualizado con límites de M03.2/M03.3/M03.4.
- M03.3 no se adelanta: no hay grouping final, `aria-current`, icono por item ni `WorkspacePreferencesPort`.

## Pruebas preparadas
- Unit: dimensiones y breakpoints + negative invalid viewport.
- Contract: boundaries, 21 labels, HelpRegistry, Radix Sheet, Lucide y no adelantar M03.3/M03.4.
- Integration: landmarks, empty workspace y estados visibles mediante SSR real.
- Playwright: desktop 240/52/26, laptop 64, tablet Sheet+keyboard+focus restore y móvil sin overflow/touch >=44.
- Gate dedicado: `.github/workflows/m03-2-app-shell.yml` + `npm run test:m03-2` + full `npm run check`.

## Pendiente para DONE
- Integrar overlay en main.
- Ejecutar Actions real y resolver únicamente fallos observados.
- Registrar artifact/digest y cerrar M03.2 solo con Gate GREEN.
