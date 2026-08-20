# SECTION HELP CATALOG ES — ElectroCraft

Fecha operativa: 2026-08-20.

Este catálogo documenta la ayuda contextual visible del Studio. La navegación canónica es la cerrada por M03.3 y `.ai/APP_SHELL_SPEC.md`; los listados antiguos que mencionen Taxonomías, Relaciones o Roles como destinos superiores no deben reintroducirse.

## Reglas
- Cada destino superior canónico tiene exactamente un `HelpDescriptor` en `studioHelpRegistry`.
- El copy visible pertenece a `locales/es/help.json`.
- `HelpTrigger` es la única composición contextual reutilizable: Tooltip + Popover en desktop y Sheet en móvil.
- El botón global `Ayuda` abre el Help Drawer buscable y permanece inmediatamente antes de Configuración.
- Los empty states reales enlazan `¿Qué puedo hacer aquí?` al descriptor de su superficie.
- La ayuda explica propósito, estado y relaciones; nunca inventa datos, registros o capacidades todavía no implementadas.
- Métricas de ayuda son locales y están desactivadas por defecto.

## Catálogo canónico
| Grupo | Destino visible | Route | Help ID |
|---|---|---|---|
| Construir | Editor | `/` | `help.section.editor` |
| Construir | Pantallas | `/screens` | `help.section.screens` |
| Construir | Componentes | `/components` | `help.section.components` |
| Construir | Plantillas | `/templates` | `help.section.templates` |
| Construir | Generar con IA | `/ai` | `help.section.ai-generate` |
| Datos | Registros | `/content` | `help.section.records` |
| Datos | Modelos | `/models` | `help.section.models` |
| Datos | Fuentes de datos | `/data-sources` | `help.section.data-sources` |
| Datos | Consultas | `/queries` | `help.section.queries` |
| Lógica | Acciones y workflows | `/workflows` | `help.section.workflows` |
| Lógica | Estado y variables | `/state` | `help.section.state` |
| Lógica | Formularios | `/forms` | `help.section.forms` |
| App | Navegación | `/navigation` | `help.section.navigation` |
| App | Usuarios y permisos | `/users` | `help.section.users` |
| App | Administración | `/admin` | `help.section.admin` |
| Recursos | Medios | `/media` | `help.section.media` |
| Recursos | Extensiones | `/extensions` | `help.section.extensions` |
| Apariencia | Temas | `/themes` | `help.section.themes` |
| Apariencia | Sistema de diseño | `/__design-system` | `help.section.design-system` |
| Apariencia | Tokens | `/tokens` | `help.section.tokens` |
| Publicar | Vista previa | `/preview` | `help.section.preview` |
| Publicar | Compatibilidad | `/compatibility` | `help.section.compatibility` |
| Publicar | Exportar | `/export` | `help.section.export` |
| Publicar | Desplegar | `/deploy` | `help.section.deploy` |

## Descriptores transversales
- `help.studio.shell` — AppShell, navegación, workspace y preferencias globales.
- `help.studio.appearance` — apariencia del editor, separada del Theme/ExportIR del proyecto.
- `help.studio.language` — infraestructura i18n español-primero.

## Búsqueda
El Help Drawer indexa título, resumen, explicación larga, ejemplo, keywords y grupo/sección. La búsqueda es local y no envía telemetría ni contenido a un servicio externo.

## Accesibilidad
- icon-only: `aria-label="Más información"`;
- acción de empty state: label visible `¿Qué puedo hacer aquí?`;
- `Esc` cierra Popover/Sheet y Radix devuelve el foco al trigger;
- búsqueda con label persistente `Buscar en la ayuda`;
- desktop mantiene Popover de 360px dentro del rango contractual 320–380px;
- móvil usa Sheet inferior y no comprime el contenido en un popover estrecho.
