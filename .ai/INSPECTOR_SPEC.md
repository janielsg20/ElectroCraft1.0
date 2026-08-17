# INSPECTOR SPEC — ElectroCraft

Tab order:
1. Contenido
2. Diseño
3. Estilo
4. Responsive
5. Datos
6. Acciones
7. Accesibilidad
8. Avanzado

# Contenido
Puck Fields / ElectroCraft custom field wrappers.

# Diseño
layout, size, min/max, flex/grid, align, gap, order, position, overflow.

# Estilo
typography, color, background, border, radius, shadow, opacity, states, motion.

# Responsive
breakpoint/platform inheritance and overrides.

# Datos
`Conectar datos`.
Sources:
Query, record, relation, State, route params, current user, Form value, Action output, media, safe environment.

Data Source selection occurs indirectly through Query/operation when appropriate.

# Acciones
events:
Al pulsar, Al enviar, Al cambiar, Al cargar, etc.
reference/create ActionGraph.

# Accesibilidad
role, label, alt, heading level, focus, reduced motion implications.

# Avanzado
stable IDs, safe attrs, Web class/id when target allows, diagnostics, conditions.
No arbitrary JS.

# Field anatomy
Label + control + optional binding/token + inheritance/scope + optional Info + reset + validation.
