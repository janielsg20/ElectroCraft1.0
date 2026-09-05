# M08.12 — Implementación candidata

Fecha: 2026-09-05.
Rama: `codex/m08-12-record-crud-validation`.
Estado: `IMPLEMENTADA / PENDIENTE GATE`.

## Owner y arquitectura

- Owner: `PGlite generic content store` existente.
- `content_records` permanece como única tabla física de registros.
- Migración v7 añade únicamente `deleted_at` e índice parcial para registros activos; no existe DDL por modelo.
- El adapter compila/ejecuta validación desde `ElectroCraftDataSchema` antes de create/update y mantiene normalización M08.9.
- Todas las mutaciones de Studio pasan por `dataSourceWorkspaceRuntime -> WebDataSourceRepository -> ConnectorRegistry -> InternalDataSourceAdapter`.

## Validación

- required/nullability;
- tipo número/boolean/text/referencia/lista/objeto;
- min/max y minLength/maxLength;
- pattern;
- email, URL, fecha, hora, datetime y color;
- opciones select/radio/checkbox;
- campos desconocidos fail-closed;
- defaults;
- Group/Repeater/Calculated/Conditional continúan bajo el runtime M08.9.

## Soft delete

- `state = deleted` + `deleted_at`;
- queries excluyen eliminados por defecto;
- `includeDeleted` permite inspección explícita;
- updates no reviven registros eliminados;
- `restrict/detach/cascade` conserva atomicidad y cascade aplica la misma policy soft-delete.

## UI

`Datos > Registros` deja de ser placeholder y ofrece selector de modelo, lista/detail, formulario generado por campos, create/update/delete y vista opcional de eliminados. Desktop mantiene dos regiones; mobile usa cards apiladas.

## Tests añadidos

- `tooling/vitest/unit/m08-12-record-validation.test.ts`;
- `tooling/vitest/integration/m08-12-record-crud-pglite.test.ts`;
- `tooling/vitest/contract/m08-12-record-boundary.test.ts`;
- `tooling/playwright/m08-12-records.spec.ts`.

## Correcciones observadas durante el gate

- Base CI `#904` detectó que la continuidad no conservaba el token canónico `ACTIVE`; se restauró `M08.12 — ACTIVE` sin declarar cierre.
- Base CI `#905` pasó convenciones documentales y detectó exclusivamente formato Prettier en siete archivos; el candidate fue normalizado con el formatter bloqueado del repositorio en `eac228c5ec65bc885baed15509e49ff43485cfea`.
- Base CI `#906` quedó como `action_required` porque el commit de formato fue emitido por `github-actions[bot]`; no representa un fallo de código. Este commit normal del repositorio vuelve a disparar la certificación con el actor autorizado.

## Gate

PR `#79` abierta. Pendiente de ElectroCraft Base CI completo sobre el candidate actual. No declarar cierre hasta GREEN.
