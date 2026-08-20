# HANDOFF — ElectroCraft

## Current
F04 / M04.1 — Persistencia local real del Studio — `ACTIVE`.

## Heredado
- F03/M03.12 cerró GREEN en head `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- M03.12 run `32320810295` success; artifact `9389767563`; digest `sha256:f810fda738509fca06660cc248ddbe576ebe68a885bb2d8ba026944668d4c015`.
- Base CI `32320810328` success.
- Monorepo actual: 18 owner packages, 20 aliases, 2 apps.

## Siguiente acción exacta
1. Releer `.ai/microphases/M04_1.md` y evidencia M00.4 de PGlite/Drizzle.
2. Revalidar versiones instalables actuales antes de fijar pins.
3. Crear ports de proyectos en `packages/application/src/projects/` sin importar PGlite/Drizzle.
4. Crear owner `packages/data-web/` para PGlite/Drizzle, Worker, schema, migrations y capability detection.
5. Preferir OPFS cuando la plataforma lo soporte de forma segura y declarar fallback persistente compatible cuando no; no ocultar degradaciones.
6. Añadir `project`, `project_object`, `project_revision`, `app_extension_state`, `capability_snapshot`, `user_preference`, migration journal y búsqueda.
7. Implementar save/open transaccional, recovery y atomic rollback.
8. Integrar `Configuración > Almacenamiento` y HelpDescriptor español sin simular estado.
9. Actualizar boundaries a 19 owners/21 aliases, Studio dependency y lockfile.
10. Añadir unit/contract/integration/browser gate M04.1; ejecutar lint/typecheck/tests/build/E2E.
11. Cerrar M04.1 y activar la siguiente microfase F04 automáticamente.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M04_1.md → experiments/m00-4-studio-db → packages/application → tooling/package-boundaries.json → apps/studio/src/shell`.
