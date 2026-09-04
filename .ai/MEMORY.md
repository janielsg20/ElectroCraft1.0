# MEMORY — ElectroCraft

Solo contiene hechos estables y decisiones vigentes. Progreso y siguiente paso pertenecen a `STATE.md`, `TRACKING.md`, `HANDOFF.md` y `evidence/`.

## Producto

- ElectroCraft es un No-Code App Builder; CMS/Administración son capacidades subordinadas, no la raíz del producto.
- Screens y Navigation/Routes tienen ownership separado.
- Los nueve targets son Core: local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp y wordpress.
- Todos los targets comparten `TargetRegistry`, Capability Analyzer y Export Target Contract.

## Modelo y ownership

- Existe un único modelo canónico portable; internals de engines OSS nunca se persisten como proyecto canónico.
- `Puck` posee composición visual; ElectroCraft mapea `ElectroCraftDocument` y Slots sin crear un editor paralelo.
- `PGlite` + `Drizzle` poseen persistencia Studio/internal data; modelos lógicos no crean tablas por modelo.
- `React Query Builder` posee condición/formatting; ElectroCraft valida bindings/capabilities fail-closed.
- `Rete` posee graph/processing/history de workflows; `ElectroCraftActionGraph` es la definición persistida.
- `TanStack Query` posee async cache; `Refine` solo Administración; `RHF/Zod` Forms; `Tiptap` RichText; `Zustand` runtime state.
- Snapshots canónicos usan una única serialización JSON determinista y checksum portable; las migraciones de schema se encadenan mediante un registry explícito/fail-closed, no por rutas paralelas inline.
- `ElectroCraftExportIR` es generado, immutable, versionado y neutral a target; no es una segunda fuente persistida de verdad.
- Los nueve `ExportTargetId` viven fuera del IR en `TargetCompileContext`; cambiar de target no puede cambiar el checksum de la revisión congelada.
- ExportIR puede transportar Project Objects y manifests/refs portables permitidos, pero nunca registries runtime completos, caches/histories/prompts, internals de compiladores ni secret values.
- El ownership canónico se divide en exactamente tres categorías: Project Objects, Application Registries y Content Entities. Registries core/extension se versionan con la app y no se copian al proyecto; content entities viven en su storage y se consumen por refs/resolver/manifest.
- Un reusable component específico del proyecto sigue siendo `ElectroCraftDocument kind=reusable-component`; un ComponentDefinition core pertenece al registry de aplicación. Solo definitions `origin=user` pueden persistirse separadas y referenciarse desde el proyecto.
- Un payload OSS persistible usa el wrapper JSON portable `{ engine, schemaVersion, value }`; `domain` no importa tipos del engine y cada adapter owner valida/interpreta/migra su `value`.
- Los wrappers iniciales aprobados son React Query Builder rules y Tiptap rich-text JSON. RQB usa `@react-querybuilder/core@8.23.0`; el baseline Tiptap usa un grafo mínimo coherente `3.29.2` de core/html/Document/Paragraph/Text.
- Puck AppState/history, Rete NodeEditor/sockets/history, Zustand store instances y TanStack Query cache permanecen prohibidos como payload persistido; se reconstruyen desde definiciones ElectroCraft canónicas.
- Project Revisions son historial durable separado del Undo/history de engines. Cada restore es no destructivo: crea un checkpoint de seguridad y una nueva revisión actual; el historial previo permanece intacto.
- `project_object_versions` deduplica payloads por identidad de versión/checksum para que los manifests de revisión puedan referenciar objetos sin duplicar contenido.
- Group/Repeater son scopes anidados de `ElectroCraftDataField`, no widgets globales; Calculated usa operaciones registradas y Conditional un rule AST tipado sin `eval`.
- Advanced Fields se normalizan detrás del adapter interno/ConnectorRegistry y persisten únicamente en el JSONB genérico de `content_records`; no crean DDL ni tablas físicas por modelo/campo.
- Taxonomías son metadata canónica asociada a modelos/campos por refs; sus términos son Content Entities en `taxonomy_terms`, con jerarquía mediante `parentId`, y se operan detrás del adapter interno/ConnectorRegistry.

## AI

- AI SDK + `@ai-sdk/google` es la abstracción primaria; direct `@google/genai` solo para gaps estrechos y probados.
- Gemini genera/refina código para components/plugins/sections; output AI es Draft-only y Apply es explícito.
- Secrets se representan por `SecretRef`; valores secretos nunca llegan al cliente ni al proyecto canónico.

## Runtime/targets

- Native baseline usa Expo/React Native, Expo Router y Expo SQLite; no DOM/Puck/Table en runtime native.
- Capacitor es target híbrido propio, no fallback de Expo.
- LAMP usa Slim 4 + PSR-7 + Slim-CSRF + PDO/MySQL/MariaDB.
- WordPress usa Block Theme + Companion Plugin y APIs nativas antes de implementaciones custom.

