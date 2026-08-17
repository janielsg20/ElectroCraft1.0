# M00.5 — source/API audit

## React Query Builder

- Package: `@react-querybuilder/core`.
- Pin reproducible: `8.23.0`.
- License: MIT.
- API usada: `formatQuery` con `format: "parameterized"`, `paramPrefix: "$"`, `numberedParams: true` y parámetros separados.
- Ownership aceptado: nested boolean tree, operator formatting y bind-value parameterization.

## PGlite

- Package: `@electric-sql/pglite`.
- Pin reutilizado: `0.5.5`.
- Ownership: ejecución/persistencia de la Studio DB ya cerrada en M00.4.

## ElectroCraft adapter

Solo posee:
- validación fail-closed de model/field/operator/valueSource;
- field-token -> physical binding;
- `record_field_index` para indexed/faceted fields;
- JSONB extraction para fields no indexados;
- facet count;
- source/result normalization;
- persistence del wrapper canónico como Project Object.

No crea query builder, SQL parser, storage engine ni schema físico paralelo.
