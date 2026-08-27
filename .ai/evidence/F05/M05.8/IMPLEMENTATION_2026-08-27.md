# M05.8 — Editor core E2E

Implementación candidata:

- El runtime Studio abre el catálogo core canónico `Container`, `Text`, `Image`, `Button`.
- Palette inserta mediante dispatch público de Puck; Outline/Preview/Fields siguen siendo Composition pública.
- Nesting/reorder/edición reconstruyen `ElectroCraftDocument` y autosave F04 persiste solo datos canónicos.
- Undo/redo continúa usando history pública Puck de M05.5.
- No se serializan `history`, `ui` ni `zones`.
- Cobertura: unit, contract, integration y Playwright real insert/edit/history/save-reopen.

Gate final: `ElectroCraft Base CI`.
