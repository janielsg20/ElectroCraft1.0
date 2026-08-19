# PALETTE SEARCH SYNONYM INDEX

Este documento registra el contrato visible de términos conceptuales que deben encontrar herramientas ElectroCraft sin copiar branding externo como nombre primario de UI.

| Query | Palette items prioritarios |
|---|---|
| `posts` | Tarjeta de artículo; Listado; Campo dinámico |
| `menu` | Navegación / Menú; Menú móvil; Menú de usuario |
| `login` | Iniciar sesión; Formulario |
| `JetEngine` | Campo dinámico; Imagen dinámica; Enlace dinámico; Listado; Repetidor; Filtro |
| `social` | Iconos sociales; Compartir; WhatsApp / Mensaje |
| `commerce` | Tarjeta de producto; Cuadrícula de productos; Precio; Añadir al carrito; Checkout |

## Reglas

- Search es case-insensitive y diacritic-insensitive.
- Nombre, descripción, categoría, implementation kind y keywords participan en el índice.
- Las referencias conceptuales familiares son términos de descubrimiento, no labels primarios del producto.
- El resultado siempre apunta a `paletteItemId`; el índice no crea ni clona `ComponentDefinitions`.
- Añadir un sinónimo exige prueba de búsqueda para evitar regresiones silenciosas.

## Fuente ejecutable

El índice ejecutable vive en `apps/studio/src/shell/palette-catalog.ts` como `paletteSearchSynonymIndex` y se valida en la suite M03.8.
