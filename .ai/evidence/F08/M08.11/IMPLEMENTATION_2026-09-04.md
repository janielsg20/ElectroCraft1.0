# M08.11 — Implementación candidata

Fecha: 2026-09-04.

Estado: `ACTIVE / IMPLEMENTADA / PENDIENTE GATE`.

Owner: `PGlite generic content store` existente.

## Alcance implementado

### Contrato portable

- Nuevo `ElectroRelation` con:
  - `sourceModelRef`;
  - `targetModelRef`;
  - cardinalidad `one-to-one | one-to-many | many-to-many`;
  - `deleteBehavior: restrict | detach | cascade`;
  - metadata inversa opcional;
  - permisos portables opcionales.
- `ElectroCraftDataSchema` incorpora `relations[]` sin romper documentos anteriores donde la colección está ausente.
- campos `relation` pueden usar `relationRef` además del `relationModelRef` ya existente.
- refs de modelo/relación se validan fail-closed y deben pertenecer al mismo schema.

### Cardinalidad

Semántica direccional:

- `1:1`: un registro origen puede enlazar un único destino y un destino un único origen;
- `1:N`: un origen puede enlazar varios destinos, pero cada destino solo puede pertenecer a un origen dentro de esa relación;
- `N:N`: múltiples edges en ambos lados.

La cardinalidad se valida en la capa de aplicación/repositorio. No altera el schema físico.

### Persistencia

- Se reutiliza exclusivamente la tabla existente `relation_edges`.
- No existe migración M08.11 ni DDL dinámico por relación/cardinalidad.
- El repositorio Drizzle valida:
  - existencia de relación;
  - existencia de ambos records;
  - duplicados;
  - cardinalidad;
  - CRUD de edges.
- El browser runtime usa la misma instancia PGlite/Drizzle que `content_records` y taxonomías.

### Integridad de borrado

Antes de borrar un record mediante el adapter interno:

- `restrict`: bloquea con error visible mientras existan edges;
- `detach`: elimina edges y permite borrar el record;
- `cascade`: recorre los edges relacionados, elimina los records dependientes y sus edges dentro de transacción, y después el flujo normal elimina el record raíz.

### ConnectorRegistry / DataSource

- Capability canónica `relations` añadida a DataSource.
- `InternalRelationRepository` es un port de aplicación separado de PGlite/Drizzle.
- `InternalDataSourceAdapter` publica recursos `relation:<id>` en Data Explorer.
- query/mutations de edges pasan por ConnectorRegistry.
- autorización sigue el `InternalDataPermissionPort` existente; no se introduce un registry paralelo.
- secretos siguen fuera del schema portable mediante `SecretRef`/Gateway existentes.

### Studio

Ruta exacta: `Datos > Modelos > <modelo> > Relaciones`.

- lista compacta origen · cardinalidad · destino;
- detail para Nombre, Clave, Origen, Tipo, Destino, Inverso, Integridad y Permisos;
- selectores de registros para crear vínculos;
- lista de edges con eliminación explícita;
- campos tipo `relation` pueden enlazarse al `relationRef` canónico;
- layout responsive: dos columnas desktop, una columna tablet, selectores/edges apilados en móvil;
- copy de almacenamiento deja explícito que `content_records` y `relation_edges` son stores genéricos y que no existe DDL por cardinalidad.

## Pruebas preparadas

- `tooling/vitest/unit/m08-11-relations.test.ts`
  - schema portable;
  - refs fail-closed;
  - capability/security negativa.
- `tooling/vitest/contract/m08-11-relation-boundary.test.ts`
  - una sola tabla `relation_edges`;
  - runtime Studio sin imports PGlite/Drizzle;
  - ConnectorRegistry/adapter como boundary;
  - UI real de Relaciones.
- `tooling/vitest/integration/m08-11-relations-pglite.test.ts`
  - PGlite real + Drizzle;
  - record CRUD + edge CRUD;
  - persistencia;
  - 1:N y duplicados;
  - `restrict`/`detach`;
  - permiso denegado fail-closed.
- `tooling/playwright/m08-11-relations.spec.ts`
  - definición N:N desde Studio;
  - inverso e integridad;
  - reload/round-trip;
  - selectores de registros visibles.

## Gate pendiente

No se declara GREEN todavía. La candidata debe pasar ElectroCraft Base CI completo: documentación, lint, typecheck, tests, build, Playwright, empty-repository y artifacts. Solo después puede fusionarse y activarse M08.12.
