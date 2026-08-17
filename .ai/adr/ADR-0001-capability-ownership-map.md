# M00.1 — Matriz atómica de capacidades y ownership

Esta matriz congela la traducción del alcance heredado al modelo mental canónico de ElectroCraft.

## Reglas de lectura

- CMS no es la raíz: Modelos, Registros, Relaciones y Taxonomías pertenecen a **Datos**.
- Páginas heredadas se expresan como **Pantallas**; Navegación/Rutas tiene owner independiente.
- Los nueve targets son **Core** y de igual estatus.
- Las diferencias de plataforma viven en capabilities/adapters/compilers; no crean árboles canónicos paralelos.
- OSS posee su responsabilidad nativa; ElectroCraft añade mapping, portabilidad, UX y semántica target.

## Targets Core

- `local-project`
- `react-web`
- `static-web`
- `pwa`
- `android-expo`
- `ios-expo`
- `capacitor`
- `lamp`
- `wordpress`

## Matriz

| Req | Capacidad | Modelo mental | Owner canónico | Fase | Aplicabilidad |
|---|---|---|---|---|---|
| R001 | No-Code App Builder | App | `ElectroCraftProjectDefinition` | F02 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R002 | Spanish-first Studio | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R003 | contextual Help for every main section | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R004 | responsive Studio | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R005 | local-first project editing | App | `ProjectRepository / local persistence` | F04 | studio |
| R006 | portable Screen/Document model | Pantallas y Componentes | `ElectroCraftDocument + PuckAdapter` | F05-F06 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R007 | Puck Screen Composer | Pantallas y Componentes | `ElectroCraftDocument + PuckAdapter` | F05-F06 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R008 | responsive/platform overrides | Pantallas y Componentes | `ElectroCraftDocument + PuckAdapter` | F05-F06 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R009 | Components/Blocks/Templates/Themes | Componentes y Reutilizables | `ComponentRegistry / Templates / Themes` | F16 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R010 | portable Navigation/Routes | Navegación | `NavigationDefinition / RouteDefinition` | F07 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R011 | first-class Data Sources | Fuentes de datos y Datos | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R012 | Internal ElectroCraft Data | Fuentes de datos y Datos | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R013 | REST/OpenAPI | Fuentes de datos y Datos | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R014 | GraphQL | Fuentes de datos y Datos | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R015 | ConnectorGateway/SecretRef | Fuentes de datos y Datos | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R016 | Models/Fields/Relations/Taxonomies/Records | Fuentes de datos y Datos | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R017 | Queries/Bindings/Listings/Filters | Consultas | `QueryDefinition / BindingDefinition` | F09 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R018 | State/Variables | Estado y variables | `StateDefinition` | F11 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R019 | Rete Actions/Workflows | Acciones y workflows | `ActionGraph` | F13 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R020 | RHF/Zod Forms | Formularios | `ElectroCraftDocument(kind=form) / FormDefinition` | F14 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R021 | Users/Auth/Roles/Permissions | Usuarios y permisos | `AuthDefinition / Role / PermissionPolicy` | F12 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R022 | Administration with Refine/TanStack | Administración | `ElectroCraftDocument(kind=admin-screen) / AdminResource` | F15 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R023 | Media/Tiptap | Medios y Rich Text | `MediaAsset / TiptapDocument` | F10 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R024 | Extensions/connector packs | Extensiones | `ExtensionPackage / AppTemplate` | F17 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R025 | App Templates/Kits | Extensiones | `ExtensionPackage / AppTemplate` | F17 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R026 | shadcn/ui Radix base pinned explicitly | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R027 | AI Elements for standard AI-native UI | Generar con IA | `AIWorkbench UI` | F18 | studio |
| R028 | Lucide icons | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R029 | UI/UX/Layout/Accessibility skills required on UI phases | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R030 | React best-practices review after broad TSX edits | Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R031 | `Construir > Generar con IA` | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R032 | Gemini default provider | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R033 | Vercel AI SDK orchestration | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R034 | secure gateway/no client key | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R035 | structured output | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R036 | allowlisted tools | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R037 | selected/sanitized context | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R038 | generate Screens/Components/Templates/Themes/Navigation | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R039 | generate Models/Queries/Forms/Workflows/Admin | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R040 | generate Apps/Kits/Extensions | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R041 | generate text/demo data/images | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R042 | Draft/Preview/Diff/Validate/Apply | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R043 | no direct model mutation | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R044 | generated-code quarantine | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R045 | AI history/cancel/privacy/offline | Borradores de IA | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R046 | TargetRegistry contains all nine destinations | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R047 | Local project package | Exportación | `LocalProjectExporter` | F21 | local-project |
| R048 | React Web | Exportación | `ReactWebExporter` | F21 | react-web |
| R049 | Static Web | Exportación | `StaticWebExporter` | F21 | static-web |
| R050 | PWA | Exportación | `PwaExporter` | F21 | pwa |
| R051 | Android Expo | Exportación | `ExpoAndroidExporter` | F23 | android-expo |
| R052 | iOS Expo | Exportación | `ExpoIosExporter` | F23 | ios-expo |
| R053 | Capacitor | Exportación | `CapacitorExporter` | F24 | capacitor |
| R054 | LAMP | Exportación | `LampExporter` | F25 | lamp |
| R055 | WordPress | Exportación | `WordPressExporter` | F26 | wordpress |
| R056 | one Export Target Contract | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R057 | one Export Center with no Optional section | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R058 | one Capability Analyzer over all targets | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R059 | no silent loss | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R060 | artifact evidence per target | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R061 | same canonical fixture tested across all applicable targets | Exportación | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R062 | Slim 4 routing/middleware | Exportación LAMP | `LampRuntimeCompiler` | F25 | lamp |
| R063 | PDO/MySQL/MariaDB data compiler | Exportación LAMP | `LampRuntimeCompiler` | F25 | lamp |
| R064 | Slim-CSRF/forms/security | Exportación LAMP | `LampRuntimeCompiler` | F25 | lamp |
| R065 | PHP session/auth/permission mapping | Exportación LAMP | `LampRuntimeCompiler` | F25 | lamp |
| R066 | Action/Query/Route compilers | Exportación LAMP | `LampRuntimeCompiler` | F25 | lamp |
| R067 | install/migrate/security fixture | Exportación LAMP | `LampRuntimeCompiler` | F25 | lamp |
| R068 | Block Theme | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R069 | theme.json current supported format | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R070 | templates/parts/patterns/style variations where mapped | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R071 | Companion Plugin | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R072 | CPT/tax/meta/options/custom-table decision ladder | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R073 | WordPress users/roles/capabilities | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R074 | REST/HTTP APIs | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R075 | nonce/sanitize/validate/escape/security | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R076 | activation/migration/deactivation/uninstall | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R077 | wp-env or approved clean WordPress fixture | Exportación WordPress | `WordPressRuntimeCompiler` | F26 | wordpress |
| R078 | WCAG 2.2 AA target | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R079 | secure imports/connectors/queries/uploads/AI/exports | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R080 | deterministic CI without mandatory AI network | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R081 | dependency pruning | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R082 | performance budgets | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R083 | no duplicate OSS-owned engines | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R084 | no P0/P1 gap | Calidad y Release | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |

## Cierre de M00.1

- 84/84 requisitos poseen owner canónico.
- 9/9 destinos de exportación están modelados como Core.
- No existe clasificación Optional/Secondary Target.
- Las capacidades CMS quedan subordinadas al modelo No-Code App Builder.
- El fixture de `experiments/m00-1-requirements` valida estas invariantes automáticamente.
