# AGENTS.md — ElectroCraft

Entry point corto para sesiones de implementación. No duplica el Prompt Maestro.

## Lectura mínima por sesión
1. `.ai/README.md`
2. `.ai/RULES.md`
3. `.ai/MEMORY.md`
4. `.ai/STATE.md`
5. `.ai/TRACKING.md`
6. `.ai/HANDOFF.md`
7. la microfase `ACTIVE` indicada por `STATE.md`

Lee specs adicionales solo cuando la microfase activa las enlace. No cargues todos los `.md` por defecto.

## Primera sesión o cambio de arquitectura
Añade `.ai/PROMPT_MAESTRO_ELECTROCRAFT_2.md`, `.ai/MASTER_SPEC.md`, `.ai/REQUIREMENTS.md`, `.ai/ARCHITECTURE.md` y `.ai/DECISIONS.md`.

## Reglas operativas
- una sola microfase `ACTIVE`;
- engine-first y API pública antes de crear adapters;
- imports entre owners solo por exports públicos;
- UI de release en español y ayuda persistente cuando aplique;
- no datos demo permanentes, no modelo/runtime paralelo, no fake completion;
- todos los targets Core respetan el contrato común de exportación;
- `DONE` requiere tests, build y evidencia real.

El mapa documental y los read sets por área viven en `.ai/README.md`.
