# ADR — Documentation conventions and continuity ownership

## Status
Accepted in M01.6.

## Context
El repositorio acumuló evidencia útil, pero `MEMORY.md` y `HANDOFF.md` conservaron progreso antiguo mientras `STATE.md` avanzó. Review reports históricos también convivían cerca de fuentes canónicas.

## Decision
- `AGENTS.md` es entry point corto; `.ai/README.md` es mapa documental.
- `MEMORY.md` guarda solo invariantes/decisiones estables.
- `STATE.md` guarda estado actual compacto y exactamente una microfase `ACTIVE`.
- `TRACKING.md` guarda posición/gates y enlaza evidence; detalle viejo puede archivarse.
- `HANDOFF.md` guarda la siguiente acción exacta y debe apuntar a la microfase `ACTIVE`.
- `DECISIONS.md` resume ADR vigentes; detalle vive en `.ai/adr/`.
- review reports/previews históricos se preservan bajo `.ai/archive/` y no compiten como source of truth.
- `tooling/src/doc-conventions.mjs` valida required docs/templates, referencias Fxx/Mxx.y, MEMORY sin progreso y microfase única fail-closed.

## Engine/API boundary
Se reutilizan Node `fs`/`path` para filesystem y el test runner existente (Node test/Vitest). No se crea un engine documental paralelo ni UI nueva.

## Consequences
El contexto por sesión se reduce, las fuentes de continuidad tienen responsabilidad única y CI detecta drift documental antes de declarar DONE.
