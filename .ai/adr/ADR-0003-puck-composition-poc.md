# ADR-0003 — Puck Composition ownership y adapter canónico

Date: 2026-08-17  
Status: Accepted by F00 / M00.3

## Contexto
ElectroCraft necesita un editor visual de Pantallas sin convertir el formato interno de Puck en el formato persistente del proyecto. M00.3 debe probar que Puck puede conservar ownership de inserción, reorder, nesting, edición e historial mientras ElectroCraft conserva un `ElectroCraftDocument` portable.

## Decisión
1. Puck se fija para este POC a `@puckeditor/core@0.22.4`, tag `v0.22.4`, commit `92585c44f95cd1422b175cfbcdd72283fe2b4a52`, licencia MIT.
2. El shell Studio usa Composition: `Puck.Components`, `Puck.Outline`, `Puck.Preview` y `Puck.Fields` dentro de un único `<Puck>` y cablea `onAction`.
3. New nesting usa `Slot`. `Container.children[]` canónico se transforma a la prop `children` declarada `type: "slot"`; `DropZone` no se usa para nueva arquitectura.
4. `Section` es Palette preset, no tipo canónico: produce `Container` con `semanticElement="section"`.
5. Puck Data es una representación de edición. El snapshot persistente se reconstruye desde `newState.data` público recibido por `onAction`; `ui`, indexes, zones internas, selección, drag state e historial no se persisten.
6. Insert/reorder/replace/history se delegan al engine. ElectroCraft no implementa un segundo motor de edición ni un segundo historial.
7. El viewport de un shell Composition se controla por el layout/contenedor de Preview; no se introduce un canvas paralelo.

## Evidencia ejecutable
`experiments/m00-3-puck-composition/` contiene:
- fixture canónica Container/Text/Button;
- preset `Section`;
- adapter bidireccional Electro <-> Puck;
- handler `onAction` canónico;
- shell Composition TypeScript;
- código fuente Puck 0.22.4 vendorizado por Git blob SHA para `insert`, `reorder`, `replace`, `generateId` y `createHistorySlice`;
- 16 tests unit/contract/engine/history;
- integración insert -> Slot nesting -> reorder -> edit -> onAction -> snapshot Electro;
- build + E2E estructural del harness técnico Request/Resultado/Validación.

## Verificación de código upstream
La fixture no modifica las fuentes ejecutadas. `npm run lint` recalcula el Git blob SHA de cada archivo vendorizado y falla si difiere de los blobs oficiales declarados en `vendor/puck-v0.22.4/PROVENANCE.json`.

El código upstream de `Puck` 0.22.4 asigna explícitamente:
- `Puck.Components = Components`;
- `Puck.Fields = Fields`;
- `Puck.Outline = Outline`;
- `Puck.Preview = Preview`.

El reducer upstream llama `onAction(action, newPublicState, previousPublicState)` después de ejecutar la acción y registra historial para acciones mutantes salvo las excepciones internas documentadas.

## Limitación controlada del entorno
El contenedor de ejecución no puede resolver `registry.npmjs.org`, por lo que no puede instalar el bundle React publicado de Puck y toda su closure (React, Zustand, fields/UI, CSS y DnD). No se sustituyó esa closure por mocks para aparentar un mount exitoso.

M00.3 valida el contrato Composition mediante TypeScript contra la API fijada y ejecuta realmente las mecánicas/history desde código oficial exacto. El primer workspace Studio con acceso al gestor de paquetes debe volver a ejecutar un smoke mount del paquete publicado antes de considerar cerrada la instalación de producto. Esto es una verificación de packaging/runtime, no una nueva decisión de modelo ni un permiso para reconstruir Puck.

## Consecuencias
- `ElectroCraftDocument` no depende de Puck internals.
- Un cambio futuro de Puck afecta al adapter/shell, no al documento canónico.
- M00.4 puede continuar con Studio DB sin mezclar ownership de editor y storage.
- La fase de implementación del Studio debe fijar la versión real en lockfile y revalidar el mount React del paquete publicado.
