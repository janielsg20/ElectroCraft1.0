# HelpDescriptor — `help.architecture.poc`

- ID: `help.architecture.poc`
- Título: `POC técnico de arquitectura`
- Resumen: `Explica qué engine posee cada responsabilidad y qué parte normaliza ElectroCraft antes de iniciar la implementación de producto.`
- Contenido crítico:
  - Los POCs no son rutas del producto final.
  - Un engine OSS mantiene su responsabilidad nativa; ElectroCraft no la reconstruye.
  - Los datos canónicos nunca son internals del engine.
  - Un estado `blocked` significa que una precondición real todavía no pasó; no equivale a error oculto ni a aprobación parcial.
  - F01 solo puede comenzar con M00.11 GREEN.
