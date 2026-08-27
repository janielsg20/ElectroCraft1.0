# TRACKING — ElectroCraft current position

Date: 2026-08-27.

| Scope              | Estado             | Evidencia                                      |
| ------------------ | ------------------ | ---------------------------------------------- |
| F00                | COMPLETADA / GREEN | `.ai/evidence/F00/`                            |
| F01                | COMPLETADA / GREEN | `.ai/evidence/F01/`                            |
| F02                | COMPLETADA / GREEN | `.ai/evidence/F02/`                            |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md`       |
| F04 / M04.1–M04.8  | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md`       |
| F05 / M05.1        | COMPLETADA / GREEN | PR `#49`; Base CI `32868029914`                |
| F05 / M05.2        | COMPLETADA / GREEN | PR `#50`; Base CI `32990513971` (#661)         |
| F05 / M05.3        | COMPLETADA / GREEN | PR `#52`; Base CI `33016557679` (#674)         |
| F05 / M05.4        | COMPLETADA / GREEN | PR `#56`; Base CI `33035570789` (#692)         |
| F05 / M05.5        | COMPLETADA / GREEN | PR `#57`; Base CI `33081006606` (#702)         |
| F05 / M05.6        | COMPLETADA / GREEN | PR `#58`; Base CI `33086731332` (#707)         |
| F05 / M05.7        | ACTIVE             | `codex/m05-7-palette-outline-extensions`       |

## Cierre M05.1

- Head funcional: `9aa330dbf44b39485516ee0d3dc181a9aee4196b`.
- PR `#49`; squash merge a `main`: `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- `ElectroCraft Base CI` run `32868029914` (#656): `success`.
- Puck queda encapsulado por `@electrocraft/editor-puck`; Studio no importa `@puckeditor/core` para el adapter.
- `ElectroCraftDocument.root` se conserva como envelope canónico y sus hijos se proyectan a `Data.content`.
- Slots públicos preservan IDs/nesting; unknown components generan diagnostics visibles y recuperables.
- Puck Data vuelve al documento canónico y al autosave sin persistir selección, DnD o historial del engine.

## Cierre M05.2

- Head funcional validado: `9321356994e5cc48748f1d406c920e28b8c9b141`.
- PR `#50`; squash merge a `main`: `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- `ElectroCraft Base CI` run `32990513971` (#661): `success`.
- Composition pública integrada: `Puck.Components`, `Puck.Outline`, `Puck.Preview`, `Puck.Fields`.
- Palette resuelve disponibilidad desde el `Config` Puck activo; no existe segundo ComponentRegistry.
- Preview usa iframe con aislamiento de estilos del host.

## Cierre M05.3

- Head funcional validado: `176b41a31a017f800cb8f63b41be3b7e65f52324`.
- PR `#52`; squash merge a `main`: `fd5901dff66acca5d92ffee832a2ac881721458b`.
- `ElectroCraft Base CI` run `33016557679` (#674): `success`.
- Slots recursivos estables para `Container`, `Section`, `Tabs` y `Accordion` mediante `field.type = "slot"`.
- `allow/disallow` permanece en el field del Slot y la política owner-neutral se traduce a permisos públicos Puck.
- Legacy `zones` se migra con `migrate(data, config)` oficial; `walkTree()` valida el árbol posterior.
- Migraciones incompletas fallan cerrado con diagnóstico ElectroCraft estable sin filtrar errores internos Puck.
- Playwright cubre round-trip browser/storage legacy -> canonical sin persistir `zones`.

## Cierre M05.4

- Head funcional validado: `a56575ab62660eb94d70ae08aaf0df6c5cd6a010`.
- PR `#56`; squash merge a `main`: `98b51b7ad35b3204f0b67899b4fd2392d1c100e7`.
- `ElectroCraft Base CI` run `33035570789` (#692): `success`.
- `packages/editor-puck/src/puck-action-sync.ts` consume `onAction(action, appState, prevAppState)` y persiste solo cambios reales en `Data.content/root/zones`.
- Studio reconstruye `ElectroCraftDocument` mediante el adapter canónico y reutiliza el autosave F04; no existe debounce paralelo.
- El editor visible usa `config/data/onAction` de la sesión canónica real y mantiene fail-closed visible ante errores de reconstrucción.
- Selección, DnD, `ui` e history Puck permanecen session-only; Project Revisions sigue siendo historial durable separado.

## Cierre M05.5

- Head funcional validado: `9d61c1e3f9976893594b518e952320e723b59f81`.
- PR `#57`; squash merge a `main`: `7aeaf701b077781f5b6ca0d659be2726dec7412b`.
- `ElectroCraft Base CI` run `33081006606` (#702): `success`.
- Topbar Deshacer/Rehacer delega en `history.back/forward/hasPast/hasFuture` público de Puck.
- La ventana visual se limita mediante `setHistories/setHistoryIndex` sin mantener un stack paralelo.
- `visualHistoryLimit` queda en preferencias locales del Studio con default `50` y rango `1–100`.
- Undo/redo continúa por el bridge M05.4 y autosave F04; `history/ui` no se serializa en el proyecto.

## Cierre M05.6

- Head funcional validado: `96145da4e74d856c1368f9a0418379acfcff0b2a`.
- PR `#58`; squash merge a `main`: `459d07d73f08fb8b2a826f54787124011f7c7ca8`.
- `ElectroCraft Base CI` run `33086731332` (#707): `success`.
- `Text` usa field Puck `text` con `contentEditable: true`; Heading/Párrafo heredan al resolver al mismo `componentRef`.
- `RichText` usa `richtext + contentEditable` y Puck/Tiptap permanece engine owner.
- El valor transportable sigue siendo string HTML canónico y no persiste selection/ui/history/Tiptap internals.
- El action bridge M05.4, autosave F04 e history M05.5 se reutilizan sin segundo pipeline.

## M05.7 en curso

Rama: `codex/m05-7-palette-outline-extensions`.

Implementación actual:
- `createPuckCategories()` proyecta `ComponentDefinition.category` al API público `Config.categories` consumido por `Puck.Components`.
- El componente diagnóstico recuperable queda en categoría oculta y con `insert: false`, evitando que aparezca como pieza insertable.
- `locked` mapea `edit/drag/delete/duplicate = false` mediante permisos públicos Puck; no se añade lock store paralelo.
- `StudioPalette` conserva búsqueda/categorías/favoritos/recientes alrededor de `Puck.Components` y expone un modo `puck-base` para probar que las extensiones Electro son opcionales.
- Favoritos/recientes siguen siendo preferencias workspace/user locales (`electrocraft.workspace.palette.v1`), nunca `ComponentDefinitions` ni parte de `ElectroCraftDocument`.
- `Puck.Outline` permanece directo, sin overrides/plugins experimentales; hidden/visibility no se inventa en el adapter mientras no exista owner canónico correspondiente.
- Unit/contract/Playwright cubren categorías, lock, diagnóstico no insertable, fallback Puck base, búsqueda/preferencias y ausencia de internals de Outline en canonical data.

Blockers funcionales P0/P1 conocidos: `0`.

## Próxima microfase exacta

Completar y validar `M05.7 — Extensiones de palette y outline solo necesarias`; solo después activar `M05.8 — Editor core E2E` según `.ai/microphases/M05_8.md`.
