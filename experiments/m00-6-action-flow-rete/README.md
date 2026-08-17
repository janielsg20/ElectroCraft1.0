# M00.6 — POC Action Flow Rete

POC aislado de F00 para probar el ownership de Rete sobre grafo, ControlFlow/Dataflow e historial.

## Contrato ElectroCraft

`ElectroCraftActionGraph` es JSON canónico portable. El fixture mínimo es:

`Trigger(record.created) -> Condition(priority == high) -> Data(set status=processed) -> Toast("Registro procesado")`

El adapter genera internamente puertos/conexiones Rete de control y datos. Ninguna instancia `NodeEditor`, `ClassicPreset`, `HistoryPlugin`, `ControlFlowEngine` o `DataflowEngine` entra al snapshot persistible.

## Motores fijados

- `rete@2.0.6`
- `rete-engine@2.1.1`
- `rete-history-plugin@2.2.0`
- `rete-area-plugin@2.3.2`
- override transitive: `@babel/runtime@7.29.7`

Las versiones instaladas se validan contra npm; los tags GitHub se usan únicamente como evidencia de API/fuente porque algunos tags upstream conservan en su `package.json` interno el número de la release previa.

El `vendor-source/` NO es runtime de producto. Es un transpile runtime-only de fuente oficial etiquetada para evidencia offline, acompañado de SHAs en `provenance.json`. El gate de cierre exige además ejecutar los paquetes npm publicados mediante `npm run integration` y `npm run history`.

## Comandos

- `npm run verify-local`: gates que no requieren acceso al registro.
- `npm run verify`: gate completo con paquetes reales instalados.

La microfase no debe marcarse `COMPLETADA` hasta que `npm run verify` sea GREEN en un entorno con acceso a npm (workflow incluido).
