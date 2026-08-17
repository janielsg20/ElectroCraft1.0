# ADR-0005 — Query portable con React Query Builder

Date: 2026-08-17.
Status: ACCEPTED.
Owner: F00 / M00.5.

## Contexto

ElectroCraft necesita una definición de query portable que pueda persistirse como dato canónico y ejecutarse contra la Studio DB cerrada en M00.4 sin reconstruir un query-builder paralelo. La query debe soportar grupos AND/OR, valores parametrizados, fields indexados y no indexados, facets y composición multi-source, y debe fallar de forma explícita ante semántica no soportada.

## Decisión

1. `@react-querybuilder/core@8.23.0` es el owner OSS del árbol de condiciones y del formateo parametrizado.
2. `ElectroCraftQueryDefinition` versión 1 envuelve el árbol RQB; no persiste clases, callbacks ni estado interno del engine.
3. ElectroCraft valida modelo, field, operator, combinator y valueSource antes de formatear. Un caso no soportado produce `QueryBlockerError`; nunca se acepta fallback `true`, `(1 = 1)` o no-op.
4. RQB produce SQL parametrizado numerado `$1...$n` y un array de valores. Los valores de usuario nunca se interpolan en el SQL.
5. ElectroCraft sustituye tokens internos de field por bindings físicos autorizados: fields indexados/faceted usan `record_field_index`; fields no indexados usan extracción tipada desde `content_records.data` JSONB.
6. Los identificadores de field proceden exclusivamente del schema canónico y pasan una política restrictiva de identificador; nunca proceden directamente de un valor de usuario.
7. `facetCount` agrupa sobre el indexer tipado de M00.4.
8. Multi-source normaliza cada resultado a `{sourceId, recordId, modelId, data}` sin crear una nueva capa de persistencia.
9. Las query definitions se guardan como Project Objects de M00.4 y sobreviven a close/reopen de PGlite.
10. El POC reutiliza `MIGRATION_STATEMENTS` de M00.4; no declara nuevas tablas ni un segundo engine de Studio DB.

## API OSS ejecutada

- `@react-querybuilder/core@8.23.0`, `formatQuery(..., { format: "parameterized", paramPrefix: "$", numberedParams: true })`.
- `@electric-sql/pglite@0.5.5` para ejecución real y persistence round-trip.

## GitHub Actions de cierre

- workflow: `Verify M00.5 Query Portable`;
- run: `32063065255`;
- job: `95488578412`;
- head SHA: `2315f0f2f6d26c3ef45d22d5fd0914d8e26b0503`;
- conclusion: `success`;
- artifact: `9298848789`;
- artifact digest: `sha256:cb0d7e6160d76992761fa20edfa1b33634ee25b18bf98af1b904f3d9d93a9042`;
- instalación reproducible: `npm ci` con `package-lock.json` versionado.

## Resultados ejecutables

- lint: PASS;
- syntax/type contract: PASS, 12 módulos ESM;
- tests: PASS, 7/7;
- real RQB + PGlite integration: `PASS_QUERY_ENGINE`;
- indexed field -> `record_field_index`: PASS;
- JSON field -> JSONB extraction: PASS;
- nested AND/OR execution: PASS;
- unsupported operator blocker: PASS;
- injection payload permanece en params y no aparece en SQL: PASS;
- facet count sobre indexer: PASS;
- multi-source output-shape: PASS;
- Project Object save/close/reopen/load/re-execute: PASS;
- build: `PASS_BUILD`;
- closure gate: PASS.

RQB produjo en el fixture principal:

```text
(__ecf0__ = $1 and (__ecf1__ = $2 or __ecf2__ = $3))
```

con params separados:

```json
["power", "Power Bank 20K", "USB-C battery pack"]
```

## Gap OSS / semántica ElectroCraft

En el run reproducible:
- RQB format average / 50: `0.0442 ms`;
- Electro compile average / 50: `0.0479 ms`;
- overhead observado del adapter: `0.0037 ms`.

RQB resuelve el árbol booleano, operator formatting y parameterization de valores. ElectroCraft resuelve únicamente la política fail-closed, el binding field canónico, el mapping index-vs-JSON y la normalización source/result.

## Fallo útil previo al cierre

La primera corrida llegó a 7/7 tests pero falló antes de integración porque PGlite no exporta el subpath `./package.json`. La inspección de versión se corrigió leyendo el manifest instalado como archivo, sin cambiar el contrato del engine. La segunda corrida quedó verde y la tercera fijó el lockfile y volvió a pasar con `npm ci`.

## Licencia

RQB 8.23.0 se distribuye bajo MIT. PGlite 0.5.5 permanece en la línea Apache-2.0 ya auditada en F00. M00.5 no introduce otro engine.

## Consecuencias

M00.5 queda cerrada GREEN. La siguiente microfase exacta es M00.6 — POC Action Flow Rete. M00.6 no puede reutilizar el adapter de query como workflow engine ni persistir internals de Rete en el modelo canónico.
