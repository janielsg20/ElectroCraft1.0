# M08.8 — Modelos de datos y Field Registry — Implementación 2026-09-03

## Estado

`IMPLEMENTADA / CANDIDATA A GATE CI`.

La microfase permanece `ACTIVE` hasta que ElectroCraft Base CI/Playwright termine en `success`.

## Ownership preservado

- `ElectroCraftDataSchema / ElectroCraftDataModel / ElectroCraftDataField`: contratos portables de `@electrocraft/domain`.
- `field-type`: registry-definition con owner preexistente `@electrocraft/application`, según `model-ownership.ts`.
- registros internos: `PGlite generic content store` mediante la tabla única `content_records`.
- persistencia de modelos: objetos canónicos `data-schema` dentro del project storage existente.
- Studio: solo authoring/UI; no posee el modelo ni un store paralelo.

No se introdujo un segundo Field Registry ni un segundo ConnectorRegistry.

## Contrato canónico

`packages/domain/src/contracts/data-definition.ts` amplía sin reemplazar los contratos existentes:

- identidad de modelo: singular/plural, descripción, icono, visibilidad, singleton, menú y capability refs;
- Field metadata: help, default, required, validation, options, conditions, permissions e indexing;
- mantiene compatibilidad con los tipos existentes `boolean` y `json`;
- añade los tipos mínimos de M08.8: text, textarea, richtext, number, currency, email, phone, url, date, time, datetime, color, select, radio, checkbox, switch, image, gallery, file, map, relation, user, taxonomy, group, repeater, calculated y conditional;
- validaciones fail-closed para required/nullable, faceted/indexed, relationModelRef, options y rangos inválidos.

## Field Registry

`packages/application/src/data/field-registry.ts` es el único catálogo de tipos disponible en runtime de aplicación.

Cada entrada declara:

- type;
- label;
- family;
- help;
- storageHint;
- soporte de default/validation/options/conditions/indexing;
- owner avanzado cuando la semántica corresponde a M08.9/M08.10/M08.11.

`storageHint` es metadata portable. No ejecuta DDL.

## Persistencia e impacto de datos

`createStoredDataSchemaObject()` persiste schema metadata mediante el autosave/project storage existente.

`InternalDataRepository.getFieldUsage()` mide registros y valores poblados directamente en `content_records` sin crear columnas/tablas por modelo.

El runtime de `/models`:

- carga el `data-schema` activo para ElectroCraft Data;
- crea/actualiza modelos mediante autosave incremental;
- añade/actualiza/elimina campos mediante el Field Registry;
- antes de rename de key o delete de un campo poblado calcula impacto sobre registros reales;
- requiere confirmación explícita para cambios destructivos con datos;
- no reescribe silenciosamente los records cuando cambia el schema.

## Studio UX

Ruta: `Datos > Modelos` (`/models`).

Desktop:

- lista izquierda 280–312 px;
- detalle a la derecha;
- tabs: Identidad, Campos, Validación, Plantillas, Workflow, Almacenamiento y Avanzado;
- filas de campos compactas;
- análisis/confirmación de impacto visible.

Tablet/mobile:

- lista y detalle se apilan;
- formularios y acciones pasan a una columna;
- tabs siguen navegables horizontalmente;
- focus-visible y reduced-motion preservados.

HelpRegistry: `help.content.models` con copy español y enlace a `.ai/microphases/M08_8.md`.

## Engine/API

Se reutiliza PGlite + Drizzle ya existente. La documentación oficial revisada confirma soporte del adapter Drizzle y transacciones/persistencia de PGlite. No se necesita otro ORM ni una base paralela.

## Pruebas añadidas

- `tooling/vitest/unit/m08-8-data-model-field-registry.test.ts`
  - ownership field-type;
  - 29 tipos registrados;
  - familias/storage hints;
  - round-trip del schema ampliado;
  - validaciones negativas.
- `tooling/vitest/integration/m08-8-model-field-impact-pglite.test.ts`
  - schema metadata + content_records;
  - conteo de uso real de campos;
  - ausencia de reescritura/DDL por modelo.
- `tooling/playwright/m08-8-data-models.spec.ts`
  - creación de proyecto y ElectroCraft Data;
  - creación/persistencia de modelo;
  - añadir campo currency;
  - impacto sin registros;
  - reload persistente;
  - render desktop y mobile.
- tests M08.2/HelpRegistry actualizados por extensión explícita de sus contratos.

## Gate pendiente

Publicar PR candidata y ejecutar una sola ElectroCraft Base CI/Playwright. No declarar M08.8 GREEN ni activar M08.9 antes del resultado `success`.
