# RESEARCH NOTES — ElectroCraft Eighth Review
Date: 2026-08-16.

Current APIs/versions must still be reverified at implementation.

# shadcn
Current official tooling supports multiple bases and current defaults may change.
ElectroCraft pins Radix explicitly because selected AI Elements are part of the Core AI Workbench and one primitive foundation is preferable.

# AI Elements
Use only the AI UI components actually required.
Do not install the entire registry.
Do not use node/graph UI pieces to compete with Rete.

# Puck
Keep.
Composition/Components/Fields/Outline/Preview/Slots reduce custom editor infrastructure.
Slots are current nesting direction; legacy DropZone is migration-only.

# Rete
Keep.
Visual programming plus ControlFlow/Dataflow/History fits ElectroCraft workflows better than adding a graph-only library plus custom workflow engine.

# PGlite
Keep for local Studio/Internal Data with multi-tab strategy.
Not universal production backend.

# Refine
Keep for Administration only.

# AI SDK
Keep as provider/tool/structured/streaming abstraction.
Gemini default through Google provider.
Direct Google SDK only for a demonstrated missing capability.

# Expo
Keep as primary React Native Android/iOS stack.

# Capacitor
Promoted to full Core target rather than fallback.
Its architecture is valid and distinct: generated Web runtime + native shell/plugins.

# LAMP
Use Slim 4/PSR-7 instead of custom router/middleware.
Use PDO/prepared statements and MySQL/MariaDB.
Use Slim-CSRF for browser mutation protection.

# WordPress
Use modern Block Theme/theme.json/templates/parts/patterns.
Generate dynamic/data behavior in Companion Plugin.
Use native CPT/tax/meta/options/users/caps/REST/Media/admin APIs before custom tables/blocks.

# Final principle
A target can have different capability mappings while retaining equal product/export status.
