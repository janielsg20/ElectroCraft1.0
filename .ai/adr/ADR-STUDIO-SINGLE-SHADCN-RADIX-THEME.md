# ADR — Studio single-theme on shadcn/ui + Radix

## Estado

Accepted — 2026-08-22.

## Contexto

El Studio había acumulado adapters de Aceternity/Magic, daisyUI, Headless UI, Ark/Base UI y HeroUI, además de presets y una galería de apariencias. Esa amplitud aumentaba dependencias, CSS, JavaScript y superficie de mantenimiento sin aportar capacidades funcionales al No-Code Builder. También penalizaba el arranque en conexiones lentas.

## Decisión

- El Studio usa una única foundation visual: componentes source-owned de shadcn/ui sobre `radix-ui`.
- Existe un único tema de producto, ElectroCraft, con dos modos de color: `light` y `dark`.
- Radix conserva ownership de interacción, overlays, portals, focus management y primitives del AppShell.
- Lucide permanece como librería única de iconos del Studio.
- Se eliminan adapters, registries y dependencias de otros frameworks UI del paquete `@electrocraft/design-system`.
- Se eliminan los presets integrados/personales y las galerías de temas del Studio.
- Apariencia persiste solo la preferencia `light | dark`; no existe un perfil visual multidimensional.
- `prefers-reduced-motion` se resuelve en CSS y no requiere listeners React.
- La preferencia persistida se aplica en `index.html` antes de hidratar React para evitar flash de tema y mejorar la percepción de carga con redes lentas.
- Los temas de las aplicaciones creadas por ElectroCraft (`ElectroCraftTheme/DesignSystem`) permanecen intactos y aislados del tema del Studio.

## Rendimiento

Esta decisión elimina CSS de HeroUI/daisyUI, runtimes headless alternativos, Motion dedicado a adapters, código lazy de galerías y estado React de previews/presets. El panel Apariencia queda en el bundle base como una superficie mínima basada en primitives ya necesarias por el AppShell.

## Consecuencias

Agregar un segundo framework UI, presets de apariencia o un segundo tema estructural del Studio requiere un ADR que demuestre necesidad funcional, impacto de bundle, accesibilidad, ownership de foco/portales y presupuesto de rendimiento.
