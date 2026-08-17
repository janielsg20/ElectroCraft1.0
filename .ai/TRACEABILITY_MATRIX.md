# TRACEABILITY MATRIX — ElectroCraft Eighth Final

M00.1 convierte la trazabilidad de áreas en trazabilidad atómica por requisito. La fuente ejecutable es `experiments/m00-1-requirements/capability-ownership-matrix.json`.

| Requirement | Capability | Canonical owner | Phase | Target applicability |
|---|---|---|---|---|
| R001 | No-Code App Builder | `ElectroCraftProjectDefinition` | F02 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R002 | Spanish-first Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R003 | contextual Help for every main section | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R004 | responsive Studio | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R005 | local-first project editing | `ProjectRepository / local persistence` | F04 | studio |
| R006 | portable Screen/Document model | `ElectroCraftDocument + PuckAdapter` | F05-F06 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R007 | Puck Screen Composer | `ElectroCraftDocument + PuckAdapter` | F05-F06 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R008 | responsive/platform overrides | `ElectroCraftDocument + PuckAdapter` | F05-F06 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R009 | Components/Blocks/Templates/Themes | `ComponentRegistry / Templates / Themes` | F16 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R010 | portable Navigation/Routes | `NavigationDefinition / RouteDefinition` | F07 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R011 | first-class Data Sources | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R012 | Internal ElectroCraft Data | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R013 | REST/OpenAPI | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R014 | GraphQL | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R015 | ConnectorGateway/SecretRef | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R016 | Models/Fields/Relations/Taxonomies/Records | `DataSourceDefinition / ConnectorRegistry / ElectroCraftDataSchema` | F08 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R017 | Queries/Bindings/Listings/Filters | `QueryDefinition / BindingDefinition` | F09 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R018 | State/Variables | `StateDefinition` | F11 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R019 | Rete Actions/Workflows | `ActionGraph` | F13 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R020 | RHF/Zod Forms | `ElectroCraftDocument(kind=form) / FormDefinition` | F14 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R021 | Users/Auth/Roles/Permissions | `AuthDefinition / Role / PermissionPolicy` | F12 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R022 | Administration with Refine/TanStack | `ElectroCraftDocument(kind=admin-screen) / AdminResource` | F15 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R023 | Media/Tiptap | `MediaAsset / TiptapDocument` | F10 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R024 | Extensions/connector packs | `ExtensionPackage / AppTemplate` | F17 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R025 | App Templates/Kits | `ExtensionPackage / AppTemplate` | F17 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R026 | shadcn/ui Radix base pinned explicitly | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R027 | AI Elements for standard AI-native UI | `AIWorkbench UI` | F18 | studio |
| R028 | Lucide icons | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R029 | UI/UX/Layout/Accessibility skills required on UI phases | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R030 | React best-practices review after broad TSX edits | `StudioShell / DesignSystem / HelpRegistry` | F03 | studio |
| R031 | `Construir > Generar con IA` | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R032 | Gemini default provider | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R033 | Vercel AI SDK orchestration | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R034 | secure gateway/no client key | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R035 | structured output | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R036 | allowlisted tools | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R037 | selected/sanitized context | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R038 | generate Screens/Components/Templates/Themes/Navigation | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R039 | generate Models/Queries/Forms/Workflows/Admin | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R040 | generate Apps/Kits/Extensions | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R041 | generate text/demo data/images | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R042 | Draft/Preview/Diff/Validate/Apply | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R043 | no direct model mutation | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R044 | generated-code quarantine | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R045 | AI history/cancel/privacy/offline | `AIDraftWorkspace / AIProvider / AIApplyService` | F18 | studio |
| R046 | TargetRegistry contains all nine destinations | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R047 | Local project package | `LocalProjectExporter` | F21 | local-project |
| R048 | React Web | `ReactWebExporter` | F21 | react-web |
| R049 | Static Web | `StaticWebExporter` | F21 | static-web |
| R050 | PWA | `PwaExporter` | F21 | pwa |
| R051 | Android Expo | `ExpoAndroidExporter` | F23 | android-expo |
| R052 | iOS Expo | `ExpoIosExporter` | F23 | ios-expo |
| R053 | Capacitor | `CapacitorExporter` | F24 | capacitor |
| R054 | LAMP | `LampExporter` | F25 | lamp |
| R055 | WordPress | `WordPressExporter` | F26 | wordpress |
| R056 | one Export Target Contract | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R057 | one Export Center with no Optional section | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R058 | one Capability Analyzer over all targets | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R059 | no silent loss | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R060 | artifact evidence per target | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R061 | same canonical fixture tested across all applicable targets | `ExportTargetRegistry / CapabilityAnalyzer / ExportContract` | F20 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R062 | Slim 4 routing/middleware | `LampRuntimeCompiler` | F25 | lamp |
| R063 | PDO/MySQL/MariaDB data compiler | `LampRuntimeCompiler` | F25 | lamp |
| R064 | Slim-CSRF/forms/security | `LampRuntimeCompiler` | F25 | lamp |
| R065 | PHP session/auth/permission mapping | `LampRuntimeCompiler` | F25 | lamp |
| R066 | Action/Query/Route compilers | `LampRuntimeCompiler` | F25 | lamp |
| R067 | install/migrate/security fixture | `LampRuntimeCompiler` | F25 | lamp |
| R068 | Block Theme | `WordPressRuntimeCompiler` | F26 | wordpress |
| R069 | theme.json current supported format | `WordPressRuntimeCompiler` | F26 | wordpress |
| R070 | templates/parts/patterns/style variations where mapped | `WordPressRuntimeCompiler` | F26 | wordpress |
| R071 | Companion Plugin | `WordPressRuntimeCompiler` | F26 | wordpress |
| R072 | CPT/tax/meta/options/custom-table decision ladder | `WordPressRuntimeCompiler` | F26 | wordpress |
| R073 | WordPress users/roles/capabilities | `WordPressRuntimeCompiler` | F26 | wordpress |
| R074 | REST/HTTP APIs | `WordPressRuntimeCompiler` | F26 | wordpress |
| R075 | nonce/sanitize/validate/escape/security | `WordPressRuntimeCompiler` | F26 | wordpress |
| R076 | activation/migration/deactivation/uninstall | `WordPressRuntimeCompiler` | F26 | wordpress |
| R077 | wp-env or approved clean WordPress fixture | `WordPressRuntimeCompiler` | F26 | wordpress |
| R078 | WCAG 2.2 AA target | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R079 | secure imports/connectors/queries/uploads/AI/exports | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R080 | deterministic CI without mandatory AI network | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R081 | dependency pruning | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R082 | performance budgets | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R083 | no duplicate OSS-owned engines | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |
| R084 | no P0/P1 gap | `ReleaseGate / Security / A11y / Performance` | F27 | local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress |

## Invariantes

- 84/84 requisitos trazados.
- 9/9 targets Core con exporter owner explícito.
- Ningún target Optional/Secondary.
- Ningún requisito sin fase/owner/modelo mental.
