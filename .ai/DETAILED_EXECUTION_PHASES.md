# DETAILED EXECUTION PHASES — ElectroCraft Eighth Final

## F00 — Auditoría de producto, OSS y POCs
**Objetivo:** Congelar producto/ownership mediante POCs de editor, DB, query, workflow, Native, Gemini/AI Elements, Data Sources y paridad de exportación Capacitor/LAMP/WordPress.
**Dependencias:** START

- **M00.1 — Trazar alcance heredado al modelo ElectroCraft No-Code**
  - `.ai/microphases/M00_1.md`
- **M00.2 — Auditar responsabilidades OSS**
  - `.ai/microphases/M00_2.md`
- **M00.3 — POC Visual Editor con Puck Composition**
  - `.ai/microphases/M00_3.md`
- **M00.4 — POC Studio DB genérica**
  - `.ai/microphases/M00_4.md`
- **M00.5 — POC Query portable**
  - `.ai/microphases/M00_5.md`
- **M00.6 — POC Action Flow Rete**
  - `.ai/microphases/M00_6.md`
- **M00.7 — POC Native runtime**
  - `.ai/microphases/M00_7.md`
- **M00.8 — POC AI SDK + Gemini: structured output, tools, imágenes y gateway seguro**
  - `.ai/microphases/M00_8.md`
- **M00.9 — POC Data Sources: REST/OpenAPI, GraphQL y Gateway**
  - `.ai/microphases/M00_9.md`
- **M00.10 — POC de paridad de exportación: Capacitor, LAMP y WordPress**
  - `.ai/microphases/M00_10.md`
- **M00.11 — Cerrar ADR de arquitectura**
  - `.ai/microphases/M00_11.md`

## F01 — Monorepo, límites, documentación y CI
**Objetivo:** Crear monorepo, package boundaries, documentación, evidence y CI.
**Dependencias:** F00

- **M01.1 — Crear monorepo y paquetes propietarios**
  - `.ai/microphases/M01_1.md`
- **M01.2 — Configurar TypeScript y boundaries**
  - `.ai/microphases/M01_2.md`
- **M01.3 — Configurar lint, test y build**
  - `.ai/microphases/M01_3.md`
- **M01.4 — Crear Studio Vite/PWA bootstrap**
  - `.ai/microphases/M01_4.md`
- **M01.5 — Crear CI base**
  - `.ai/microphases/M01_5.md`
- **M01.6 — Documentar conventions**
  - `.ai/microphases/M01_6.md`

## F02 — Modelo canónico de App y ownership
**Objetivo:** Definir un modelo canónico de App/ExportIR neutral a engines y targets.
**Dependencias:** F01

- **M02.1 — Definir ElectroCraftProjectDefinition y ElectroCraftDocument**
  - `.ai/microphases/M02_1.md`
- **M02.2 — Definir Component/Layout/Style**
  - `.ai/microphases/M02_2.md`
- **M02.3 — Definir ownership de Data Sources, Data Models, Queries y Forms**
  - `.ai/microphases/M02_3.md`
- **M02.4 — Definir Action, State, Navigation y Permission contracts**
  - `.ai/microphases/M02_4.md`
- **M02.5 — Definir Theme, Blueprint, Registries y Capability ownership**
  - `.ai/microphases/M02_5.md`
- **M02.6 — Serializer y migrations de proyecto**
  - `.ai/microphases/M02_6.md`
- **M02.7 — Definir ElectroCraftExportIR**
  - `.ai/microphases/M02_7.md`
- **M02.8 — Clasificar ownership: Project Objects vs Registries vs Content Entities**
  - `.ai/microphases/M02_8.md`
- **M02.9 — Definir wrappers versionados para payloads de engines**
  - `.ai/microphases/M02_9.md`

## F03 — Design System, AppShell, español y ayuda
**Objetivo:** Construir Studio español, shadcn Radix, AppShell, i18n, ayuda y responsive.
**Dependencias:** F02

- **M03.1 — Integrar shadcn/ui Radix, Lucide y tokens Electro**
  - `.ai/microphases/M03_1.md`
- **M03.2 — Construir AppShell desktop**
  - `.ai/microphases/M03_2.md`
- **M03.3 — Construir Sidebar global**
  - `.ai/microphases/M03_3.md`
- **M03.4 — Construir Topbar y Settings Gear**
  - `.ai/microphases/M03_4.md`
