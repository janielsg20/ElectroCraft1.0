# HANDOFF — ElectroCraft

## Current

F08 / M08.8 — Modelos de datos y Field Registry — `ACTIVE`.

Rama activa: `codex/m08-8-data-models-field-registry`.

M08.7 quedó certificada por ElectroCraft Base CI `33792230116` (#858) y PR `#73` fusionada por squash a `main` en `7bded471c94bb50009a6b99215d6e02cb3b726b2`.

## M08.8 owner y límites

Owner: `PGlite generic content store` existente.

- ampliar `ElectroCraftDataModel`; no crear otro concepto central de modelo;
- modelos/campos se persisten como `data-schema` portable;
- registros continúan en `content_records` genérico;
- no DDL dinámico ni tabla física por modelo;
- Field Registry es metadata portable para Studio/compilers/targets;
- `storageHint` no ejecuta DDL en Studio;
- model CRUD debe volver visible el schema mediante el adapter interno/ConnectorRegistry existente;
- rename/delete de Field muestra usage/data impact;
- M08.9 conserva la semántica profunda de Group/Repeater/Calculated/Conditional aunque M08.8 registre esos tipos;
- M08.10/M08.11 conservan taxonomías y relaciones avanzadas; M08.8 solo deja contratos/referencias preparados.

## UX obligatoria

Ruta: `Datos > Modelos` (`/models`).

Desktop: lista 280–320 px a la izquierda y detalle a la derecha. Tabs: Identidad, Campos, Validación, Plantillas, Workflow, Almacenamiento y Avanzado. Mobile/tablet no comprime el layout desktop: lista y detalle se convierten en navegación/stack usable.

Copy visible: Modelos; Nuevo modelo; Identidad; Campos; Validación; Taxonomías; Relaciones; Estados; Almacenamiento; Avanzado.

Ayuda: `help.content.models`.

## Engine/API verificado

PGlite mantiene soporte oficial de Drizzle, almacenamiento browser y transacciones. Se reutilizan las migraciones y tablas genéricas existentes.

## Validación

No ejecutar Base CI mientras la microfase esté en implementación. Preparar unit/contract, integration PGlite, persistence round-trip y E2E; después publicar una única candidata y usar Base CI/Playwright como gate final.

## Siguiente acción exacta

Implementar contrato canónico + Field Registry + model runtime + `/models`, registrar evidence y correr el gate de M08.8. Con GREEN, fusionar y activar `M08.9 — Group, Repeater, Calculated y Conditional Fields`.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_8.md → packages/domain/src/contracts/data-definition.ts → packages/domain/src/data → packages/application/src/data → packages/connectors/src → packages/data-web/src/internal-data-repository.ts → apps/studio/src/features/data → apps/studio/src/help → tooling/vitest → tooling/playwright`.
