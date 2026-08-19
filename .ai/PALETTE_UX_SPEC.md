# PALETTE UX SPEC — ElectroCraft

## Propósito

La Palette del Studio hace descubrible el catálogo profesional definido por `.ai/PALETTE_CATALOG_MATRIX.md` sin convertir cada nombre visible en un `ComponentDefinition` distinto ni crear un subsistema paralelo a Puck.

## Ownership

- Catálogo visible y semántica de búsqueda: ElectroCraft.
- Design primitives: shadcn/ui con base Radix + tokens ElectroCraft.
- Drag y composición visual: Puck detrás de `@electrocraft/editor-puck`.
- ComponentDefinitions reales: adapter propietario del Screen Composer; la Palette no los clona.
- Favoritos y Recientes: preferencias de workspace por `paletteItemId`.

## Ubicación

- `Construir > Editor > Componentes` dentro del panel Contexto.
- En móvil, dentro del Sheet inferior `Componentes`.
- La superficie mantiene Puck.Components como fuente de drag cuando existan componentes registrados.

## Jerarquía de UI

1. Título y explicación breve.
2. Search siempre visible arriba.
3. Ayuda corta de teclado.
4. Diagnóstico visible cuando una inserción queda bloqueada.
5. Favoritos y Recientes cuando contienen items.
6. Categorías del catálogo.
7. Puck.Components como superficie propietaria de drag.

## Categorías exactas

1. Layout
2. Basic
3. Content
4. Navigation
5. Dynamic Data
6. Forms
7. Filters
8. Social / Contact
9. Admin
10. Commerce Pack

## Item

Cada item muestra:

- icono Lucide registrado en el design system;
- nombre visible en español;
- descripción limitada a una línea;
- badge de implementación `CORE`, `PRESET`, `BLOCK`, `BINDING` o `ALIAS`;
- control independiente para Favorito.

El card completo actúa como alternativa click-to-insert. La acción no puede declarar éxito si el `componentRef` todavía no existe en la configuración Puck activa.

## Densidad y responsive

- Contexto desktop tiene 288px nominales y usa grid compacto de dos columnas cuando el ancho útil llega a 272px.
- Por debajo de ese umbral cae a una columna sin overflow horizontal.
- Tablet conserva la Palette dentro del Sheet de Contexto.
- Móvil usa el Sheet inferior de Componentes, search sticky y objetivos táctiles mayores.
- No se comprime el lienzo para exponer tooling secundario.

## Search

La búsqueda normaliza mayúsculas y diacríticos e indexa:

- nombre visible;
- descripción/función;
- categoría;
- implementation kind;
- keywords y sinónimos;
- referencias conceptuales familiares.

Casos contractuales: `posts`, `menu`, `login`, `JetEngine`, `social`, `commerce`.

El branding visible permanece ElectroCraft; referencias como JetEngine solo funcionan como términos conceptuales de búsqueda.

## Favoritos y Recientes

- Se persisten en `electrocraft.workspace.palette.v1`.
- Solo guardan `paletteItemId`.
- Recent mantiene hasta 8 IDs únicos en orden de uso.
- Una preferencia inválida o storage no disponible falla de forma segura a estado local vacío/in-memory.
- No se persisten ComponentDefinitions, props de engine ni nodos del proyecto dentro de preferencias.

## Inserción

1. El usuario elige un Palette item.
2. `resolvePaletteInsert` valida que tenga `componentRef` y que este exista en la configuración Puck activa.
3. Si existe, `@electrocraft/editor-puck` usa la API pública de dispatch para insertar y devuelve el foco al lienzo.
4. Si no existe, el flujo queda `blocked` y muestra diagnóstico.
5. Preset/Block/Binding sin mapping propietario todavía siguen siendo descubribles, pero no se convierten en runtime especial ni en éxito simulado.

Durante F03 la configuración estructural Puck todavía puede no contener ComponentDefinitions. Esa ausencia es un estado soportado y visible; F05 conserva ownership del mapping real.

## Diagnósticos

Los bloqueos muestran:

- `code`;
- `location`;
- `cause`;
- `action` sugerida.

Códigos actuales:

- `PALETTE_MAPPING_PENDING`;
- `PALETTE_COMPONENT_UNAVAILABLE`.

## Accesibilidad

- Search tiene label accesible.
- Tab recorre controles; ArrowDown desde search entra al primer item.
- Enter activa click-to-insert sobre el item enfocado.
- Escape devuelve el foco al canvas.
- Favorito usa `aria-pressed`.
- Los iconos decorativos usan `aria-hidden`.
- El diagnóstico usa una región de estado visible y textual.

## Anti-duplicación

La Palette usa IDs propios de catálogo y referencias hacia componentes canónicos. Múltiples items pueden apuntar al mismo `componentRef` porque son presets/aliases/bindings; eso no crea múltiples ComponentDefinitions.

Ejemplos:

- `Título H1–H6` y `Párrafo` -> `Text`.
- `Menú móvil` -> `Navigation` preset.
- `Repetidor` -> `Listing` preset.
- campos de formulario -> `FormField` aliases.
- acciones de comercio -> `Button` + acción/estado propietario posterior.

## Estados

- ready: catálogo navegable.
- empty: search sin coincidencias.
- blocked: mapping/componentRef no disponible.
- storage unavailable: preferencias continúan in-memory.
- unsupported: nunca se transforma silenciosamente en success.
