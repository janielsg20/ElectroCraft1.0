# M08.13 — Implementación — 2026-09-06

## Estado

`IMPLEMENTADA / PENDIENTE GATE`.

No declarar cierre hasta ElectroCraft Base CI completo GREEN.

## Owner preservado

`PGlite generic content store` existente.

No se crea store paralelo, tabla por modelo, índice físico por campo, query engine alternativo ni segundo `ConnectorRegistry`.

## Implementación

### Semántica canónica

- nuevo contrato `ElectroCraftFieldIndexing` con capacidades explícitas:
  - `searchable`
  - `filterable`
  - `sortable`
  - `faceted`
- metadata portable `field.metadata.indexing` conserva esas capacidades;
- `indexed`/`faceted` heredados se mantienen solo como compatibilidad;
- Faceted implica Filterable;
- texto de búsqueda se normaliza por Unicode, acentos, case y espacios.

### GenericFieldIndexer

- usa la tabla física genérica existente `record_field_index`;
- solo proyecta campos con al menos una capacidad indexable;
- filas tipadas incluyen `valueKind`, texto/número/boolean/timestamp, `normalizedText` y `ordinal`;
- soporta valores anidados de Group/Repeater recorriendo `parentFieldRef`;
- arrays generan múltiples filas mediante `ordinal`;
- create/update/delete mantiene `content_records` y `record_field_index` en una sola transacción Drizzle/PGlite;
- cascade relacional elimina índices de nodos afectados dentro de la misma transacción.

### Storage v8

- `STUDIO_STORAGE_SCHEMA_VERSION = 8`;
- v7 sigue perteneciendo a M08.12;
- v8 añade `record_field_index.normalized_text`;
- v8 elimina `record_field_index_fts_idx`, el GIN de expresión heredado desde F04;
- M08.13 no crea nuevos índices SQL por campo/modelo.

### Query runtime

El repositorio indexado usa `record_field_index` para:

- búsqueda normalizada por campos Searchable;
- filtros exactos en campos Filterable;
- orden en campos Sortable;
- facetas y conteos en campos Faceted;
- fallback JSON en `content_records` cuando un filtro/orden apunta a un campo no indexado.

### Reindex

- estado: `disabled | empty | ready | stale`;
- recurso de adapter: `index:<modelId>`;
- read devuelve estado/conteos;
- update ejecuta reconstrucción completa del modelo;
- acceso permanece detrás de `ConnectorRegistry`.

### Studio

`Datos > Modelos > Campo > Avanzado > Búsqueda y filtros` expone:

- Searchable · Búsqueda
- Filterable · Filtrable
- Sortable · Ordenable
- Faceted · Facetas
- estado del índice
- registros indexados/activos
- filas tipadas
- `Reconstruir índice`

No se expone SQL al usuario.

## Pruebas añadidas

- unit: semántica canónica y normalización;
- integration real PGlite: CRUD, filas tipadas, search/filter/sort/facets, stale/rebuild y soft-delete;
- contract: ownership, schema v8, ausencia de DDL dinámico/índices por campo y ruta ConnectorRegistry;
- E2E: configuración/persistencia de las cuatro capacidades y rebuild desde Studio.

## Regresiones actualizadas

Los contratos y fixtures de storage que fijaban v7 se avanzan a v8 conservando el journal explícito de M08.12 en versión 7.

## Gate pendiente

Ejecutar un único ElectroCraft Base CI completo sobre la PR de M08.13. Solo si termina GREEN crear `CLOSURE`, fusionar y activar M08.14.
