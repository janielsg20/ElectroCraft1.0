# TRACEABILITY MATRIX — ElectroCraft Eighth Final

| Capability | Owner | Implementation |
|---|---|---|
| Spanish/i18n | F03 | i18next/react-i18next |
| Help | F03 | HelpRegistry/CircleHelp |
| Studio primitives | F03 | shadcn/ui Radix |
| AI-native UI | F18 | selected AI Elements |
| Project persistence | F04 | PGlite/Drizzle Worker |
| Screen Composer | F05-F06 | Puck |
| Navigation/Routes | F07 | portable model + compilers |
| Data Sources | F08 | ConnectorRegistry |
| Internal Data | F08 | PGlite generic records |
| REST/OpenAPI | F08 | REST adapter |
| GraphQL | F08 | GraphQL adapter |
| Gateway/Secrets | F08 | ConnectorGateway/SecretRef |
| Models/Records/Relations | F08 | ElectroCraftDataSchema |
| Queries/Bindings/Filters | F09 | QueryDefinition/RQB/TanStack Query |
| Media/RichText | F10 | MediaBlobStore/Tiptap |
| State | F11 | StateDefinition/Zustand |
| Auth/Permissions | F12 | Auth/Policy contracts |
| Actions/Workflows | F13 | ActionGraph/Rete |
| Forms | F14 | Document/RHF/Zod + target validators |
| Administration | F15 | Refine/TanStack |
| Themes/Templates/Reusables | F16 | portable docs/tokens/registry |
| Extensions/App Templates | F17 | ExtensionPackage/installer |
| AI/Gemini | F18 | AI SDK/@ai-sdk-google |
| AI Draft/Apply | F18 | AIDraftWorkspace/AIApplyService |
| Preview/Debug | F19 | real runtimes/traces |
| Compatibility | F20 | Capability Analyzer |
| Target Registry/Export Center | F20 | shared Export Target Contract |
| Local package | F21 | package exporter |
| React Web | F21 | React DOM/source exporter |
| Static | F21 | static compiler |
| PWA | F21 | PWA profile |
| Native runtime | F22 | RN/Expo/Router/SQLite |
| Android | F23 | Expo Android exporter |
| iOS | F23 | Expo iOS exporter |
| Capacitor | F24 | Web runtime + Capacitor |
| LAMP | F25 | Slim 4/PSR-7/PDO/Slim-CSRF |
| WordPress | F26 | Block Theme + Companion Plugin |
| Final parity/security/a11y/perf | F27 | shared fixture/release gate |

All nine destinations are Core and governed by the same Export Target Contract.
