# HelpDescriptor — `help.architecture.models`

**Idioma:** Español.

## Título
Modelo canónico del proyecto

## Resumen
ElectroCraft separa el contenedor del proyecto de sus documentos para conservar portabilidad, referencias estables y ownership neutral a engines/targets.

## M02.1 — ProjectDefinition y Document
- `ElectroCraftProjectDefinition` contiene identidad, `schemaVersion`, versión de objeto, settings de app, targets por defecto, refs de documentos/rutas/navegación/tema y feature flags.
- Los documentos se referencian por IDs; no se embeben como un mega JSON dentro del ProjectDefinition.
- `ElectroCraftDocument.kind` admite `screen`, `template`, `form`, `admin-screen` y `reusable-component`.
- `screen` es el documento visual principal. `page` no es un kind canónico; solo se acepta en el import legacy explícito y migra a `screen`.
- El árbol mínimo de Document conserva `id`, `componentRef`, props JSON portables y children. Component/Layout/Style se completan en M02.2.
- Puck `AppState`, clases/runtime objects y datos internos de otros engines no forman parte del modelo persistido.
- Zod es el boundary owner de validación: los objetos canónicos usan schemas estrictos y rechazan claves desconocidas.
- Los IDs canónicos son deterministas por namespace + seed y no dependen del runtime o target.
- `ProjectDocumentService` trabaja contra un repository port neutral; reopen bloquea refs faltantes o payloads corruptos en vez de omitirlos.

La versión estructurada para el futuro HelpRegistry vive en `tooling/fixtures/help.architecture.models.json`; F02 no introduce un HelpRegistry paralelo.
