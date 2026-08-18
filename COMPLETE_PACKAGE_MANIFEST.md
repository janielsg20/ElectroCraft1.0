# ElectroCraft1.0 — paquete acumulativo completo de actualización

Base de aplicación: `janielsg20/ElectroCraft1.0@54a6ed1863c129ecef2d840c08469469b3ec835e`.

Alcance incluido:
- M00.9 — Data Sources REST/OpenAPI + GraphQL + Gateway/SecretRef.
- M00.10 — Export parity Capacitor/LAMP/WordPress.
- M00.11 — Architecture closure F00.
- M01.1 — Monorepo y packages propietarios.
- M01.2 — TypeScript strict y boundaries.
- M01.3 — ESLint/Prettier, Vitest projects, Playwright, Vite build, scripts root y empty-repo toolchain fixture.

Este paquete contiene **todos los archivos nuevos/modificados generados por estas microfases**, incluidos source, tests, workflows, ADRs, evidence, fixtures y artifacts generados que ya formaban parte del paquete acumulativo. Los archivos base del repositorio que no cambiaron no se duplican.

Conteo antes de `FILES.sha256`: 290 archivos.

## M01.3 añadido
- ESLint 10 flat config para JS/tooling sin reglas de formato duplicadas.
- Prettier como único owner de formato.
- Vitest separado en unit/contract/integration.
- Playwright Test QA/E2E config.
- Vite production library build explícito.
- scripts root `lint`, `typecheck`, `test`, `test:e2e`, `build`, `check`.
- fixture funcional de repo vacío que prueba el toolchain completo en CI.
- workflow `M01.3 Quality Toolchain Gate`.
- ADR/evidencia M01.3 y regresión acumulativa.

Ver `APPLY.md` para la secuencia de aplicación y gates.
