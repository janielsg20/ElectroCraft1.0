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

## Reglas de continuidad
- Una sola microfase puede estar `ACTIVE`.
- `MEMORY.md` no guarda estado transitorio de ejecución, identificadores de CI, logs, hashes de cierre ni instrucciones de siguiente paso.
- `DONE` requiere evidencia real; errores unsupported deben permanecer visibles y fail-closed.

## UI foundation
- Studio usa shadcn/ui con base Radix explícita sobre el paquete unificado `radix-ui`; no se mezclan Base UI/Aria sin ADR.
- `packages/design-system` es el owner de tokens/primitives y Lucide se consume mediante un registry semántico tipado.
- Theme light/dark/system y densidad High Density son preferencias del Studio, no Project Objects del modelo canónico.
- El AppShell global usa 100dvh con scroll contenido en workspace; desktop reserva Sidebar 240px, laptop 64px y tablet/mobile trasladan navegación estructural a Sheet Radix.
- El editor visual conserva cuatro regiones estables: Contexto 288px redimensionable 240–380px, Canvas dominante, Inspector 320px redimensionable 280–440px y Statusbar informativo 26px. Laptop reduce herramientas secundarias primero y tablet/móvil trasladan Contexto/Inspector a superficies Sheet sin comprimir el desktop.
