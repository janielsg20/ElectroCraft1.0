# M01.1 — F01 entry gate

M01.1 está implementada en el paquete acumulativo, pero su cierre formal queda deliberadamente bloqueado hasta que M00.11 se ejecute con éxito en GitHub Actions.

El workflow `.github/workflows/m01-1-monorepo.yml` usa `workflow_run` sobre `M00.11 Architecture Closure POC`. No existe una ruta manual que convierta el resultado local en cierre de F01.
