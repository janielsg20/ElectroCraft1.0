# HelpDescriptor — `help.architecture.models`

**Idioma:** Español.

## Título
Modelo canónico del proyecto

## Resumen
ElectroCraft separa proyecto, documentos, componentes, datos, queries, formularios, acciones, estado, navegación, permisos, layout y estilo de los engines de edición/render/runtime/storage para conservar portabilidad, referencias estables y ownership neutral a targets.

## M02.1 — ProjectDefinition y Document
- `ElectroCraftProjectDefinition` contiene identidad, `schemaVersion`, versión de objeto, settings de app, targets por defecto, refs y feature flags.
- Los documentos se referencian por IDs; no se embeben como un mega JSON dentro del ProjectDefinition.
- `ElectroCraftDocument.kind` admite `screen`, `template`, `form`, `admin-screen` y `reusable-component`.
- `screen` es el documento visual principal. `page` solo se acepta como import legacy y migra a `screen`.
- Puck `AppState`, clases/runtime objects y datos internos de otros engines no forman parte del modelo persistido.
- Zod es el boundary owner de validación: los objetos canónicos usan schemas estrictos y rechazan claves desconocidas.

## M02.2 — ComponentDefinition, Layout y Style
- `ElectroCraftComponentDefinition` describe metadata portable; no contiene un React component ni renderer persistido.
- `ElectroCraftLayout` usa modos semánticos `flow`, `stack`, `row`, `grid` y `overlay`.
- `ElectroCraftStyle` guarda valores/tokens estructurados y overrides responsive/platform; Tailwind/NativeWind no son fuente canónica.
- `@electrocraft/editor-puck` adapta a la API pública de Puck e inyecta renderers fuera del modelo persistido.

## M02.3 — Data Sources, Data Models, Queries y Forms
- `ElectroCraftDataSourceDefinition` describe tipo, adapter, capacidades y config no sensible. Credenciales/tokens no se persisten en `config`; se referencia `authRef`.
- `ElectroCraftDataSchema` contiene DataModels y fields tipados; relaciones e índices/facets se validan por referencia.
- `ElectroCraftQueryDefinition` referencia source/schema/model y conserva condiciones, sort, pagination/cache sin clases o callbacks del query engine.
- `@electrocraft/query-rqb` adapta la query canónica a React Query Builder y exige SQL parametrizado; los valores del usuario permanecen separados en params.
- `ConnectorRegistry` vive en `application` como registro efímero de adapters; no forma parte del ProjectDefinition persistido.
- Form no crea otro árbol: sigue siendo `ElectroCraftDocument kind=form` y usa `formMeta` para schema/model/action/bindings.
- Los bindings portables pueden referenciar DataSource, Query, State, Route, User, Form o Action output mediante IDs + path.
- `data-core`, `query-rqb` y `forms` son los owners existentes; F02 no crea un segundo subsystem de datos/query/forms.

## M02.4 — Action, State, Navigation y Permission
- `ElectroCraftActionGraph` persiste nodos/edges/refs como datos JSON versionados; `NodeEditor`, sockets, history y clases de Rete solo existen en `workflow-rete` durante runtime.
- `ElectroCraftStateDefinition` declara scope, tipo, valor inicial, persistence y sensibilidad. La instancia Zustand nunca se persiste como proyecto.
- Estado sensible no puede degradarse a `local`/`session`; `secure` requiere un storage/target seguro y `component` no se persiste.
- `ElectroCraftRouteDefinition` referencia Screen, ActionGraph, State y PermissionPolicy por IDs; no contiene RouteObject, loader, hook o componente de React Router/Expo Router.
- `ElectroCraftNavigationDefinition` es una estructura portable de items que apunta a Route IDs; la navegación visual/runtime se deriva mediante adapters.
- `ElectroCraftRole` solo agrupa PermissionPolicy refs. `ElectroCraftPermissionPolicy` expresa allow/deny por capability y target; no persiste callbacks de autorización.
- `auth-core` evalúa policies fail-closed y `deny` prevalece sobre `allow`.
- `application` valida las referencias cruzadas; missing refs quedan como diagnósticos reparables y nunca se ignoran silenciosamente.

La versión estructurada para el futuro HelpRegistry vive en `tooling/fixtures/help.architecture.models.json`; F02 no introduce un HelpRegistry paralelo.