- **M03.5 — Construir Context/Canvas/Inspector/Status**
  - `.ai/microphases/M03_5.md`
- **M03.6 — Adaptar laptop/tablet/mobile**
  - `.ai/microphases/M03_6.md`
- **M03.7 — Aplicar Progressive Disclosure y arquitectura de información**
  - `.ai/microphases/M03_7.md`
- **M03.8 — Diseñar Palette descubrible sin multiplicar componentes**
  - `.ai/microphases/M03_8.md`
- **M03.9 — Apariencia del Studio Editor completo**
  - `.ai/microphases/M03_9.md`
- **M03.10 — Infraestructura español-primero e i18n tipado**
  - `.ai/microphases/M03_10.md`
- **M03.11 — Sistema de ayuda contextual y explicación de todas las secciones**
  - `.ai/microphases/M03_11.md`
- **M03.12 — E2E AppShell**
  - `.ai/microphases/M03_12.md`

## F04 — Persistencia local, proyectos y revisiones
**Objetivo:** Implementar persistencia local multi-tab, incremental, recuperable y ciclo de proyectos.
**Dependencias:** F03

- **M04.1 — Crear schema físico estable por objetos y contenido**
  - `.ai/microphases/M04_1.md`
- **M04.2 — Inicializar PGlite Multi-Tab Worker y migrations**
  - `.ai/microphases/M04_2.md`
- **M04.3 — Persistencia incremental, autosave y recovery**
  - `.ai/microphases/M04_3.md`
- **M04.4 — Construir Project Home**
  - `.ai/microphases/M04_4.md`
- **M04.5 — New Project Wizard y project actions**
  - `.ai/microphases/M04_5.md`
- **M04.6 — Import/Backup/Restore**
  - `.ai/microphases/M04_6.md`
- **M04.7 — Workspace preferences**
  - `.ai/microphases/M04_7.md`
- **M04.8 — Construir Project Revision Checkpoints y Restore**
  - `.ai/microphases/M04_8.md`

## F05 — Screen Composer con Puck
**Objetivo:** Integrar Puck como único Screen Composer.
**Dependencias:** F04

- **M05.1 — Crear PuckAdapter y component mapping**
  - `.ai/microphases/M05_1.md`
- **M05.2 — Componer Components/Outline/Preview/Fields**
  - `.ai/microphases/M05_2.md`
- **M05.3 — Nested Slots, permissions y Puck data migration**
  - `.ai/microphases/M05_3.md`
- **M05.4 — Sincronizar Puck actions con ElectroCraftDocument**
  - `.ai/microphases/M05_4.md`
- **M05.5 — Usar Puck visual history**
  - `.ai/microphases/M05_5.md`
- **M05.6 — Text/RichText inline editing**
  - `.ai/microphases/M05_6.md`
- **M05.7 — Extensiones de palette y outline solo necesarias**
  - `.ai/microphases/M05_7.md`
- **M05.8 — Editor core E2E**
  - `.ai/microphases/M05_8.md`

## F06 — Layout, responsive y edición avanzada
**Objetivo:** Añadir semántica portable de layout/responsive y edición avanzada.
**Dependencias:** F05

- **M06.1 — ElectroCraftLayout/Style inspector**
  - `.ai/microphases/M06_1.md`
- **M06.2 — Responsive inheritance y reset**
  - `.ai/microphases/M06_2.md`
- **M06.3 — Platform overrides y diagnostics**
  - `.ai/microphases/M06_3.md`
- **M06.4 — Advanced canvas guides/snapping**
  - `.ai/microphases/M06_4.md`
- **M06.5 — Multi-select, Group/Ungroup y Resize mediante extensión fina de Puck**
  - `.ai/microphases/M06_5.md`
- **M06.6 — Breadcrumbs y context actions**
  - `.ai/microphases/M06_6.md`
- **M06.7 — Mobile/tablet editor tools**
  - `.ai/microphases/M06_7.md`
- **M06.8 — Advanced editor QA**
  - `.ai/microphases/M06_8.md`

## F07 — Pantallas, navegación y rutas
**Objetivo:** Implementar Screens, Navigation, Routes, params, deep links, guards y compiler boundaries.
**Dependencias:** F06

- **M07.1 — Modelo de Pantalla, Ruta y Navigation Graph**
  - `.ai/microphases/M07_1.md`
