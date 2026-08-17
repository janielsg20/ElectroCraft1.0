# M00.4 — POC Studio DB genérica

POC aislado para validar la Studio DB de ElectroCraft con PGlite + Drizzle sin crear tablas físicas a partir de modelos/fields definidos por el usuario.

## Pins revalidados
- `@electric-sql/pglite@0.5.5`
- `drizzle-orm@0.45.2`

## Topología física ElectroCraft (public schema)
- `projects`
- `project_objects`
- `project_revisions`
- `content_records`
- `relation_edges`
- `record_field_index`

Drizzle puede mantener su tabla interna de migrations en su propio schema; no forma parte del modelo físico ElectroCraft ni se deriva de user schemas.

## Worker browser
`src/browser/client.mjs` usa `PGliteWorker`; `src/browser/studio-db.worker.mjs` es el único lugar browser que instancia PGlite y usa `idb://electrocraft-m00-4-studio-db`.

## Gates
```bash
npm install
npm run verify
```

`npm run integration` usa el migrator oficial `drizzle-orm/pglite/migrator`, un directorio persistente temporal PGlite y valida aislamiento de Project Objects, modelos lógicos sin tablas nuevas, facet index/query, schema evolution sin ALTER, rollback, close/reopen y latencia.

El harness browser en `harness/` existe solo para el POC técnico Request/Resultado/Validación y debe abrirse en dos tabs para cerrar el gate multi-tab.
