# HANDOFF — ElectroCraft

## Current
F02 / M02.9 — Definir wrappers versionados para payloads de engines — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_9.md` y conservar exactamente 17 owner packages; contracts siguen en `packages/domain/src/contracts/`.
2. Definir en domain el wrapper JSON portable `{ engine, schemaVersion, value }` sin importar tipos de RQB, Tiptap, Rete o Puck.
3. Aplicar inicialmente el wrapper a React Query Builder rules y Tiptap richtext; el engine adapter valida/interpreta `value` y posee sus migraciones de formato.
4. Mantener Rete/Puck como definiciones Electro portables; no persistir NodeEditor, sockets, histories, AppState, React nodes, classes ni callbacks.
5. Crear Compatibility Analyzer application-facing que reporte `supported` o `blocked` para engine/schemaVersion desconocidos con diagnostics reparables.
6. Documentar allowlist/denylist en `.ai/ENGINE_PAYLOAD_POLICY.md`, incluyendo serializer/migration ownership.
7. Añadir fixtures round-trip y negative cases para engine/version/value inválidos; comprobar que domain solo ve JSON.
8. Conectar adapters reales de query-rqb/media-tiptap sin crear subsystem paralelo ni mover ownership.
9. Añadir gate M02.9, ejecutar suite dedicada, `npm run check`, gates M02.1–M02.8, Studio y export parity cuando corresponda.
10. Fusionar solo verde; volver a validar M02.9 en `main`, registrar artifact/digest y ejecutar el gate final de F02 antes de activar F03.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_9.md`.

M02.1–M02.8 están cerradas; no reabrirlas salvo regresión reproducible.
