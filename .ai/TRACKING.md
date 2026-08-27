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
| F05 / M05.6        | ACTIVE             | `codex/m05-6-inline-richtext`                  |

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

## M05.6 en curso

Rama: `codex/m05-6-inline-richtext`.

Implementación actual:
- `packages/editor-puck/src/puck-component-adapter.ts` traduce `Text` a Puck `text + contentEditable` y `RichText` a `richtext + contentEditable`.
- `RichText` conserva string HTML como valor canónico; Tiptap/Puck permanece engine owner y no se añade un segundo formato richtext.
- `apps/studio/src/features/editor/puck-document-session.ts` activa la política inline en la única sesión Puck canónica.
- El Canvas aplica focus/outline sutil y `prefers-reduced-motion` sin crear direct-edit UI propia.
- Unit/contract/integration/Playwright cubren mapping, configuración inválida, round-trip, aislamiento de internals y persistencia browser/storage.
- No se añadió workflow dedicado; gate final previsto: `ElectroCraft Base CI`.

Blockers funcionales P0/P1 conocidos: `0`.

## Próxima microfase exacta

Completar y validar `M05.6 — Text/RichText inline editing`; solo después activar `M05.7 — Extensiones de palette y outline solo necesarias` según `.ai/microphases/M05_7.md`.
