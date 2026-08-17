# M00.6 — POC Action Flow Rete

POC aislado de F00 para probar el ownership de Rete sobre grafo, ControlFlow/Dataflow e historial.

## Contrato ElectroCraft

`ElectroCraftActionGraph` es JSON canónico portable. El fixture mínimo es:

`Trigger(record.created) -> Condition(priority == high) -> Data(set status=processed) -> Toast("Registro procesado")`

El adapter genera internamente puertos/conexiones Rete de control y datos. Ninguna instancia `NodeEditor`, `ClassicPreset`, `HistoryPlugin`, `ControlFlowEngine` o `DataflowEngine` entra al snapshot persistible.

## Motores fijados

- `rete@2.0.6`
- `rete-engine@2.1.1`
- `rete-history-plugin@2.1.1`
- `rete-area-plugin@2.3.2`
- override transitive: `@babel/runtime@7.29.7`

Las versiones instaladas se validan contra npm; los tags GitHub se usan únicamente como evidencia de API/fuente.

`rete-history-plugin@2.1.1` se fija deliberadamente para el runtime: el primer run publicado de M00.6 (`32068398640`) demostró que `2.2.0` intenta cargar `rete-comment-plugin` desde su bundle CommonJS aunque ese peer figura como opcional. La API de history usada por este POC permanece disponible en `2.1.1`.

El `vendor-source/` NO es runtime de producto. Es un transpile runtime-only de fuente oficial etiquetada para evidencia offline, acompañado de SHAs en `provenance.json`. El gate de cierre exige además ejecutar los paquetes npm publicados mediante `npm run integration` y `npm run history`.

## Comandos

- `npm run verify-local`: gates que no requieren acceso al registro.
- `npm run verify`: gate completo con paquetes reales instalados.

M00.6 está cerrada únicamente porque el gate real de paquetes publicados está GREEN en GitHub Actions y el lockfile final queda versionado.
