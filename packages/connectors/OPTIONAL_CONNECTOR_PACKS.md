# OPTIONAL_CONNECTOR_PACKS — ElectroCraft

## Objetivo

Los conectores de bases de datos server-side se distribuyen como `ElectroCraftExtensionPackage` y se registran sobre el único `ConnectorRegistry`. Core conserva contratos portables, catálogo, diagnostics, SecretRef/Gateway y pruning de dependencias; no incorpora drivers SQL por defecto.

## Boundary

Cada pack instala un `ConnectorExtensionManifest` con:

- `adapterId` y `sourceKind`;
- schema portable de configuración;
- capabilities declaradas;
- módulos runtime/gateway;
- soporte explícito por target;
- `secretStrategy: secret-ref-gateway`;
- identidad `ElectroCraftExtensionPackage` y versión.

La instalación debe aportar un `DataSourceAdapter` real. El `ConnectorExtensionRegistry` valida que adapter, kind y capabilities coincidan antes de registrarlo sobre `ConnectorRegistry`.

## Seguridad

- Los valores secretos nunca viven en el manifest ni en `DataSourceDefinition.config`.
- Credenciales se representan mediante `SecretRef`.
- Un conector SQL declara `gateway: required` y no puede abrir una conexión DB directa desde el browser.
- Los packs con código requieren revisión de código antes del lifecycle de instalación de Extensiones.

## Primeros packs opcionales tras estabilizar Core

### PostgreSQL

- catálogo: `PostgreSQL`;
- adapter reservado: `sql.postgresql`;
- package id reservado: `electrocraft.connector.postgresql`;
- estado Core: no instalado / sin driver embebido;
- ejecución: ConnectorGateway;
- instalación: `Recursos > Extensiones`.

### MySQL

- catálogo: `MySQL`;
- adapter reservado: `sql.mysql`;
- package id reservado: `electrocraft.connector.mysql`;
- estado Core: no instalado / sin driver embebido;
- ejecución: ConnectorGateway;
- instalación: `Recursos > Extensiones`.

MariaDB se considera compatibilidad de un pack MySQL cuando el adapter real la certifique; Core no declara compatibilidad automática.

## Lifecycle y guards

1. El host valida `ConnectorExtensionManifest`.
2. Se comprueba colisión de `adapterId` con owners Core u otras extensiones.
3. Se registra el adapter/runtime real sobre el único `ConnectorRegistry`.
4. Una fuente cuyo adapter no existe recibe `MISSING_CONNECTOR_EXTENSION` y falla cerrada.
5. La desinstalación se bloquea si alguna `DataSourceDefinition` todavía referencia el adapter.
6. `pruneRuntimeDependencies()` conserva solo los paquetes runtime/gateway usados por las fuentes del proyecto.
7. Un pack no usado no debe aparecer en generated apps ni en sus dependencias.

## Catálogo Studio

Ruta: `Datos > Fuentes de datos > Nueva fuente > Más conectores`.

El catálogo distingue `Core` y `Extensión`, muestra estado, versión, capabilities y requisito Gateway. Los packs no instalados navegan a `Recursos > Extensiones`; no simulan instalación ni conexión exitosa.

## Fuera de alcance de M08.7

- Descargar paquetes desde un registry remoto.
- Ejecutar código de extensiones automáticamente.
- Implementar los drivers PostgreSQL/MySQL dentro de Core.
- Reemplazar el lifecycle general de `ElectroCraftExtensionPackage` que pertenece a F17.