- **M07.2 — Pantallas: lista, árbol y propiedades**
  - `.ai/microphases/M07_2.md`
- **M07.3 — Editor visual orientado a Pantallas**
  - `.ai/microphases/M07_3.md`
- **M07.4 — Navigation Builder UX**
  - `.ai/microphases/M07_4.md`
- **M07.5 — Route params, deep links y navegación por acciones**
  - `.ai/microphases/M07_5.md`
- **M07.6 — Guards y navegación por autenticación/permisos**
  - `.ai/microphases/M07_6.md`
- **M07.7 — Boundaries de compilers de navegación multi-target**
  - `.ai/microphases/M07_7.md`
- **M07.8 — Navigation E2E y UX**
  - `.ai/microphases/M07_8.md`

## F08 — Fuentes de datos, modelos, registros y conectores
**Objetivo:** Implementar Data Sources, Gateway/Secrets, Internal Data, Models y Records.
**Dependencias:** F07

- **M08.1 — Fuentes de datos y ConnectorRegistry**
  - `.ai/microphases/M08_1.md`
- **M08.2 — Fuente interna ElectroCraft Data sobre PGlite**
  - `.ai/microphases/M08_2.md`
- **M08.3 — REST API Connector y OpenAPI import**
  - `.ai/microphases/M08_3.md`
- **M08.4 — GraphQL Connector**
  - `.ai/microphases/M08_4.md`
- **M08.5 — ConnectorGateway y SecretStore**
  - `.ai/microphases/M08_5.md`
- **M08.6 — Data Explorer y prueba de operaciones**
  - `.ai/microphases/M08_6.md`
- **M08.7 — Connector SDK boundary y optional database packs**
  - `.ai/microphases/M08_7.md`
- **M08.8 — Modelos de datos y Field Registry**
  - `.ai/microphases/M08_8.md`
- **M08.9 — Group, Repeater, Calculated y Conditional Fields**
  - `.ai/microphases/M08_9.md`
- **M08.10 — Taxonomías dentro de Modelos**
  - `.ai/microphases/M08_10.md`
- **M08.11 — Relaciones 1:1, 1:N y N:N**
  - `.ai/microphases/M08_11.md`
- **M08.12 — CRUD de Registros y validación**
  - `.ai/microphases/M08_12.md`
- **M08.13 — Índice tipado para búsqueda/filtros**
  - `.ai/microphases/M08_13.md`
- **M08.14 — Estados editoriales e historial de Registros**
  - `.ai/microphases/M08_14.md`
- **M08.15 — Configuración global, perfiles y almacenes internos**
  - `.ai/microphases/M08_15.md`
- **M08.16 — Integridad de datos y QA**
  - `.ai/microphases/M08_16.md`

## F09 — Consultas, bindings, listings y filtros
**Objetivo:** Implementar Query/Binding/Listing/Filter sobre Data Sources.
**Dependencias:** F08

- **M09.1 — ElectroCraftBinding y Set From Data**
  - `.ai/microphases/M09_1.md`
- **M09.2 — ElectroCraftQueryDefinition y RQB payload adapter**
  - `.ai/microphases/M09_2.md`
- **M09.3 — Query formatter fail-closed y field-path adapter**
  - `.ai/microphases/M09_3.md`
- **M09.4 — Relations/Taxonomy query semantics**
  - `.ai/microphases/M09_4.md`
- **M09.5 — Listing runtime para Query y Collection**
  - `.ai/microphases/M09_5.md`
- **M09.6 — Filter component único, facets y apply modes**
  - `.ai/microphases/M09_6.md`
- **M09.7 — URL state y Saved Queries**
  - `.ai/microphases/M09_7.md`
- **M09.8 — Integrar TanStack Query como runtime query cache**
  - `.ai/microphases/M09_8.md`
- **M09.9 — Añadir consultas multifuente y Merge/Union portable**
  - `.ai/microphases/M09_9.md`
- **M09.10 — Implementar facets, counts, chips y apply modes**
  - `.ai/microphases/M09_10.md`
- **M09.11 — Query/Binding E2E**
  - `.ai/microphases/M09_11.md`

## F10 — Medios y Rich Text
**Objetivo:** Implementar MediaBlobStore y Tiptap.
**Dependencias:** F09

