# AUXILIARY UI ENGINE MATRIX — ElectroCraft

# Icons
Lucide.

# Charts
Canonical ChartSpec.
Web -> Apache ECharts.
Native -> Victory Native when compatible/used.

# Calendar
Canonical CalendarViewSpec.
Web -> FullCalendar Standard.
Native -> react-native-calendars.

No FullCalendar Premium Core dependency.

# Kanban
Canonical columns/status update.
Web DnD -> dnd-kit.
Universal fallback -> `Mover a…`.

# Navigation
Do not add a graph engine for Stack/Tabs/Drawer trees.
Use a tree editor with drag/keyboard reorder.

# Dependencies
All auxiliary engines are target adapters and are included only if a project uses the capability.
