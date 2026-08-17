# M00.5 — POC Query portable

POC técnico aislado para demostrar el contrato de `ElectroCraftQueryDefinition` sobre React Query Builder (RQB) y la Studio DB cerrada en M00.4.

## Ownership

- `@react-querybuilder/core@8.23.0`: árbol AND/OR y `formatQuery` parametrizado.
- PGlite `0.5.5`: ejecución real de SQL parametrizado sobre la Studio DB local.
- ElectroCraft: validación fail-closed, mapping de fields canónicos a `record_field_index` o JSONB, facet count y normalización multi-source.

El POC importa únicamente el **contrato físico** de M00.4 (`MIGRATION_STATEMENTS`). No crea un segundo schema/engine ni tablas de producto nuevas.

## Gates

```bash
npm install
npm run verify
```

`verify` falla si falta la integración OSS real, si un operador unsupported no produce blocker, si el payload de injection entra al SQL, si falla el round-trip persistente o si el build no queda reproducible.
