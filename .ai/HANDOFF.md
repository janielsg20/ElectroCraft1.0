# HANDOFF — ElectroCraft

## Current
F02 / M02.9 — cierre técnico GREEN; Gate F02 — `ACTIVE` transition guard.

## Siguiente acción exacta
1. Mantener M02.9 como la única microfase `ACTIVE` hasta cerrar Gate F02 para respetar la convención documental de continuidad.
2. Ejecutar `.github/workflows/f02-canonical-model-gate.yml` sobre el árbol integrado de `main`.
3. Verificar exactamente 17 owner packages y ausencia de package paralelo `packages/contracts`.
4. Exigir evidencia de cierre M02.1–M02.9 y los docs `MODEL_OWNERSHIP.md` / `ENGINE_PAYLOAD_POLICY.md`.
5. Ejecutar las suites dedicadas `test:m02-1`…`test:m02-9` y después `npm run check` completo.
6. Confirmar ProjectDefinition/Document v3, JSON/checksum/migrations, ExportIR target-neutral, ownership 14/6/6 y wrappers OSS fail-closed sin runtime internals.
7. Generar marker/artifact del Gate F02 y publicar status `electrocraft/F02`.
8. Solo con Gate F02 `success`, marcar M02.9 `COMPLETADA`, F02 `COMPLETADA`, Gate F02 `GREEN` y crear evidencia de cierre de fase.
9. Activar F03 / M03.1 como única microfase `ACTIVE` y actualizar STATE/TRACKING/HANDOFF/CHANGELOG.
10. Para M03.1, leer su spec, consultar APIs oficiales actuales de shadcn/ui Radix, Radix, Tailwind y Lucide, y mantener `packages/design-system` como owner antes de crear AppShell UI.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F02.md`.

M02.1–M02.9 tienen validación técnica verde; no iniciar M03.1 antes de Gate F02 verde.