- **M10.1 — Media metadata y OPFS adapter**
  - `.ai/microphases/M10_1.md`
- **M10.2 — Validation/dedupe/thumbnails**
  - `.ai/microphases/M10_2.md`
- **M10.3 — Media Library UX**
  - `.ai/microphases/M10_3.md`
- **M10.4 — Tiptap adapter**
  - `.ai/microphases/M10_4.md`
- **M10.5 — Tiptap payload + Static Renderer multi-target**
  - `.ai/microphases/M10_5.md`
- **M10.6 — Media/RichText E2E**
  - `.ai/microphases/M10_6.md`

## F11 — Estado, variables y entorno
**Objetivo:** Implementar StateDefinitions/Zustand y scopes.
**Dependencias:** F10

- **M11.1 — ElectroCraftStateDefinition**
  - `.ai/microphases/M11_1.md`
- **M11.2 — Zustand store adapter**
  - `.ai/microphases/M11_2.md`
- **M11.3 — Persistence adapters**
  - `.ai/microphases/M11_3.md`
- **M11.4 — State Bindings y Actions**
  - `.ai/microphases/M11_4.md`
- **M11.5 — Panel de Estado y variables + Debug**
  - `.ai/microphases/M11_5.md`
- **M11.6 — State E2E**
  - `.ai/microphases/M11_6.md`

## F12 — Usuarios, autenticación y permisos
**Objetivo:** Implementar Auth/Users/Roles/Permissions y simulación.
**Dependencias:** F11

- **M12.1 — ElectroCraftRole/Permission model**
  - `.ai/microphases/M12_1.md`
- **M12.2 — Permission evaluator**
  - `.ai/microphases/M12_2.md`
- **M12.3 — Refine AccessControl adapter**
  - `.ai/microphases/M12_3.md`
- **M12.4 — AuthProvider Port y local runtime**
  - `.ai/microphases/M12_4.md`
- **M12.5 — Refine Audit/Notification integration**
  - `.ai/microphases/M12_5.md`
- **M12.6 — Integrar usuarios locales y Profile Content sin duplicar Auth**
  - `.ai/microphases/M12_6.md`
- **M12.7 — Permission Simulator y tests**
  - `.ai/microphases/M12_7.md`

## F13 — Acciones, workflows y automatizaciones
**Objetivo:** Implementar ActionGraphs/Rete, providers y target compiler boundary.
**Dependencias:** F12

- **M13.1 — ElectroCraftActionGraph + Rete Studio adapter**
  - `.ai/microphases/M13_1.md`
- **M13.2 — Editor de Acciones y workflows con Rete + History**
  - `.ai/microphases/M13_2.md`
- **M13.3 — Rete ControlFlow/Dataflow runtime JS**
  - `.ai/microphases/M13_3.md`
- **M13.4 — Action node packs**
  - `.ai/microphases/M13_4.md`
- **M13.5 — HTTP/REST Provider Registry**
  - `.ai/microphases/M13_5.md`
- **M13.6 — Target compilers boundary**
  - `.ai/microphases/M13_6.md`
- **M13.7 — Añadir Domain Event Triggers y automatización**
  - `.ai/microphases/M13_7.md`
- **M13.8 — Definir Email y Webhook como providers opcionales**
  - `.ai/microphases/M13_8.md`
- **M13.9 — Acciones y workflows E2E**
  - `.ai/microphases/M13_9.md`

## F14 — Formularios
**Objetivo:** Implementar Forms visuales y runtime/validation contracts.
**Dependencias:** F13

- **M14.1 — Form Documents y Field aliases**
  - `.ai/microphases/M14_1.md`
- **M14.2 — RHF runtime y Zod compiler**
  - `.ai/microphases/M14_2.md`
- **M14.3 — Visual form composition**
  - `.ai/microphases/M14_3.md`
- **M14.4 — Conditional/Multi-step/Draft**
  - `.ai/microphases/M14_4.md`
- **M14.5 — Submit ActionGraph integration**
  - `.ai/microphases/M14_5.md`
- **M14.6 — Calculated Form Fields y Frontend Record Editing**
  - `.ai/microphases/M14_6.md`
- **M14.7 — Anti-bot opcional y acciones Email/Webhook**
  - `.ai/microphases/M14_7.md`
- **M14.8 — Forms E2E**
  - `.ai/microphases/M14_8.md`

