# M00.11 — Architecture Closure POC

Este experimento no crea UI de producto. Valida las decisiones finales de F00 antes de F01.

## Qué prueba
- Owners y dependencias F00–F27; ninguna dependencia puede apuntar hacia adelante.
- F07 Navigation precede F08 Data Sources; F08 precede F09 Queries y F15 Administration.
- Screens, Navigation y Data Sources son Core; Internal Data es una Data Source.
- Nueve targets Core comparten un solo Export Target Contract.
- Engines seleccionados, alternativas rechazadas y duplicaciones eliminadas.
- `GeminiNativeCapabilityAdapter` queda permitido solo para `interactions-v1`; AI SDK + Google sigue siendo el stack principal.
- En CI se ejecutan APIs reales de Puck, PGlite/Drizzle, Rete, i18next, Zustand, Tiptap, TanStack Query/Table, Refine, AI SDK/Google y Scalar.

## Qué no prueba
No sustituye los POCs M00.3–M00.10. El workflow de M00.11 solo se dispara automáticamente cuando `M00.10 Export Target Parity POC` termina en success.

## Comandos
- `npm run check:offline`: sin registry; debe quedar GREEN localmente.
- `npm run check:ci`: exige dependencias instaladas y APIs OSS reales.
