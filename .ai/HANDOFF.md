# HANDOFF — ElectroCraft

## Current
F03 / M03.1 — Inicializar shadcn/ui Radix, Lucide y tokens ElectroCraft — `ACTIVE`.

## Siguiente acción exacta
1. Mantener `packages/design-system` como owner del sistema visual; no crear un segundo UI kit dentro de `apps/studio`.
2. Inspeccionar `packages/design-system`, `apps/studio`, aliases/tsconfig/Vite y el CSS existente antes de inicializar shadcn.
3. Usar shadcn CLI v4 de forma no interactiva con base Radix (`init -d --base radix`) o reproducir exactamente su estructura cuando el CLI no pueda operar dentro del entorno del repo; no usar Base UI.
4. Mantener estilo product/dashboard compacto, tokens semánticos y CSS variables; no codificar colores fundacionales ad hoc.
5. Integrar Tailwind v4 y el `cn()` utility en el owner correcto, sin romper el bootstrap Vite/PWA existente.
6. Añadir solo primitives necesarias para M03.1 y las próximas piezas inmediatas del AppShell: Button, Tooltip, Separator, DropdownMenu, Sheet, ScrollArea y otros primitives mínimos justificados por el spec.
7. Crear un registry Lucide tipado; iconos consistentes y decorativos con tratamiento de accesibilidad correcto.
8. Definir tokens ElectroCraft para background/foreground/surface/border/muted/primary/destructive/ring, densidad, spacing, radius y estados; soportar light/dark/system.
9. Crear i18n key mínima y HelpDescriptor `help.studio.shell` antes de introducir copy visible nuevo.
10. Añadir una galería técnica accesible que pruebe primitives, estados, focus-visible, tema y densidad sin adelantar el layout completo de M03.2.
11. Añadir unit/contract/integration/browser tests y gate M03.1; ejecutar `npm run check` y validar visualmente en navegador antes del merge.
12. Validar M03.1 nuevamente en `main`, registrar artifact/digest y solo entonces activar M03.2.

## APIs/decisiones actuales
- shadcn CLI v4: inicialización no interactiva requiere `-d`; Radix se selecciona explícitamente con `--base radix`.
- shadcn actual usa el paquete unificado `radix-ui` para nuevos componentes Radix.
- Tailwind v4 usa tokens mediante `@theme inline`; los componentes deben consumir variables semánticas.
- La interfaz debe usar primitives shadcn/Radix antes que controles HTML nativos cuando exista primitive equivalente.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_1.md`.

F02 está cerrada con Gate GREEN. M03.1 es la única microfase activa.