## F15 — Administración visual y DataViews
**Objetivo:** Implementar Administración con Refine/TanStack y portable Admin Documents.
**Dependencias:** F14

- **M15.1 — AdminDataProviderAdapter + Refine bootstrap**
  - `.ai/microphases/M15_1.md`
- **M15.2 — Definiciones de pantallas de Administración y rutas**
  - `.ai/microphases/M15_2.md`
- **M15.3 — Refine useTable + TanStack DataView**
  - `.ai/microphases/M15_3.md`
- **M15.4 — Create/Edit/Detail with Refine RHF**
  - `.ai/microphases/M15_4.md`
- **M15.5 — Dashboard, Metric, Chart, Saved Views**
  - `.ai/microphases/M15_5.md`
- **M15.6 — Kanban/Calendar/Bulk actions**
  - `.ai/microphases/M15_6.md`
- **M15.7 — Composición visual de Administración**
  - `.ai/microphases/M15_7.md`
- **M15.8 — Quick Edit y Inline Mutation con Refine**
  - `.ai/microphases/M15_8.md`
- **M15.9 — Importación y exportación CSV de Records con Refine**
  - `.ai/microphases/M15_9.md`
- **M15.10 — Administración E2E**
  - `.ai/microphases/M15_10.md`

## F16 — Temas, plantillas y componentes reutilizables
**Objetivo:** Implementar Themes/Templates/Saved Blocks/Global Components.
**Dependencias:** F15

- **M16.1 — Project Design Tokens y themes**
  - `.ai/microphases/M16_1.md`
- **M16.2 — Template Manager**
  - `.ai/microphases/M16_2.md`
- **M16.3 — Display Conditions**
  - `.ai/microphases/M16_3.md`
- **M16.4 — Saved blocks y global components**
  - `.ai/microphases/M16_4.md`
- **M16.5 — Theme/template import/export**
  - `.ai/microphases/M16_5.md`
- **M16.6 — Theme/template QA**
  - `.ai/microphases/M16_6.md`

## F17 — Extensiones, Kits de App y plantillas de proyecto
**Objetivo:** Implementar Extensions/Connector packs/App Templates/Kits.
**Dependencias:** F16

- **M17.1 — Manifest e instalador de Plantillas de App**
  - `.ai/microphases/M17_1.md`
- **M17.2 — Resolver conflictos e instalación selectiva**
  - `.ai/microphases/M17_2.md`
- **M17.3 — Plantillas de App: comercio y operaciones**
  - `.ai/microphases/M17_3.md`
- **M17.4 — Plantillas de App: contenido y directorios**
  - `.ai/microphases/M17_4.md`
- **M17.5 — Plantillas de App: servicios y gestión**
  - `.ai/microphases/M17_5.md`
- **M17.6 — Plantillas de App: educación y comunidad**
  - `.ai/microphases/M17_6.md`
- **M17.7 — Crear Professional Capability Packs sin nuevos engines**
  - `.ai/microphases/M17_7.md`
- **M17.8 — Kit de App: Tema + Plantillas + estructura**
  - `.ai/microphases/M17_8.md`
- **M17.9 — ElectroCraftExtensionPackage: plugins/extensiones reutilizables y seguros**
  - `.ai/microphases/M17_9.md`
- **M17.10 — Plantillas de App y Extensiones QA**
  - `.ai/microphases/M17_10.md`

## F18 — Generar con IA — Gemini
**Objetivo:** Implementar Gemini con AI SDK + AI Elements + Draft/Preview/Diff/Apply.
**Dependencias:** F17

- **M18.1 — Contratos de generación y AIDraftWorkspace sobre Vercel AI SDK**
  - `.ai/microphases/M18_1.md`
- **M18.2 — Gemini con @ai-sdk/google y escape hatch nativo mínimo**
  - `.ai/microphases/M18_2.md`
- **M18.3 — AIGateway seguro, credenciales y configuración de IA**
  - `.ai/microphases/M18_3.md`
- **M18.4 — Pantalla Generar con IA y navegación en español**
  - `.ai/microphases/M18_4.md`
- **M18.5 — AIContextBuilder, privacidad y selección explícita de contexto**
  - `.ai/microphases/M18_5.md`
- **M18.6 — Structured generation workflow y validación canónica**
  - `.ai/microphases/M18_6.md`
