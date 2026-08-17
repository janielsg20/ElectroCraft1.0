# UI / UX / LAYOUT RULES — ElectroCraft Eighth Final

Before Studio UI implementation:

1. load shadcn skill;
2. verify current official shadcn **Radix-base** docs;
3. use relevant UI/UX/Layout/Accessibility skills;
4. read DESIGN_SYSTEM;
5. read APP_SHELL_SPEC;
6. read SCREEN_BY_SCREEN_SPEC;
7. read SECTION_HELP_CATALOG_ES;
8. after broad TSX edits, run React best-practices review.

# Hierarchy

App/Workspace -> Screen/Resource -> Section -> Group -> Control.

# Layout patterns

Visual Composer:
Context 288 / Main flex / Inspector 320.

List + Detail:
280–320 / flex / optional contextual inspector.

Data Management:
toolbar + DataView/list.

Navigation:
tree 300 / structure flex / inspector 320.

Workflow:
palette/list 280 / Rete flex / inspector 320.

AI:
Context 288 / AI Workbench flex / Inspector 320.

Export:
targets 240–260 / config flex / compatibility-result 320.

# Progressive Disclosure

Show:
primary task -> contextual settings -> Advanced -> Debug/technical details.

# Avoid

- card around every field;
- tiny gray text;
- duplicate toolbar;
- permanent advanced controls;
- browser-native-looking final controls;
- Info icons on trivial fields;
- mixing primitive bases;
- desktop squeezed into mobile.

# Mobile

Recompose:
selection -> task -> configuration -> result.

# Empty state

Explain:
what this section does;
why empty;
primary next action;
help.

# Error

Spanish human message first.
Technical details collapsible.

# Export UX

All nine targets use the same status/action language.
No target is hidden in `Más` because of implementation family.
