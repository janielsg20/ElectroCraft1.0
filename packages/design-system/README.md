# @electrocraft/design-system

Owner visual del Studio de ElectroCraft.

## Foundation M03.1

- shadcn-style source ownership sobre `radix-ui` unificado.
- Tailwind CSS v4 con tokens semánticos ElectroCraft y `@theme inline`.
- Lucide mediante IDs semánticos tipados, sin imports dinámicos por string.
- Apariencia versionada `light | dark | system` y densidad `compact | comfortable`.
- Primitives iniciales: Button, Badge, Separator, Tooltip, DropdownMenu, Sheet, ScrollArea y Skeleton.
- Focus, teclado y comportamiento de superficies flotantes permanecen en Radix; ElectroCraft añade composición, tokens e i18n.

## Reglas

1. No crear un segundo UI kit paralelo.
2. Preferir primitives shadcn/Radix existentes antes de crear wrappers nuevos.
3. `packages/design-system` no posee datos de dominio ni estado persistente del proyecto.
4. AI Elements compartirá la misma base Radix; mezclar otra base requiere ADR explícito.
5. La densidad compacta es el baseline del Studio.

La galería Development vive en `apps/studio/src/shell/DesignSystemGallery.tsx`; no es una ruta de producto final.