- **M18.7 — AIToolRegistry sobre AI SDK tools, solo lectura y borradores**
  - `.ai/microphases/M18_7.md`
- **M18.8 — Generar pantallas, secciones, bloques, componentes, plantillas y temas**
  - `.ai/microphases/M18_8.md`
- **M18.9 — Generar modelos, consultas, formularios, workflows, Administración y dashboards**
  - `.ai/microphases/M18_9.md`
- **M18.10 — Generar apps completas, Kits de App y Extensiones/Plugins**
  - `.ai/microphases/M18_10.md`
- **M18.11 — Generar texto, datos de demostración e imágenes con Gemini**
  - `.ai/microphases/M18_11.md`
- **M18.12 — Vista previa, diff, Apply transaccional y Guardar como reutilizable**
  - `.ai/microphases/M18_12.md`
- **M18.13 — Historial, prompts reutilizables, límites, cancelación y privacidad**
  - `.ai/microphases/M18_13.md`
- **M18.14 — AI QA completo: Gemini, español, seguridad, responsive y artifacts**
  - `.ai/microphases/M18_14.md`

## F19 — Vista previa, Debug y runtime diagnostics
**Objetivo:** Implementar Preview/Debug usando runtimes reales.
**Dependencias:** F18

- **M19.1 — Vista previa del runtime de App Web**
  - `.ai/microphases/M19_1.md`
- **M19.2 — Administración runtime preview**
  - `.ai/microphases/M19_2.md`
- **M19.3 — Preview routing y 404**
  - `.ai/microphases/M19_3.md`
- **M19.4 — Debug Console**
  - `.ai/microphases/M19_4.md`
- **M19.5 — Query/Action/State traces**
  - `.ai/microphases/M19_5.md`
- **M19.6 — Integrar Permission Simulator existente en Preview**
  - `.ai/microphases/M19_6.md`
- **M19.7 — Preview E2E**
  - `.ai/microphases/M19_7.md`

## F20 — Compatibilidad, TargetRegistry y Export Center
**Objetivo:** Implementar Capability Analyzer, ExportTargetRegistry y Export Center para los nueve targets Core.
**Dependencias:** F19

- **M20.1 — Capability model y registry**
  - `.ai/microphases/M20_1.md`
- **M20.2 — Component/style capabilities**
  - `.ai/microphases/M20_2.md`
- **M20.3 — Binding/query/form/action capabilities**
  - `.ai/microphases/M20_3.md`
- **M20.4 — Fallback registry**
  - `.ai/microphases/M20_4.md`
- **M20.5 — Compatibility Analyzer**
  - `.ai/microphases/M20_5.md`
- **M20.6 — Compatibility Screen**
  - `.ai/microphases/M20_6.md`
- **M20.7 — Capability regression fixtures**
  - `.ai/microphases/M20_7.md`
- **M20.8 — ExportTargetRegistry y contrato de paridad de los nueve destinos**
  - `.ai/microphases/M20_8.md`
- **M20.9 — Export Center unificado con todos los destinos Core**
  - `.ai/microphases/M20_9.md`

## F21 — Runtime Web y exportación Local/React/Static/PWA
**Objetivo:** Construir Web runtime y exporters Local/React/Static/PWA con shared Export Contract.
**Dependencias:** F20

- **M21.1 — WebRuntimePort y renderer React DOM**
  - `.ai/microphases/M21_1.md`
- **M21.2 — Web Router compiler y navegación**
  - `.ai/microphases/M21_2.md`
- **M21.3 — Runtime de datos, estado, forms y actions Web**
  - `.ai/microphases/M21_3.md`
- **M21.4 — Web Runtime dependency pruning pre-export**
  - `.ai/microphases/M21_4.md`
- **M21.5 — ExportIR builder y validation**
  - `.ai/microphases/M21_5.md`
- **M21.6 — Local project package**
  - `.ai/microphases/M21_6.md`
- **M21.7 — React source exporter con dependency pruning**
  - `.ai/microphases/M21_7.md`
- **M21.8 — Static exporter**
  - `.ai/microphases/M21_8.md`
- **M21.9 — PWA exporter**
  - `.ai/microphases/M21_9.md`
- **M21.10 — Asset localization and generated docs**
  - `.ai/microphases/M21_10.md`
- **M21.11 — Generar Runtime Dependency Manifest y podar dependencias**
  - `.ai/microphases/M21_11.md`
