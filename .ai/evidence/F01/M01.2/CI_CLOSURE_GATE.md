# M01.2 CI closure gate

M01.2 solo puede cerrar después de que `M01.1 Monorepo Ownership Gate` termine `success`.

El workflow M01.2 debe:
1. instalar el toolchain root publicado;
2. verificar pins;
3. ejecutar TypeScript strict;
4. ejecutar architecture boundary verification y negative tests;
5. ejecutar build de reportes;
6. emitir `PASS_M01_2_TYPESCRIPT_BOUNDARIES`;
7. conservar logs/artifacts.

Un `skipped`, package install fallido o boundary warning no equivale a PASS.
