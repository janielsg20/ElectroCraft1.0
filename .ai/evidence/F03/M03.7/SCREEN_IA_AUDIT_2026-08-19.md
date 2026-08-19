# M03.7 — Screen / IA audit — 2026-08-19

## Scope auditado
La auditoría parte de la navegación canónica `studioSidebarNavigation`; no inventa destinos para rellenar la UI.

## Módulos de primer nivel
Se conservan como `primary` todos los destinos ya existentes del Sidebar en los grupos Construir, Datos, Lógica, App, Recursos, Apariencia y Publicar. Ningún módulo se mueve a Advanced solo para reducir densidad.

## Topbar
- Documento, plataforma, breakpoint, undo/redo y zoom: `contextual`.
- Vista previa y Exportar: `primary`.
- Estado de guardado y Local: `diagnostic`.
- Ayuda y Configuración: `contextual`.
- Configuración sigue siendo la última acción derecha.

## Settings
- Espacio de trabajo / Sidebar: `primary`, visible.
- Persistencia de preferencias de Studio: `advanced`, Collapsible Radix.
- Error/Bloqueo: `diagnostic`, visible fuera de Advanced cuando ocurra.

## Editor
- Canvas: `primary`.
- Componentes y Outline: `contextual`.
- Puck Fields / propiedades principales: `primary`.
- Detalle avanzado del Inspector: `advanced`.
- Diagnósticos de selección/runtime, cuando existan, deben ser `diagnostic` y permanecer visibles si explican estado.

## List / Detail
- `/content` conserva una sola ruta.
- Lista de registros: `primary`.
- Detail: `contextual` dentro de la misma superficie.
- Sin datos: empty state de lista.
- Sin selección: empty state de detalle.
- No se crea `/content/detail` ni otra ruta redundante.

## Empty states requeridos
1. Project Home — definido en registry; no crea ruta nueva.
2. Canvas — visible con documento estructural vacío.
3. Outline — visible con documento estructural sin capas.
4. Inspector — visible sin selección real.
5. Content — `/content`, lista vacía.
6. Queries — `/queries`.
7. Forms — `/forms`.
8. Administration — `/admin`.
9. Media — `/media`.
10. Export — `/export`.

`content-detail` es un estado adicional necesario para el patrón List/Detail y no sustituye ninguno de los diez requeridos.

## Rutas canónicas con owner funcional futuro
`/queries`, `/forms`, `/admin`, `/media` y `/export` muestran un empty state específico y honesto mientras el owner funcional correspondiente no esté implementado. Esto no se considera implementación del módulo ni éxito simulado.

## Rutas desconocidas
Permanecen fail-closed mediante la superficie temporal de ruta no disponible. No se muestran como módulos vacíos canónicos.

## Responsive
La clasificación no cambia por breakpoint. M03.6 conserva el reflow:
- laptop: rail 64 + split/overlay;
- tablet: rail 56 + Sheets;
- móvil: dock 58px exacto y Sheets.

## Resultado
No se detecta necesidad de nuevas rutas para Settings, Inspector, Advanced ni Detail. Progressive Disclosure puede aplicarse dentro de owners existentes sin reducir capacidad primaria.
