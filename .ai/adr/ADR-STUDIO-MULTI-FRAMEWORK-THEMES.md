# ADR — Studio multi-framework appearance themes

## Estado

Accepted — 2026-08-22.

## Contexto

El Studio necesita temas aplicables que representen lenguajes visuales de Aceternity UI / Magic UI, daisyUI, Headless UI, Ark UI / Base UI y NextUI. NextUI se consume bajo su nombre y paquetes vigentes, HeroUI. El contrato anterior fijaba shadcn/ui sobre Radix y prohibía mezclar bases sin ADR.

## Decisión

- shadcn/ui + `radix-ui` continúa como foundation y owner de AppShell, Dialog, Sheet, Menu, Tabs, Select, Tooltip y restauración de foco.
- `@electrocraft/design-system` es el único owner de adapters multi-framework.
- Aceternity UI y Magic UI se integran como source-owned registry components; no se introduce un runtime paralelo.
- daisyUI se limita a estilos component-class scoped y previews de tema.
- Headless UI, Ark UI, Base UI y HeroUI se limitan a controles/previews de selección y adapters visuales explícitos.
- Ningún feature package, modelo canónico, runtime o exporter puede importar estos frameworks directamente.
- Los temas son preferencias de workspace; nunca Project Objects ni parte de `ElectroCraftExportIR`.
- Cada preset declara `framework`, descripción visible y perfil completo versionable.
- Portales globales, navegación, overlays y componentes destructivos permanecen bajo Radix.
- Motion debe respetar `prefers-reduced-motion`; no se permiten loops decorativos infinitos.

## Dependencias aprobadas

- `motion` para adapters Aceternity/Magic.
- `daisyui` como plugin Tailwind.
- `@headlessui/react`.
- `@ark-ui/react`.
- `@base-ui/react`.
- `@heroui/react` + `@heroui/styles` (nombre vigente de NextUI).

## Consecuencias

El bundle del panel Apariencia aumenta. Los adapters deben mantenerse tree-shakeable y no migran el AppShell fuera de Radix. Cualquier ampliación de ownership exige otro ADR y pruebas de foco, teclado, portales, reduced-motion y aislamiento del modelo canónico.
