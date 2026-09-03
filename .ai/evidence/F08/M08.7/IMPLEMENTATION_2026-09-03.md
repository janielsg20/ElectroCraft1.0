# M08.7 — Connector SDK boundary y optional database packs

Fecha: 2026-09-03.

Estado: `IMPLEMENTADA / CANDIDATA A VALIDACIÓN / ACTIVE`.

## Resultado implementado

### Boundary portable

`packages/domain/src/data/connector-extension.ts` añade `ConnectorExtensionManifest` como contrato tipado sobre la identidad `ElectroCraftExtensionPackage`.

El manifest declara:

- `adapterId` y `sourceKind`;
- schema de configuración portable;
- capabilities;
- requisito `none | optional | required` de Gateway;
- módulos browser/gateway;
- soporte explícito por los nueve targets Core;
- `secretStrategy: secret-ref-gateway`.

El schema falla cerrado si:

- una extensión SQL intenta omitir ConnectorGateway;
- un `secret-ref` intenta incluir un valor secreto por defecto;
- un conector no declara runtime real;
- capabilities o target support se duplican.

### Registry y lifecycle M08.7

`packages/connectors/src/connector-extension-registry.ts` reutiliza el único `ConnectorRegistry` de application.

- instala `DataSourceAdapter`/`DataConnector` reales sin crear otro registry;
- rechaza colisiones con owners Core;
- valida adapter id, source kind y capabilities contra el manifest;
- consume el `configSchema` para diagnosticar campos requeridos/tipos y `SecretRef` ausente;
- produce `MISSING_CONNECTOR_EXTENSION` cuando una fuente referencia un adapter no instalado;
- bloquea uninstall cuando alguna `DataSourceDefinition` sigue usando el adapter;
- `pruneRuntimeDependencies()` conserva solo runtime/gateway de conectores realmente usados.

### Catálogo web/Studio

`packages/data-web/src/connector-catalog.ts` compone estado Core/Extensión desde el `ConnectorRegistry` real y los manifests instalados.

`apps/studio/src/features/data/connector-catalog.tsx` conecta la ruta funcional:

`Datos > Fuentes de datos > Nueva fuente > Más conectores`.

El catálogo muestra:

- badges `Core` / `Extensión`;
- instalado/no disponible y versión;
- capabilities;
- requisito Gateway;
- compatibilidad;
- CTA `Instalar conector` hacia `Recursos > Extensiones` para packs ausentes.

`help.data.connectors` fue añadido al HelpRegistry con relación a fuentes, secretos, extensiones y compatibilidad.

### Packs opcionales

`packages/connectors/OPTIONAL_CONNECTOR_PACKS.md` reserva PostgreSQL (`sql.postgresql`) y MySQL (`sql.mysql`) como primeros packs opcionales después de estabilizar Core.

No se añadió ningún driver PostgreSQL/MySQL/MariaDB al package Core `@electrocraft/connectors`.

## Tests incorporados

`tooling/vitest/unit/m08-7-connector-sdk-boundary.test.ts` cubre:

1. installed connector;
2. ejecución read/create mediante el adapter registrado en ConnectorRegistry;
3. missing connector diagnostic;
4. config schema + SecretRef diagnostics;
5. usage-aware uninstall;
6. dependency pruning;
7. rechazo de SQL sin Gateway y secretos embebidos;
8. contrato visible del catálogo español y ausencia de drivers SQL en Core.

`tooling/vitest/unit/help-registry.test.ts` incluye `help.data.connectors` y búsqueda/mapping contextual.

## Decisiones y límites

- M08.7 implementa el SDK boundary y el consumo del manifest; no implementa el lifecycle general completo de extensiones, owner de F17.
- PostgreSQL/MySQL son packs opcionales documentados y catalogados; sus drivers no se incorporan a Core.
- La UI no simula instalación: un pack ausente navega a Extensiones.
- Un pack instalado puede registrar un adapter real sobre ConnectorRegistry; generated runtimes deben consumir el resultado de pruning, no todos los packs instalados.
- Los secretos siguen siendo `SecretRef` y su resolución permanece server-side mediante Gateway.

## Validación pendiente

Ejecutar lint, typecheck, tests, build y el gate Base CI/Playwright una sola vez sobre la candidata. No declarar M08.7 GREEN hasta ese resultado.

## Siguiente microfase tras gate verde

`M08.8 — Modelos de datos y Field Registry`.
