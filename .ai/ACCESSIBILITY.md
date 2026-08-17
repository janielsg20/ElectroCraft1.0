# ACCESSIBILITY — ElectroCraft Eighth Final

Target:
WCAG 2.2 AA for Studio/Web and equivalent target semantics.

# Studio

shadcn/ui Radix provides primitive interaction foundations.
ElectroCraft must still test keyboard/focus/labels/contrast/touch/reduced-motion.

# Help
CircleHelp keyboard/focus.
Critical instructions not tooltip-only.

# Screen Composer
click-to-insert/reorder/menu alternatives supplement DnD.

# Navigation
tree reordering has Move up/down keyboard action.

# Rete
node management must expose keyboard/list alternatives where feasible.

# Kanban
`Mover a…` mandatory alternative.

# AI
AI Elements messages/tool states require accessible labels.
Announce major states only: Generando/Borrador listo/Error/Aplicado.
Cancel accessible.
Apply disabled reason discoverable.

# Export Center
all nine targets keyboard reachable.
status uses icon + text.
progress uses polite announcements.
toolchain/blocker detail accessible.

# Generated targets

React/PWA:
semantic HTML/focus/errors.

Expo:
RN accessibilityRole/label/hint/state and font scaling.

Capacitor:
Web accessibility remains required inside native shell.

LAMP:
semantic server-rendered HTML, label/error association, focus after validation.

WordPress:
generated blocks/forms/admin UI follow WordPress accessibility patterns and semantic output.

# Spanish
long labels included in width/zoom tests.