- **M21.12 — Generar professionalStudio manifest portable**
  - `.ai/microphases/M21_12.md`
- **M21.13 — Web export build fixtures**
  - `.ai/microphases/M21_13.md`

## F22 — Runtime Native con Expo
**Objetivo:** Construir RN/Expo runtime, routing y local data.
**Dependencias:** F21

- **M22.1 — NativeRenderer adapter y tokens**
  - `.ai/microphases/M22_1.md`
- **M22.2 — Native core layout**
  - `.ai/microphases/M22_2.md`
- **M22.3 — Native core content**
  - `.ai/microphases/M22_3.md`
- **M22.4 — Native Listing/Filter/Form**
  - `.ai/microphases/M22_4.md`
- **M22.5 — Native admin components**
  - `.ai/microphases/M22_5.md`
- **M22.6 — Native accessibility/style QA**
  - `.ai/microphases/M22_6.md`
- **M22.7 — Expo project/runtime bootstrap**
  - `.ai/microphases/M22_7.md`
- **M22.8 — Expo Router stable Stack/JS Tabs compiler**
  - `.ai/microphases/M22_8.md`
- **M22.9 — Expo SQLite + Drizzle stable schema**
  - `.ai/microphases/M22_9.md`
- **M22.10 — Native data/query adapters**
  - `.ai/microphases/M22_10.md`
- **M22.11 — Native state/auth restore**
  - `.ai/microphases/M22_11.md`
- **M22.12 — Assets and route source generation**
  - `.ai/microphases/M22_12.md`
- **M22.13 — Integrar Refine Core en Admin Native**
  - `.ai/microphases/M22_13.md`
- **M22.14 — Aplicar política estable de Expo Router y version pinning**
  - `.ai/microphases/M22_14.md`
- **M22.15 — Native source smoke test**
  - `.ai/microphases/M22_15.md`

## F23 — Capacidades Native y exportación Android/iOS
**Objetivo:** Implementar device capabilities y Android/iOS exporters.
**Dependencias:** F22

- **M23.1 — Native permissions compiler**
  - `.ai/microphases/M23_1.md`
- **M23.2 — Files y Secure Storage**
  - `.ai/microphases/M23_2.md`
- **M23.3 — Location y Camera/Media**
  - `.ai/microphases/M23_3.md`
- **M23.4 — Notifications, Haptics y Share**
  - `.ai/microphases/M23_4.md`
- **M23.5 — Contacts, Calendar y Biometrics**
  - `.ai/microphases/M23_5.md`
- **M23.6 — Native preview/device workflow**
  - `.ai/microphases/M23_6.md`
- **M23.7 — Expo export profile**
  - `.ai/microphases/M23_7.md`
- **M23.8 — Android exporter y build**
  - `.ai/microphases/M23_8.md`
- **M23.9 — iOS exporter y build**
  - `.ai/microphases/M23_9.md`
- **M23.10 — Signing diagnostics**
  - `.ai/microphases/M23_10.md`
- **M23.11 — Centro de exportación móvil Android/iOS**
  - `.ai/microphases/M23_11.md`
- **M23.12 — Mobile export fixtures**
  - `.ai/microphases/M23_12.md`

## F24 — Exportación Capacitor
**Objetivo:** Implementar Capacitor como target Core completo sobre Web runtime + native shell/plugins.
**Dependencias:** F23

- **M24.1 — Descriptor del target Capacitor y configuración**
  - `.ai/microphases/M24_1.md`
- **M24.2 — Perfil Web Runtime para Capacitor**
  - `.ai/microphases/M24_2.md`
- **M24.3 — Generar proyecto Capacitor y sincronizar plataformas**
  - `.ai/microphases/M24_3.md`
- **M24.4 — Plugins, capacidades y permisos Capacitor**
  - `.ai/microphases/M24_4.md`
- **M24.5 — Navegación, auth, storage y deep links en Capacitor**
  - `.ai/microphases/M24_5.md`
- **M24.6 — Build, signing y artifact verification Capacitor**
  - `.ai/microphases/M24_6.md`
- **M24.7 — Capacitor E2E y paridad**
  - `.ai/microphases/M24_7.md`

## F25 — Exportación LAMP con Slim/PDO
**Objetivo:** Implementar LAMP Core mediante Slim 4/PSR-7/PDO/Slim-CSRF/MySQL-MariaDB.
**Dependencias:** F24

