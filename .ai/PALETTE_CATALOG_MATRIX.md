# PALETTE CATALOG MATRIX — Nombres visibles en español

La Palette puede mostrar muchos elementos sin convertir cada uno en una clase runtime.

Implementation kinds:
- CORE
- PRESET
- BLOCK
- BINDING
- ALIAS
- ACTION
- PROVIDER

# Layout

| Visible | Internal mapping |
|---|---|
| Sección | PRESET Container semanticElement=section |
| Contenedor | CORE Container |
| Contenedor flexible | PRESET Container flex |
| Fila | PRESET Container row |
| Columna | PRESET Container column |
| Pila | PRESET Container stack |
| Cuadrícula | PRESET Container grid |
| Columnas | PRESET Container/grid |
| Envolver | PRESET Container wrap |
| Contenedor fijo/sticky | PRESET Container |
| Área desplazable | PRESET Container scrollMode |
| Espaciador | PRESET Container fixed/min size |
| Separador | CORE Divider |
| Pestañas | CORE Tabs |
| Acordeón | CORE Accordion |
| Modal | CORE Modal |
| Panel lateral | CORE Drawer |
| Off-canvas | PRESET Drawer |

# Básicos / Media

| Visible | Internal mapping |
|---|---|
| Texto | CORE Text |
| Título H1–H6 | PRESET Text semantic heading |
| Párrafo | PRESET Text |
| Texto enriquecido | CORE RichText |
| Imagen | CORE Image |
| Galería | CORE Gallery |
| Icono | CORE Icon |
| Botón | CORE Button |
| Enlace | CORE Link |
| Logo | PRESET Image |
| Vídeo | CORE Video |
| Audio | CORE Audio |
| SVG | CORE SVG |
| Forma | PRESET SVG/Container |
| Lista | CORE List |
| Tabla | CORE Table only when semantic table needed |
| Código | CORE CodeBlock |
| HTML/Embed | CORE Embed, Web capability |
| Iframe | CORE Embed, Web capability |
| Mapa | CORE provider-aware |
| Carrusel | CORE Carousel |
| Slider | PRESET Carousel |
| Etiqueta/Badge | PRESET Text |
| Progreso | CORE Progress |

# Navegación

| Visible | Mapping |
|---|---|
| Navegación / Menú | CORE Navigation |
| Menú móvil | PRESET Navigation + Drawer |
| Migas de pan | PRESET Navigation + route ancestry |
| Buscador del sitio | Filter Search + navigation action |
| Menú de usuario | BLOCK Navigation + CurrentUser |
| Iniciar sesión | Button/Link + Auth Action |
| Registrarse | Button/Link + Auth Action |
| Cerrar sesión | Button/Link + Auth Action |
| Paginación | CORE Pagination |

# Contenido / Bloques

| Visible | Mapping |
|---|---|
| Tarjeta | BLOCK |
| Tarjeta de artículo | BLOCK |
| Testimonio | BLOCK |
| Miembro del equipo | BLOCK |
| Preguntas frecuentes | BLOCK Accordion |
| Línea de tiempo | BLOCK |
| Contador | BLOCK |
| Métrica / KPI | BLOCK/Admin Metric |
| Tabla de precios | BLOCK |
| Lista de características | BLOCK |
| Índice de contenido | BLOCK from headings |
| Llamada a la acción | BLOCK |
| Popup | Modal BLOCK/template |
| Tarjeta de contacto | BLOCK |
| Horario de negocio | BLOCK + Binding |
| Dirección / Contacto | BLOCK |
| Archivo descargable | BLOCK + Media |

# Social / Contacto

| Visible | Mapping |
|---|---|
| Iconos sociales | BLOCK Icon + Link |
| Compartir | BLOCK + Share Action |
| Correo | Link preset |
| Teléfono | Link preset |
| WhatsApp/Mensaje | Link/deep-link preset |
| Formulario de contacto | Form Document block/reference |
| Ubicación | Map/Location binding |

No crear un social-network engine.

# Datos dinámicos

| Visible | Mapping |
|---|---|
| Campo dinámico | Text/Heading + Binding |
| Imagen dinámica | Image + Binding |
| Enlace dinámico | Link/Button + Binding |
| Autor/Usuario | Binding |
| Fecha | Binding |
| Taxonomía/Términos | Binding/List |
| Metadata | Binding |
| Campo calculado | Schema calculated + Binding |
| Resultado de consulta | Listing |
| Listado | CORE Listing |
| Repetidor | PRESET Listing collection-binding |
| Contenido relacionado | Listing + relation query |
| Relación | Binding/Listing/Query |
| Contenido condicional | display condition |
| Paginación | CORE Pagination |

# Formularios

CORE:
- Formulario
- Campo de formulario

Aliases Campo:
- Texto
- Número
- Correo
- Teléfono
- URL
- Área de texto
- Selección
- Radio
- Checkbox
- Interruptor
- Fecha
- Hora
- Archivo
- Imagen
- Grupo
- Repetidor
- Oculto cuando sea necesario

Other:
- Enviar -> Button submit behavior
- Estado del formulario -> Text binding/live region
- Anti-bot/CAPTCHA -> security/provider config
- Multi-paso -> Form metadata/containers

# Filtros

CORE:
- Filtro
- Paginación

Aliases:
- Buscar
- Selección
- Rango
- Checks
- Radio
- Fecha
- Taxonomía
- Ordenar

Applied chips:
small presentation block when enabled.

Load More:
Pagination mode.

Reset:
Button/Action.

# Administración

Semantic Core:
- Vista de datos
- Métrica
- Gráfico
- Kanban
- Calendario

Reuse:
- Navegación administrativa -> Navigation preset
- Formulario de registro -> Form preset/resource context
- Detalle -> Container/Bindings block
- Barra de filtros -> Filter block

Behavior:
Refine/TanStack/RHF.

# Comercio

No commerce engine aparte.

| Visible | Mapping |
|---|---|
| Tarjeta de producto | BLOCK |
| Cuadrícula de productos | Listing preset |
| Nombre | Text Binding |
| Precio | Text Binding |
| Precio anterior | Text Binding |
| Imagen | Image Binding |
| Galería | Gallery Binding |
| Variaciones | Form/State |
| Comprar | Button + Action |
| Añadir al carrito | Button + State/Action |
| Contador del carrito | Text/Badge preset + State |
| Inventario | Binding |
| Estado de stock | Text preset + Binding |
| Favoritos | Button + State/Action |
| Checkout | Form Document/Template |
| Resumen del pedido | BLOCK/List |
| Relacionados | Listing query |

# Reutilizables

## Bloque guardado
Composite subtree.

## Componente global
Versioned reusable definition.

## Extensión
ElectroCraftExtensionPackage.

## Componente con código personalizado
No se ejecuta automáticamente.
AI can generate source draft only; requires code-review/sandbox path.

# Search
Search indexes:
- visible Spanish name;
- synonyms;
- intent;
- category;
- familiar conceptual references.

Examples:
`posts` -> Listado / Campo dinámico.
`JetEngine` -> related Electro dynamic tools.
`login` -> Iniciar sesión / Form auth.
`social` -> Social / Contacto items.
`tienda` -> Comercio pack.

The visible UI remains ElectroCraft-branded and Spanish.
