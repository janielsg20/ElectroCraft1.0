# DESIGN SYSTEM — ElectroCraft Studio — Single Theme Baseline

# Primitive stack

- React 19 baseline.
- Tailwind CSS 4 baseline.
- shadcn/ui source components.
- **Radix base pinned explicitly** through `radix-ui`.
- Lucide.
- i18next/react-i18next.
- selected AI Elements components for AI-native UI only.

Initialization must not rely on an implicit shadcn default. Use the current official equivalent of `shadcn init --base radix`.

# One Studio theme

ElectroCraft Studio has one visual language and one component foundation.

- Theme: `ElectroCraft`.
- Color modes: `light` and `dark` only.
- Base color family: neutral.
- One restrained primary accent.
- High-density layout remains the default.
- No Studio theme presets.
- No multi-framework appearance adapters.
- No decorative glass/gradient framework layers.

The Studio theme is a workspace preference. It is not the `ElectroCraftTheme/DesignSystem` authored for generated applications.

# Do not mix bases

Do not add Base UI, React Aria, Headless UI, Ark UI, HeroUI, daisyUI, Aceternity/Magic or another UI primitive framework to the production Studio without a superseding ADR.

If a primitive is missing, verify current Radix/shadcn APIs first, then wrap any proven exception behind one ElectroCraft primitive.

# Direction

Professional No-Code builder:

- minimal clean;
- high density;
- dominant canvas/workspace;
- clear hierarchy;
- restrained borders and shadows;
- strong focus/selection;
- system font stack for zero font-download dependency on first paint;
- motion short and functional only.

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
Skeleton
Loader

Use shadcn source components rather than recreating them.

# Loading UX

Loading is progressive and local, not a full-screen interruption.

- Render the Studio shell, navigation, topbar, theme and status surface first.
- Lazy-load heavy or secondary route modules.
- Use geometry-matched skeletons only while first-load content has no usable representation yet.
- Keep already rendered content visible during refreshes and add a compact loader instead of replacing the region.
- Use loaders for explicit actions such as open, save, create and deferred dialog preparation.
- Skeletons are `aria-hidden`; the loading region owns the accessible status announcement.
- Loaders expose meaningful status text and respect reduced-motion.
- Do not use image placeholders, blur-heavy overlays or gradient shimmer loops.
- Avoid layout shift: skeleton dimensions should approximate the final interface.

See `.ai/adr/ADR-STUDIO-PROGRESSIVE-LOADING.md`.

# AI-native primitives

Use AI Elements only where it owns a standard AI pattern:
Conversation
Message/MessageResponse
PromptInput
Tool
Plan
CodeBlock if required.

ElectroCraft still owns Context Inspector, Artifact Picker, Validation, Draft Preview, Diff and Apply.

# Density

High Density means compact grouping and efficient whitespace while labels, keyboard focus and touch targets remain accessible.

# Icons

Lucide IDs are semantic product IDs. Every icon-only control requires an accessible label and contextual tooltip where needed.

# Studio Appearance vs App Theme

Studio Appearance:
workspace/user only; `light | dark`; persisted before React hydration.

App Theme:
portable visual tokens/variants of the application being built/exported.

No implicit coupling.

# UI implementation policy

Before editing UI:

1. load shadcn skill;
2. load relevant UI/UX/Layout/Accessibility guidance;
3. after broad TSX edits, run React best-practices review;
4. follow ElectroCraft layout blueprints;
5. prefer existing Radix/shadcn primitives and semantic tokens.

# Performance

- Do not load alternate UI runtimes or theme CSS.
- Apply persisted color mode before React hydration to avoid theme flash.
- Prefer system fonts for first paint.
- Keep appearance state to a single `light | dark` value.
- Use CSS `prefers-reduced-motion` instead of React listeners for presentation-only motion.
- Heavy engines remain lazy-loaded by workspace: Puck, Rete, Refine admin modules, AI SDK/AI Elements, chart/calendar engines.
- Secondary UI such as project wizards and internal galleries loads on demand.
- Prefer `content-visibility`/containment for large offscreen collections when accessibility and focus remain correct.
