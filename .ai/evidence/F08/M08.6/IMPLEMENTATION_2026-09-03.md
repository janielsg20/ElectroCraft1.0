# M08.6 — Data Explorer y prueba de operaciones

Fecha: 2026-09-03.

Estado: `IMPLEMENTADA / CANDIDATA A GATE CI`.

## Resultado

- `DataExplorer` vive en `Datos > Fuentes de datos > <fuente> > Explorar` y consume el único `ConnectorRegistry`.
- Internal, REST y GraphQL publican operaciones y parámetros tipados mediante `DataSourceResourceDescriptor`; no existe un registry paralelo.
- Las lecturas y mutaciones solo se ejecutan al pulsar `Ejecutar`; create/update/delete abren confirmación previa.
- El resultado se presenta como tabla/lista y la sección Avanzado muestra únicamente una traza sanitizada.
- Respuestas grandes se truncan con aviso visible; claves y textos sensibles se reemplazan por `[REDACTADO]`.
- `Crear consulta desde esta operación` genera y persiste un `ElectroCraftQueryDefinition` canónico con estado `draft`.
- `help.data.explorer` añade ayuda contextual española y enlace a esta microfase.

## Contratos y ownership

- `packages/domain/src/data/explorer.ts`: contrato portable de operación y parámetro del Explorer.
- `packages/application/src/data/data-explorer.ts`: selección, input tipado, ejecución, tiempo, sanitización, truncación y source-to-query handoff.
- `packages/connectors/src/rest-data-source-adapter.ts`: parámetros path/query/header/body derivados de la operación REST.
- `packages/connectors/src/graphql-data-source-adapter.ts`: variables GraphQL tipadas para el formulario.
- `packages/data-web/src/internal-data-repository.ts`: operaciones read/create/update/delete de modelos internos.
- `apps/studio/src/features/data/data-explorer.tsx`: experiencia de Studio; no es runtime de producción.

## UX y seguridad

- Desktop: recursos/operaciones de 260 px, parámetros/ejecución y resultado.
- Tablet: resultado pasa a segunda fila; mobile usa paneles secuenciales en una sola columna.
- Estados cubiertos: cargando, vacío, error recuperable, deshabilitado desde la fuente, ejecución, éxito y guardado de borrador.
- Los secretos siguen resolviéndose únicamente por `SecretRef`/Gateway; Explorer no acepta ni conserva auth material.

## Pruebas añadidas

- `tooling/vitest/unit/m08-6-data-explorer.test.ts`: read explícito, parámetros tipados, truncación, confirmación de mutación, redaction, error y QueryDefinition draft.
- `tooling/vitest/unit/m08-3-rest-data-adapter.test.ts`: descriptors REST de query/body.
- `tooling/playwright/m08-6-data-explorer.spec.ts`: flujo real REST → Explorar → Ejecutar → traza sanitizada → crear borrador.
- HelpRegistry y matriz AppShell actualizadas para `help.data.explorer`.

## Limitación del entorno local

El E2E quedó preparado, pero no pudo ejecutarse en este contenedor porque no hay binario Chromium instalado. La Base CI dispone del navegador y es el gate pendiente antes de declarar `GREEN` y fusionar.