## Tooling estable

- El package manager canónico del repositorio es `npm@10.9.2`; no cambiar a pnpm solo porque una microfase o documentación externa muestre comandos de ejemplo con pnpm.
- Los gates dedicados de microfases cerradas se archivan cuando dejan de aportar señal; `ElectroCraft Base CI` es el gate transversal por defecto y no debe duplicarse sin una necesidad específica.

## Reglas de continuidad

- Una sola microfase puede estar `ACTIVE`.
- `MEMORY.md` no guarda estado transitorio de ejecución, identificadores de CI, logs, hashes de cierre ni instrucciones de siguiente paso.
- `DONE` requiere evidencia real; errores unsupported deben permanecer visibles y fail-closed.

## UI foundation

- Studio usa una sola foundation visual: componentes source-owned de shadcn/ui con base Radix explícita sobre `radix-ui`; `ADR-STUDIO-SINGLE-SHADCN-RADIX-THEME.md` prohíbe adapters multi-framework, galerías de temas y presets de apariencia salvo ADR que lo sustituya.
- `packages/design-system` es el owner de tokens/primitives y Lucide se consume mediante un registry semántico tipado.
- El Studio tiene un único tema ElectroCraft con modos `light | dark`; esa preferencia es workspace-only y permanece aislada de los App Themes/Project Objects del modelo canónico.
- Workspace preferences viven en `workspace_preferences` mediante PGlite/Drizzle, comparten el mismo multi-tab Worker del project storage y no usan `localStorage`; saved layouts son Studio-only y no forman parte de ElectroCraftExportIR ni del backup canónico del proyecto.
- El Studio chrome sigue un baseline de consola administrativa neutral: superficies neutras, azul primario reservado para selección/foco/acción primaria, sin color-coding decorativo por módulo, gradients de chrome, glass blur ni glow rutinario.
- La densidad desktop canónica usa controles 28/32/36px, navegación y filas de menú/select de 32px; los targets táctiles móviles permanecen en al menos 44px.
- El AppShell global usa 100dvh con scroll contenido en workspace; desktop usa Sidebar neutral de 240px, laptop compacta 64px y tablet un rail global de 56px con navegación completa en Sheet Radix. Móvil elimina el rail lateral y prioriza Topbar compacta + navegación inferior.
- El Topbar global usa 52px y el Statusbar global 26px; la jerarquía se expresa principalmente mediante espaciado, tipografía y bordes de 1px.
- El editor visual conserva cuatro regiones estables: Contexto 288px redimensionable 240–380px, Canvas dominante, Inspector 320px redimensionable 280–440px y Statusbar informativo global de 26px.
- En laptop, el editor usa split cuando existe ancho útil >=1152px y un único overlay de herramienta secundaria entre 1024–1151px. Tablet usa Contexto/Inspector en Sheets sin comprimir el Canvas.
- En móvil, el dock inferior mide 58px y conserva exactamente `Componentes | Pantallas | Lienzo | Propiedades | Más`; Propiedades usa bottom Sheet y Más expone Outline/Capas en Sheet full-height. Pantallas reutiliza el registry canónico del Sidebar.
- `SheetContent` del design-system admite `left | right | bottom`; es la única primitive de drawer/Sheet del AppShell y conserva restore-focus Radix mediante triggers reales.
- Checkbox y RadioGroup del Studio son primitives Radix del design-system; no se usan controles nativos inconsistentes en superficies productivas cuando exista el primitive owner.
- La arquitectura de información del Studio clasifica opciones como `primary | contextual | advanced | diagnostic`; `advanced` usa Progressive Disclosure con `Collapsible` Radix del design-system y un diagnostic que protege estado no puede quedar oculto únicamente dentro de Advanced.
- Inspector mantiene propiedades principales bajo ownership de Puck; ElectroCraft solo compone la jerarquía y la presentación alrededor del owner.
- `/content` es la ruta canónica única del patrón List/Detail del Studio. Las superficies aún no funcionales usan empty states honestos y las rutas redundantes/desconocidas fallan cerradas en vez de simular éxito.
- La Palette usa `.ai/PALETTE_CATALOG_MATRIX.md` como fuente de descubrimiento y no deriva su catálogo directamente del ComponentRegistry activo de Puck.
- Las categorías estables de Palette son Layout, Basic, Content, Navigation, Dynamic Data, Forms, Filters, Social / Contact, Admin y Commerce Pack; aliases/presets/bindings pueden compartir un mismo `componentRef` sin crear ComponentDefinitions duplicados.
- Favoritos y Recientes de Palette son workspace preferences que guardan únicamente `paletteItemId`; no persisten ComponentDefinitions, props de engine ni Project Objects.
- Puck conserva ownership de drag/composition. El click-to-insert accesible cruza `@electrocraft/editor-puck` y solo despacha si el `componentRef` existe realmente; mappings pendientes permanecen visibles mediante diagnostics fail-closed.
