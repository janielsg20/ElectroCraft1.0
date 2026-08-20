# HANDOFF — ElectroCraft

## Current
F03 / M03.11 — Sistema de ayuda contextual y explicación de todas las secciones — `ACTIVE`.

## Estado heredado
- M03.10 cerró GREEN sobre `codex/m03-10-spanish-first-i18n`, head funcional `4731b1056bf8e75377e45f3ff1b438a4d9e9a101`, PR `#24` apilado sobre M03.9.
- Workflow propietario M03.10: run `32318184912` success; job `96274840342`; artifact `9388906418`; digest `sha256:3f7573c3af3da92fd002097155d926505d1711feb6b09da336caf42511b0dba6`.
- M03.10 dedicado: `12/12`; browser `4/4`; full gate Node `39/39`, Vitest `256/256`, Playwright `56/56`, lint/typecheck/boundaries/build GREEN.
- Base CI run `32318184871` GREEN; artifact `9388919028`.
- M03.2 AppShell full repository gate independiente GREEN sobre el mismo head.
- Monorepo actual: 18 owner packages, 20 aliases públicos y 2 apps; `@electrocraft/i18n` es owner estable de locales españoles.

## Siguiente acción exacta
1. Leer `.ai/microphases/M03_11.md`, `.ai/APP_SHELL_SPEC.md`, `apps/studio/src/help/help-registry.ts`, `locales/es/help.json`, empty states y primitives actuales del Design System.
2. Mantener la navegación M03.3 como canónica; no reintroducir Taxonomías/Relaciones/Roles del wording antiguo.
3. Evolucionar HelpDescriptor a keys i18n tipadas (`titleKey`, `shortKey`, `longKey`, examples, related IDs, learn-more ref) conservando compatibilidad donde sea útil durante la migración.
4. Implementar un solo HelpRegistry para todos los destinos canónicos superiores realmente definidos.
5. Añadir primitive Popover shadcn/Radix al Design System solo si falta, consumiéndolo exclusivamente desde el root público.
6. Implementar `HelpTrigger` reutilizable: CircleHelp, tooltip corto, Popover desktop 320–380px y Sheet móvil, keyboard/focus return.
7. Implementar Help Drawer global con `Buscar en la ayuda`, búsqueda por título/descripción/keyword/sección y navegación a conceptos relacionados.
8. Conectar el botón global Ayuda antes de Settings y los triggers H1/empty states sin crear popovers específicos por módulo.
9. Hacer que empty states reales enlacen `¿Qué puedo hacer aquí?` sin introducir datos demo ni pantallas ficticias.
10. Crear `.ai/SECTION_HELP_CATALOG_ES.md` y completar `locales/es/help.json`.
11. Añadir unit/contract/integration/E2E y gate M03.11; validar focus return, responsive Popover/Sheet, búsqueda y Topbar ordering.
12. Ejecutar lint, typecheck, tests, build y browser audit; cerrar M03.11 y activar M03.12 automáticamente.

## Decisiones vigentes
- i18n se consume desde `@electrocraft/i18n`; copy visible nuevo no se hardcodea.
- El Design System se consume solo desde su root público.
- Puck conserva ownership detrás de `@electrocraft/editor-puck`; ayuda no altera ComponentDefinitions.
- La IA del Studio clasifica información como `primary | contextual | advanced | diagnostic`.
- `/content` es la ruta canónica List/Detail; rutas desconocidas fallan cerradas.
- Los empty states describen ausencia real y nunca inyectan demo data.
- La navegación canónica es la cerrada por M03.3/APP_SHELL_SPEC, no listados obsoletos posteriores.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_11.md → .ai/APP_SHELL_SPEC.md → .ai/I18N_SPEC.md → apps/studio/src/help → locales/es/help.json → apps/studio/src/shell → packages/design-system`.
