# HANDOFF — ElectroCraft

## Current

F08 / M08.7 — Connector SDK boundary y optional database packs — `ACTIVE`.

Rama activa: `codex/m08-7-connector-sdk-packs`.

Estado de implementación: `IMPLEMENTADA / CANDIDATA A VALIDACIÓN`.

M08.6 quedó certificada por ElectroCraft Base CI `33776935165` y PR `#72` fusionada por squash a `main` en `d89235f36f81fd91f9d8d676191c8ab52dbf7804`.

## M08.7 owner y límites

Owner: `ConnectorRegistry + ElectroCraftExtensionPackage`.

- reutiliza el único `ConnectorRegistry`; no crear otro runtime/registry de conectores;
- `ConnectorExtensionManifest` es portable y declara kind/config/capabilities/Gateway/runtime/targets;
- un pack SQL requiere ConnectorGateway y SecretRef; no puede conectar DB directamente desde browser;
- PostgreSQL/MySQL son packs opcionales; Core no incluye sus drivers;
- el lifecycle general de extensiones continúa perteneciendo a F17;
- generated apps solo deben incluir runtime/gateway de packs realmente usados;
- uninstall falla cerrado mientras alguna `DataSourceDefinition` use el adapter.

## Resultado implementado

1. `ConnectorExtensionManifest` Zod con identidad `ElectroCraftExtensionPackage`, config schema, capabilities, Gateway/runtime y target support;
2. `ConnectorExtensionRegistry` sobre ConnectorRegistry con install, collision guard, source/config diagnostics, missing connector, usage-aware uninstall y dependency pruning;
3. catálogo `packages/data-web` que combina Core y extensiones sin drivers SQL embebidos;
4. Studio: `Datos > Fuentes de datos > Nueva fuente > Más conectores`;
5. badges Core/Extensión, estado, versión, capabilities, Gateway, compatibilidad y CTA `Instalar conector`;
6. `help.data.connectors` registrado;
7. `OPTIONAL_CONNECTOR_PACKS.md` para PostgreSQL/MySQL;
8. tests de install/read-create/missing/config-SecretRef/uninstall/pruning/security/UI contract.

## Validación pendiente

El primer run de Base CI detectó una inconsistencia del marcador documental `ACTIVE` antes de ejecutar lint/typecheck. El contenido funcional no llegó a validarse en ese run; la corrección mantiene M08.7 como única microfase `ACTIVE` con el formato canónico del docs gate.

No declarar M08.7 GREEN todavía. Falta la ejecución completa de documentación, lint, typecheck, tests, build y Playwright sobre el commit corregido.

## Siguiente acción exacta

Validar la rama candidata. Si el gate queda verde, registrar `VALIDATION/CLOSURE`, fusionar y activar `M08.8 — Modelos de datos y Field Registry`. Si falla, corregir únicamente los fallos observados sin ampliar el ownership.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_7.md → .ai/EXTENSION_PLUGIN_SYSTEM.md → packages/domain/src/data → packages/application/src/connector-registry.ts → packages/application/src/data → packages/connectors/src → packages/data-web/src → apps/studio/src/features/data → apps/studio/src/help → tooling/vitest → tooling/playwright`.
