# REDUNDANCY AUDIT — ElectroCraft Eighth Final

# Single engine owners

Studio primitives -> shadcn Radix.
AI-native streaming UI -> selected AI Elements.
i18n -> i18next.
Visual authoring -> Puck.
Studio DB -> PGlite/Drizzle.
Async cache -> TanStack Query.
Admin CRUD -> Refine.
Tables -> TanStack Table.
React forms -> RHF/Zod.
Condition editor -> RQB.
Workflow graph/history/JS flow -> Rete.
RichText -> Tiptap.
JS state -> Zustand.
AI orchestration -> AI SDK.
Native -> Expo/RN.
Hybrid -> Capacitor.
PHP HTTP -> Slim/PSR-7.
PHP DB -> PDO.
WordPress platform behavior -> native WP APIs.

# Duplication deliberately removed

- no second Screen editor;
- no target-specific canonical Screen tree;
- no separate Form tree;
- no CMS-centered project model;
- no custom query cache;
- no custom workflow canvas;
- no generic AI provider engine parallel to AI SDK;
- no custom AI streaming message/tool UI parallel to AI Elements;
- no proprietary PHP router/middleware;
- no custom WordPress CMS/role/media engine;
- no custom block for every ElectroCraft component;
- no optional/export-secondary pipeline.

# Shared export logic vs target-specific logic

Shared:
ExportIR, TargetRegistry, Capability Analyzer, config host, dependency manifest contract, progress/result UX, artifact evidence.

Specific:
React DOM, Expo, Capacitor, Slim/PHP, WordPress compilers.

This is not phase duplication because these outputs require different runtimes/toolchains.

# Similar phases intentionally distinct

F21 Web outputs:
shared Web runtime/compiler family.

F22/F23:
Native runtime then platform export/capabilities.

F24:
Capacitor uses Web runtime but native shell/plugins/toolchain.

F25:
LAMP uses PHP/Slim/PDO.

F26:
WordPress uses Block Theme/plugin/native APIs.

F27:
verifies parity; does not reimplement exporters.

# New subsystem rule

Before adding:
prove no Core/Preset/Block/Binding/Adapter/existing OSS/target compiler can own the need.
ADR required otherwise.
