# REQUIREMENTS — ElectroCraft Eighth Final

## Product

R001 No-Code App Builder.
R002 Spanish-first Studio.
R003 contextual Help for every main section.
R004 responsive Studio.
R005 local-first project editing.
R006 portable Screen/Document model.
R007 Puck Screen Composer.
R008 responsive/platform overrides.
R009 Components/Blocks/Templates/Themes.
R010 portable Navigation/Routes.
R011 first-class Data Sources.
R012 Internal ElectroCraft Data.
R013 REST/OpenAPI.
R014 GraphQL.
R015 ConnectorGateway/SecretRef.
R016 Models/Fields/Relations/Taxonomies/Records.
R017 Queries/Bindings/Listings/Filters.
R018 State/Variables.
R019 Rete Actions/Workflows.
R020 RHF/Zod Forms.
R021 Users/Auth/Roles/Permissions.
R022 Administration with Refine/TanStack.
R023 Media/Tiptap.
R024 Extensions/connector packs.
R025 App Templates/Kits.

## Studio UI / Skills

R026 shadcn/ui Radix base pinned explicitly; multi-framework appearance adapters (Aceternity/Magic, daisyUI, Headless UI, Ark/Base UI and HeroUI/NextUI) are allowed only under the design-system ownership contract and ADR.
R027 AI Elements for standard AI-native UI.
R028 Lucide icons.
R029 UI/UX/Layout/Accessibility skills required on UI phases.
R030 React best-practices review after broad TSX edits.

## AI

R031 `Construir > Generar con IA`.
R032 Gemini default provider.
R033 Vercel AI SDK orchestration.
R034 secure gateway/no client key.
R035 structured output.
R036 allowlisted tools.
R037 selected/sanitized context.
R038 generate Screens/Components/Templates/Themes/Navigation.
R039 generate Models/Queries/Forms/Workflows/Admin.
R040 generate Apps/Kits/Extensions.
R041 generate text/demo data/images.
R042 Draft/Preview/Diff/Validate/Apply.
R043 no direct model mutation.
R044 generated-code quarantine.
R045 AI history/cancel/privacy/offline.

## Export Core — equal status

R046 TargetRegistry contains all nine destinations.
R047 Local project package.
R048 React Web.
R049 Static Web.
R050 PWA.
R051 Android Expo.
R052 iOS Expo.
R053 Capacitor.
R054 LAMP.
R055 WordPress.
R056 one Export Target Contract.
R057 one Export Center with no Optional section.
R058 one Capability Analyzer over all targets.
R059 no silent loss.
R060 artifact evidence per target.
R061 same canonical fixture tested across all applicable targets.

## LAMP

R062 Slim 4 routing/middleware.
R063 PDO/MySQL/MariaDB data compiler.
R064 Slim-CSRF/forms/security.
R065 PHP session/auth/permission mapping.
R066 Action/Query/Route compilers.
R067 install/migrate/security fixture.

## WordPress

R068 Block Theme.
R069 theme.json current supported format.
R070 templates/parts/patterns/style variations where mapped.
R071 Companion Plugin.
R072 CPT/tax/meta/options/custom-table decision ladder.
R073 WordPress users/roles/capabilities.
R074 REST/HTTP APIs.
R075 nonce/sanitize/validate/escape/security.
R076 activation/migration/deactivation/uninstall.
R077 wp-env or approved clean WordPress fixture.

## Quality

R078 WCAG 2.2 AA target.
R079 secure imports/connectors/queries/uploads/AI/exports.
R080 deterministic CI without mandatory AI network.
R081 dependency pruning.
R082 performance budgets.
R083 no duplicate OSS-owned engines.
R084 no P0/P1 gap.

## Nombres visibles exactos de exportación

- Proyecto local
- React Web
- Sitio estático
- PWA
- Android
- iOS
- Capacitor
- LAMP
- WordPress

Ninguno se muestra como destino secundario.

## Ownership gate — M00.1

La trazabilidad atómica de R001–R084 vive en `TRACEABILITY_MATRIX.md` y su fixture ejecutable en `experiments/m00-1-requirements/capability-ownership-matrix.json`.

Reglas congeladas por M00.1:

- toda capacidad tiene un owner canónico y una fase;
- CMS se subordina a Datos/Pantallas/Administración según semántica;
- Navegación/Rutas no se incrusta dentro del árbol de Pantallas;
- los nueve destinos de exportación son Core y de igual estatus;
- diferencias target-specific se resuelven mediante capability/adaptation/compiler, nunca duplicando el modelo canónico.
