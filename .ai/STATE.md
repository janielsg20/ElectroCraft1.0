# STATE — ElectroCraft

## Estado actual

- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA / GREEN`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA / GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA / GREEN`.
- F03 — Design System, AppShell, español y ayuda: `COMPLETADA / GREEN`.
- F04 — Persistencia local, proyectos y revisiones: `COMPLETADA / GREEN`.
- F05 — Screen Composer con Puck: `COMPLETADA / GREEN`.
- F06 — Layout, responsive y edición avanzada: implementación fusionada a `main`; el cierre de corrección PR `#67` terminó con fallo Playwright heredado y las reparaciones están incluidas en la rama F07 actual.
- F07 — Pantallas, navegación y rutas: `IMPLEMENTADA / PENDIENTE GATE`.
- M07.1–M07.8: `IMPLEMENTADA / PENDIENTE GATE F07`.

## Rama activa

`codex/m07-1-navigation-model`

## Microfase activa

No queda una microfase de F07 abierta.

**Siguiente transición exacta:** `Gate F07 — Pantallas, navegación y rutas`.

## Capacidades F07 implementadas

1. `ElectroCraftRoute` y `ElectroCraftNavigation` v2 con migración legacy, params, guards, deep links y graph validation.
2. Pantallas CRUD en `Construir > Pantallas`, rutas/navigator asociados, duplicación con IDs nuevos y delete blocker por referencias.
3. Screen Composer orientado a Pantallas con selector compartido topbar/context/mobile, un único Puck e historial aislado por documento.
4. Navigation Builder tree para Pila/Pestañas/Menú lateral/Modal, reordenación drag + teclado, Pantalla inicial y presentación portable.
5. Bindings de Route Param, acciones Navegar `push|replace|back`, ActionGraph real y URL externa http/https separada.
6. Guards Público/Autenticado/Permiso/Condición, redirects sin ciclos y Preview fail-closed sin implementar auth real antes de F12.
7. `NavigationCompilerPort` con contratos React Router, Expo Router, LAMP/Slim, WordPress, Capacitor y Static Web sin persistir objetos target.
8. `/preview` consume el mismo Navigation Graph; integración y Playwright F07 cubren desktop/tablet/mobile y el flujo crear → navegar → proteger → preview → bloquear delete.

## QA heredado F06

Run de corrección: `33203881217`, job `99035169190`.

Resultado histórico:
- docs: success;
- lint: success;
- typecheck: success;
- Vitest: success;
- build: success;
- Playwright: failure.

Reparaciones incluidas en la rama actual antes de Gate F07:
- advanced inspector sin selección valida estado vacío en lugar de exigir controles imposibles;
- metadata responsive transitoria de Puck se permite en la sesión pero se comprueba que no llegue al documento canónico;
- topbar compacta herramientas secundarias a 1536–1700px y conserva Undo/Redo sin solapamiento;
- lock contextual sobrevive `refreshPermissions()` y se reinicia solo al cambiar la sesión de Pantalla;
- breadcrumbs actualizados a `App > Pantalla > Node`.

Ninguna de estas reparaciones se declara GREEN hasta ejecutar Gate F07.

## Evidencia F07

- `.ai/evidence/F07/M07.1/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.2/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.3/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.4/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.5/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.6/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.7/IMPLEMENTATION_2026-08-28.md`
- `.ai/evidence/F07/M07.8/IMPLEMENTATION_2026-08-28.md`

## Regla de cierre

No marcar F07 `COMPLETADA / GREEN` ni activar F08 hasta que el gate de fase ejecute `docs + lint + typecheck + test + build + Playwright` con resultado `success` y blockers P0/P1 = 0.