- **M25.1 — Descriptor LAMP y configuración del target**
  - `.ai/microphases/M25_1.md`
- **M25.2 — Runtime Slim 4, routing y middleware**
  - `.ai/microphases/M25_2.md`
- **M25.3 — MySQL/MariaDB schema, migrations y PDO repositories**
  - `.ai/microphases/M25_3.md`
- **M25.4 — Renderer LAMP de pantallas, componentes, temas y assets**
  - `.ai/microphases/M25_4.md`
- **M25.5 — Data Sources, Queries y Formularios en LAMP**
  - `.ai/microphases/M25_5.md`
- **M25.6 — State, Actions, Auth, Permissions y Administración LAMP**
  - `.ai/microphases/M25_6.md`
- **M25.7 — Installer, dependencias, migraciones y paquete desplegable LAMP**
  - `.ai/microphases/M25_7.md`
- **M25.8 — Seguridad, E2E y paridad LAMP**
  - `.ai/microphases/M25_8.md`

## F26 — Exportación WordPress Block Theme + Companion Plugin
**Objetivo:** Implementar WordPress Core como Block Theme + Companion Plugin sobre APIs nativas.
**Dependencias:** F25

- **M26.1 — Descriptor WordPress y configuración del target**
  - `.ai/microphases/M26_1.md`
- **M26.2 — Generar Block Theme, theme.json y tokens**
  - `.ai/microphases/M26_2.md`
- **M26.3 — Mapear Pantallas, Templates y Componentes a bloques/patrones**
  - `.ai/microphases/M26_3.md`
- **M26.4 — Estructura del Companion Plugin y lifecycle**
  - `.ai/microphases/M26_4.md`
- **M26.5 — Mapear Modelos, Registros, Taxonomías, Relaciones y opciones**
  - `.ai/microphases/M26_5.md`
- **M26.6 — Queries, Formularios, Acciones y Fuentes externas WordPress**
  - `.ai/microphases/M26_6.md`
- **M26.7 — Usuarios, permisos, Administración y Medios WordPress**
  - `.ai/microphases/M26_7.md`
- **M26.8 — Seguridad, activación, migración y desinstalación**
  - `.ai/microphases/M26_8.md`
- **M26.9 — wp-env, artifact verification y paridad WordPress**
  - `.ai/microphases/M26_9.md`

## F27 — Hardening, paridad de exportación y release
**Objetivo:** Cerrar seguridad, a11y, rendimiento, dependencias y paridad/evidencia de los nueve targets.
**Dependencias:** F26

- **M27.1 — Security hardening fail-closed**
  - `.ai/microphases/M27_1.md`
- **M27.2 — Accessibility hardening**
  - `.ai/microphases/M27_2.md`
- **M27.3 — Performance hardening**
  - `.ai/microphases/M27_3.md`
- **M27.4 — Offline/recovery hardening**
  - `.ai/microphases/M27_4.md`
- **M27.5 — Deployment Provider boundary**
  - `.ai/microphases/M27_5.md`
- **M27.6 — Future features document**
  - `.ai/microphases/M27_6.md`
- **M27.7 — Auditar APIs experimentales y fijar dependency baseline**
  - `.ai/microphases/M27_7.md`
- **M27.8 — Canonical E2E project**
  - `.ai/microphases/M27_8.md`
- **M27.9 — Studio/offline/editor QA**
  - `.ai/microphases/M27_9.md`
- **M27.10 — Paridad Proyecto local / React / Estático / PWA**
  - `.ai/microphases/M27_10.md`
- **M27.11 — Paridad Android / iOS con Expo**
  - `.ai/microphases/M27_11.md`
- **M27.12 — Paridad Capacitor / LAMP / WordPress**
  - `.ai/microphases/M27_12.md`
- **M27.13 — Large project/performance regression**
  - `.ai/microphases/M27_13.md`
- **M27.14 — Security/accessibility final audit**
  - `.ai/microphases/M27_14.md`
- **M27.15 — Fixture única de reservas para los nueve destinos de exportación**
  - `.ai/microphases/M27_15.md`
- **M27.16 — Cerrar Professional Capability Coverage Matrix**
  - `.ai/microphases/M27_16.md`
- **M27.17 — Documentation/release gate**
  - `.ai/microphases/M27_17.md`

