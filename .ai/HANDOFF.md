# HANDOFF — ElectroCraft

## Current
F02 / M02.3 — Definir ownership de Data Sources, Data Models, Queries y Forms — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_3.md`, `.ai/DATA_MODELS.md`, `.ai/ARCHITECTURE.md` y contratos M02.1/M02.2.
2. Definir en `packages/domain/src/contracts/` DataSourceDefinition, ElectroCraftDataSchema/DataModel, QueryDefinition y bindings portables/versionados; no incluir secrets.
3. Mantener Form como `ElectroCraftDocument kind=form` y añadir `formMeta`; no crear un árbol Form paralelo.
4. Reutilizar `packages/data-core` como owner de data runtime/contracts de integración, `packages/query-rqb` como adapter de autoría de condiciones y `packages/forms` como adapter/contratos de formularios.
5. Definir ConnectorRegistry como application registry efímero, no persistido en el proyecto; Refine DataProvider permanece adapter de administración.
6. Añadir serializers/migrations, validators de refs, query safety/result integration, fixtures y unit/contract/integration/negative tests.
7. Ejecutar lint, typecheck, boundaries, tests, build y CI real; registrar evidencia M02.3 y solo entonces activar M02.4.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_3.md`.

M02.1 y M02.2 están cerradas; no reabrirlas salvo regresión reproducible.
