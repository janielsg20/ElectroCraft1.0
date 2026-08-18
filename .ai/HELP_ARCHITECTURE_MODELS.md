# HelpDescriptor — `help.architecture.models`

**Idioma:** Español.

## Título
Modelo canónico del proyecto

## Resumen
ElectroCraft separa proyecto, documentos, componentes, layout y estilo de los engines de edición/render para conservar portabilidad, referencias estables y ownership neutral a targets.

## M02.1 — ProjectDefinition y Document
- `ElectroCraftProjectDefinition` contiene identidad, `schemaVersion`, versión de objeto, settings de app, targets por defecto, refs de documentos/rutas/navegación/tema y feature flags.
- Los documentos se referencian por IDs; no se embeben como un mega JSON dentro del ProjectDefinition.
- `ElectroCraftDocument.kind` admite `screen`, `template`, `form`, `admin-screen` y `reusable-component`.
- `screen` es el documento visual principal. `page` no es un kind canónico; solo se acepta en el import legacy explícito y migra a `screen`.
- Puck `AppState`, clases/runtime objects y datos internos de otros engines no forman parte del modelo persistido.
- Zod es el boundary owner de validación: los objetos canónicos usan schemas estrictos y rechazan claves desconocidas.
- Los IDs canónicos son deterministas por namespace + seed y no dependen del runtime o target.
- `ProjectDocumentService` trabaja contra un repository port neutral; reopen bloquea refs faltantes o payloads corruptos en vez de omitirlos.

## M02.2 — ComponentDefinition, Layout y Style
- `ElectroCraftComponentDefinition` describe metadata portable: identidad, campos editables, props por defecto, layout, estilo, referencias y metadata. No contiene un React component ni renderer persistido.
- `ElectroCraftLayout` usa modos semánticos `flow`, `stack`, `row`, `grid` y `overlay`; no persiste `display`, `flex-direction` ni estructuras internas de Puck.
- `ElectroCraftStyle` guarda valores estructurados, tokens y overrides por breakpoint/plataforma. Tailwind y NativeWind pueden ser outputs/adapters, pero sus class strings no son la fuente canónica.
- `schemaVersion` y migración convierten ComponentDefinition legacy hacia el shape actual de forma explícita y reparable.
- `ComponentDefinitionService` persiste/reabre mediante un repository port neutral y reescribe el payload migrado al formato canónico.
- `@electrocraft/editor-puck` adapta ComponentDefinition a la API pública `Config`/`ComponentConfig` de Puck. El renderer real se inyecta por registry y nunca entra al documento canónico.

La versión estructurada para el futuro HelpRegistry vive en `tooling/fixtures/help.architecture.models.json`; F02 no introduce un HelpRegistry paralelo.
