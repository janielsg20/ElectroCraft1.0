# DESIGN SYSTEM — ElectroCraft Studio — Eighth Final

# Primitive stack

- React 19 baseline, reverified at F00.
- Tailwind CSS 4 baseline, reverified at F00.
- shadcn/ui source components.
- **Radix base pinned explicitly**.
- Lucide.
- i18next/react-i18next.
- selected AI Elements components for AI-native UI.

Initialization must not rely on the current shadcn default.

Use the current official equivalent of:
`shadcn init --base radix`.

# Why Radix now

The previous specification selected a different shadcn primitive base; the Eighth review pins Radix for one coherent Studio/AI Elements foundation.

The eighth review changes this because:
1. `Generar con IA` is a first-class workspace.
2. AI Elements avoids rebuilding streaming messages/tool states/plans/Markdown UI.
3. a single primitive base is safer than mixing AI Elements expectations with another shadcn base.

This is a deliberate product compatibility choice, not a claim that Radix is universally better.

# Do not mix bases

No Base UI or React Aria shadcn components inside the production Design System without ADR.

If a missing primitive requires another library:
first verify Radix/shadcn current APIs; then wrap the exception behind one ElectroCraft primitive.

# Direction

Professional No-Code builder:
- minimal clean;
- high density;
- dominant canvas/workspace;
- clear hierarchy;
- restrained borders;
- strong focus/selection;
- no ornamental glass effects by default.

# Core Studio primitives

Button
IconButton
Field/Input
Textarea
Number
Select/Combobox
Checkbox
RadioGroup
Switch
Slider
Tabs
Disclosure/Accordion
Tooltip
Popover
Menu/ContextMenu
Dialog
Sheet/Drawer
Toast
Resizable
Scroll Area
Command/Search
Sidebar

Use shadcn source components rather than recreating them.

# AI-native primitives

Use AI Elements only where it owns a standard AI pattern:
Conversation
Message/MessageResponse
PromptInput
Tool
Plan
CodeBlock if required.

ElectroCraft still owns:
Context Inspector, Artifact Picker, Validation, Draft Preview, Diff and Apply.

# Density

High Density means:
- compact grouping;
- 28–36px desktop visual control heights where appropriate;
- efficient whitespace;
- labels remain readable;
- touch hit targets remain accessible.

# Icons

Lucide IDs are semantic product IDs.
Every icon-only control requires label/tooltip.

# Help

Main H1:
icon + title + CircleHelp.

Complex technical option:
Info icon.

Do not put Info beside every simple field.

# Studio Appearance vs App Theme

Studio Appearance:
workspace/user only.

App Theme:
exported application.

No implicit coupling.

# UI implementation policy

Before editing UI:
1. load shadcn skill;
2. load relevant UI/UX/Layout/Accessibility skills;
3. load React best-practices skill after multi-component work;
4. consult current official component docs;
5. follow ElectroCraft layout blueprints.

# Performance

Heavy engines are lazy-loaded by workspace:
- Puck when Editor opens;
- Rete when Workflows opens;
- Refine admin modules when Administration opens;
- AI SDK UI client/AI Elements only when Generar con IA opens;
- chart/calendar engines only when used.
