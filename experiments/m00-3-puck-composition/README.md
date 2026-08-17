# M00.3 — POC Puck Composition

POC aislado para validar el ownership del editor visual antes de construir Studio. No es UI de release.

## Qué demuestra
- `Section` es un preset de Palette que crea `Container{semanticElement:"section"}`; no existe un tipo canónico paralelo `Section`.
- `ElectroCraftDocument` usa `children[]`; el adapter traduce ese árbol al `slot` `children` de Puck.
- Puck 0.22.4 aporta las mecánicas de `insert`, `reorder`, `replace` y history; las fuentes ejecutadas están vendorizadas y verificadas por Git blob SHA.
- `onAction` reconstruye un snapshot canónico desde el `newState.data` público y nunca persiste `ui`, indexes, zones de engine ni historial.
- El contrato composicional usa `Puck.Components`, `Puck.Outline`, `Puck.Preview` y `Puck.Fields`, sin `DropZone` nuevo.

## Ejecución
```bash
npm run lint
npm run typecheck
npm test
npm run integration
npm run build
npm run e2e
```

No requiere acceso al registro npm. El harness ejecuta código fuente exacto de Puck 0.22.4 fijado al tag/commit documentado en `vendor/puck-v0.22.4/PROVENANCE.json`.

## Límite del POC
Este entorno no puede instalar el paquete React completo desde npm, por lo que la composición React se valida por contrato TypeScript + fuentes oficiales fijadas; las mecánicas del engine y su historial sí se ejecutan realmente desde el código oficial. La instalación/render React completo pertenece al workspace de Studio cuando la red de paquetes esté disponible y no modifica el modelo canónico validado aquí.
