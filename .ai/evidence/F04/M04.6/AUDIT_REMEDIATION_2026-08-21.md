# Audit remediation — 2026-08-21

Estado: `LOCAL_FIXED / REMOTE_GATE_PENDING`. M04.6 permanece `ACTIVE`.

## Hallazgos corregidos

- npm 10.9.2 resuelve un único grafo Tiptap 3.29.2 para Puck y `media-tiptap`.
- `record_terms` y `record_field_index` tienen FK a `projects` con `ON DELETE CASCADE`; migration v4 limpia huérfanos antes de añadir constraints.
- Duplicar crea IDs nuevos, remapea referencias JSON internas (incluidas keys) y recalcula checksums.
- Restore hace flush de autosave y crea `pre-restore-safety` en la misma transacción antes de reemplazar objetos.
- Project Home vive en `/`; Editor vive en `/editor` y se carga con `React.lazy`.
- Wizard, restore y eliminación usan Dialog/AlertDialog Radix con foco, Escape y confirmación destructiva.
- Acciones de proyecto exponen pending/error; repair no deja estado `loading` tras fallo.
- Migration journal se crea antes de consultarlo y health valida las cuatro migrations.
- `.gitattributes` fija LF y Vitest integration dispone de 60 segundos en Windows.

## Evidencia local

- `npx npm@10.9.2 ci --ignore-scripts --no-audit --no-fund`: PASS.
- `npx npm@10.9.2 ls @tiptap/core @tiptap/react --all`: PASS, Tiptap 3.29.2 único.
- `npm run build`: PASS; Editor separado en chunk lazy (~461 kB) y main reducido respecto al audit.
- `npm run typecheck`: PASS.
- Vitest focalizado storage/migrations/actions: 16/16 PASS.
- Full Vitest final: 86 archivos, 308/308 PASS.
- Browser manual Edge: `/` con Project Home; foco dentro del wizard; Escape cierra; `/editor` renderiza canvas.
- Playwright M04.4/M04.5 con Edge del sistema y un worker: 4/4 PASS.
- Matriz E2E completa serial: 79/81 PASS con timeout histórico de 30 s; los dos timeouts (`appearance` y handoff multi-tab) pasan aislados 2/2 con 120 s. El timeout portable queda en 60 s (duraciones reales: 27.2 s y 37.1 s).

## Pendiente

- Ejecutar CI remoto en la rama/PR final con navegador administrado.
- Implementar Import/Backup de M04.6; esta remediación no finge completion de esa capacidad.
