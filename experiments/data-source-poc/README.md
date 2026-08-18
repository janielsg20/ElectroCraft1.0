# ElectroCraft M00.9 — Data Source POC

POC aislado para validar un contrato portable `DataSourceAdapter` sobre REST/OpenAPI y GraphQL, con `DataResult` normalizado y un Gateway que resuelve `SecretRef` únicamente del lado servidor.

## Superficie
- REST read/write sobre fixture local.
- OpenAPI 3.1 fixture y discovery de operaciones.
- Integración real con `@scalar/openapi-parser` para validar + dereferenciar.
- GraphQL query/mutation con variables y errores normalizados.
- Policy direct-safe/CORS/Gateway.
- Gateway server-only con resolución de secreto.
- Harness técnico en español con tabs `REST | GraphQL | Gateway`.

## Ejecutar
```bash
npm ci
npm run check
npm run dev
```
Abrir `http://127.0.0.1:4179`.

`npm run test:offline` no requiere dependencias externas y sirve para verificar el contrato en entornos sin red. `npm run test:parser` es una compuerta deliberadamente estricta: importa y ejecuta el parser Scalar real; no existe fallback local que pueda producir un green falso.

## Boundaries
No contiene drivers PostgreSQL/MySQL, no implementa un query cache, no guarda secretos en config y no se importa desde la app release. TanStack Query conserva ownership de caché cuando esta semántica migre a producto.
