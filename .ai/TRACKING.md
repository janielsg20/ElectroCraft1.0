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
| F05 / M05.7        | COMPLETADA / GREEN | PR `#59`; Base CI `33089363788` (#709)         |
| F05 / M05.8        | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` (#742)         |
| F06 / M06.1        | COMPLETADA / GREEN | `.ai/evidence/F06/M06.1/CLOSURE_2026-08-27.md` |
| F06 / M06.2        | ACTIVE             | Responsive inheritance y reset                 |

## Cierres M05.1–M05.6

- M05.1: PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2: PR `#50`, Base CI `32990513971` (#661), squash `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- M05.3: PR `#52`, Base CI `33016557679` (#674), squash `fd5901dff66acca5d92ffee832a2ac881721458b`.
- M05.4: PR `#56`, Base CI `33035570789` (#692), squash `98b51b7ad35b3204f0b67899b4fd2392d1c100e7`.
- M05.5: PR `#57`, Base CI `33081006606` (#702), squash `7aeaf701b077781f5b6ca0d659be2726dec7412b`.
- M05.6: PR `#58`, Base CI `33086731332` (#707), squash `459d07d73f08fb8b2a826f54787124011f7c7ca8`.

## Cierre M05.7

- Head funcional validado: `f07d6ddcffbf98f1e53ad7d9ff1a19478c99bffc`.
- PR `#59`; squash merge a `main`: `f75dcb85ca73b05008c982958f442f6f6031fd40`.
- `ElectroCraft Base CI` run `33089363788` (#709): `success`.
- `ComponentDefinition.category` se proyecta a `Config.categories` público de Puck.
- `Puck.Components` sigue siendo la fuente draggable; discovery Electro es opcional y tiene fallback `puck-base`.
- `Puck.Outline` permanece directo, sin override/plugin experimental release-critical.
- Favoritos/recientes siguen como preferencias locales del workspace, fuera de `ElectroCraftDocument`.
- Lock se traduce a permisos públicos `edit/drag/delete/duplicate = false`; no existe lock store paralelo.
- Diagnostics recuperables permanecen ocultos/no insertables en la Palette.

## Cierre M05.8 / F05

- Head funcional validado: `b6b3aab`.
- PR `#60`; squash merge a `main`: `a81ca149c17391b9fe77aaaf57b125d229320173`.
- `ElectroCraft Base CI` run `33101434587` (#742): `success` en 13m 30s; 2 artifacts publicados.
- El check de despliegue Cloudflare falló fuera del gate canónico M05.8; Base CI fue el único release gate prescrito.

Implementación cerrada:
- `apps/studio/src/features/editor/puck-core-components.tsx` es el único kit core del Studio para `Container`, `Text`, `Image` y `Button`, con IDs deterministas, fields canónicos y renderers Puck.
- `loadStudioPuckEditor()` usa ese kit por defecto para proyectos reales; `useStudioPuckEditorRuntime()` delega al runtime sin mantener un segundo registry.
- `Container` usa el Slot público ya mapeado por M05.3; `Text` hereda `contentEditable` de M05.6.
- `puckEditorCommandControls` expone solo delegación session-only al dispatch público Puck; no copia `Data`, selection, DnD ni history.
- Canvas recibe presentación mínima de los cuatro componentes mediante `data-ec-core-component`, sin runtime alternativo.
- Integration cubre registry/config real, nesting, reorder, edits, fail-closed por renderer ausente y canonical round-trip sin `history/ui/zones`.
- Playwright cubre proyecto real, inserción desde Palette, nesting/move y reorder mediante dispatch Puck, selección desde `Puck.Outline`, edición desde `Puck.Fields`, Undo/Redo del Topbar, autosave F04 y reload/reopen.
- Contract test bloquea cualquier segundo editor/store y exige reutilizar Composition, command delegation, history y persistence existentes.
- F05 queda `COMPLETADA / GREEN` sin owner/editor/store paralelo.

Blockers funcionales P0/P1 conocidos: `0`.

## Cierre M06.1

- Rama local: `codex/m06-1-layout-style-inspector`.
- Modelo: `ElectroCraftDocument` v4 incorpora `layout/style` por nodo; import v3 migra recursivamente y los schemas estrictos rechazan payloads/CSS no canónicos.
- Engine/API: `api.selectedItem`, `getSelectorForId` y dispatch público `replace` de Puck; los props `__electrocraftLayout/__electrocraftStyle` son transporte del adapter y se eliminan del payload canónico.
- UI: `Inspector > Diseño > Avanzado` contiene Diseño/Estilo, presets Columna/Fila/Cuadrícula/Envolver, gap/alineación/columnas, tokens de relleno/fondo, opacidad, reset/herencia y `help.editor.advanced`.
- Canvas: los renderers core traducen semántica portable a estilos de preview sin convertir CSS en source of truth.
- Tests exactos nuevos: `layout-style-inspector.test.ts`, `layout-style-inspector-boundary.test.ts`, `layout-style-puck-roundtrip.test.ts` y `m06-1-layout-style-inspector.spec.ts`.
- Gate: lint/Prettier GREEN; typecheck GREEN; Node `41/41`; Vitest serial `415/415` en `116/116` archivos; build Studio/PWA GREEN; Playwright M06.1 `1/1` GREEN con insert/edit/history/autosave/reopen.
- Adaptación: el primer Vitest paralelo agotó timeouts de PGlite por contención local; los casos afectados y después la suite completa pasaron en aislamiento serial. `agent-browser` no logró iniciar tras su instalación local, por lo que la verificación observable se respaldó con Chromium/Playwright real.
- Blockers funcionales P0/P1 conocidos: `0`.

## M06.2 activo

Implementar `Responsive inheritance y reset`: presets/viewports públicos Puck, base + overrides canónicos, origen Base/Heredado/Anulado y reset por propiedad sin crear overrides al cambiar solo el viewport.
