# HANDOFF — ElectroCraft

## Current
F02 / M02.4 — Definir Action, State, Navigation y Permission contracts — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_4.md`, `.ai/ARCHITECTURE.md`, `.ai/DATA_MODELS.md` y contratos cerrados M02.1–M02.3.
2. Definir en `packages/domain/src/contracts/` `ElectroCraftActionGraph`, `ElectroCraftStateDefinition`, `ElectroCraftRouteDefinition`, `ElectroCraftNavigationDefinition`, `ElectroCraftRole` y `ElectroCraftPermissionPolicy` como contratos portables/versionados.
3. Mantener ActionGraph independiente de clases Rete; Route/Navigation no puede persistir objetos React Router/Expo; permissions se expresan por capability/resource/field/route/action.
4. Definir refs estables entre screens/routes/actions/state, schemas strict/fail-closed, serializer/migrations y fixtures de round-trip.
5. Añadir application-facing types/services sin importar engines; reutilizar adapters/owners existentes en lugar de crear subsystems paralelos.
6. Actualizar `help.architecture.models` en español con los conceptos nuevos.
7. Añadir unit/contract/integration/negative tests, scope/persistence tests y ejecutar lint, typecheck, boundaries, tests, build y CI real.
8. Registrar evidencia M02.4 y solo entonces activar M02.5.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_4.md`.

M02.1–M02.3 están cerradas; no reabrirlas salvo regresión reproducible.
