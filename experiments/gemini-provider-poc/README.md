# M00.8 — POC Gemini provider

POC técnico aislado para probar la arquitectura AI de ElectroCraft. **No es UI de producto** y no crea rutas release.

## Regiones del harness
- **Request**: perfil lógico + instrucción sanitizada.
- **Resultado**: structured output / tool loop / stream / imagen como Draft.
- **Validación**: Zod, allowlist, gateway secret scan, límites y evidencia.

Textos del POC: `POC Gemini`, `Validar salida`, `Probar herramienta`, `Generar imagen`, `Simular gateway`.

## Ownership
- AI SDK + `@ai-sdk/google`: structured output, tool calling, streaming e imagen.
- Zod: validación portable.
- `@google/genai`: solo `GeminiNativeCapabilityAdapter.probeStableInteractions()` para probar Interactions estable `v1`; no duplica el stack principal.
- ElectroCraft: perfiles lógicos, allowlist, seguridad, Draft-only, validación y gateway.

## Seguridad
El cliente solo conoce `operation`, `profile` y `prompt`. La credencial existe únicamente en el gateway server-side. No hay Apply, DB/SQL, filesystem, install, deploy ni secret access como tools del modelo.

## Perfiles lógicos
Los IDs se resuelven en runtime y son metadata de sesión. El dato canónico persiste solo `Automático | Rápido | Calidad | Imagen`.

## Gates
`npm run verify-local` no requiere dependencias y valida el contrato fuente. El cierre real exige CI con lockfile reproducible y `GEMINI_API_KEY` configurada como GitHub Actions secret para ejecutar `npm run live`.

## Estados técnicos obligatorios
- `Inicial`: gateway/contexto listo, sin llamada.
- `Cargando`: generación/stream activo.
- `Vacío`: sin resultado todavía; CTA técnico según operación.
- `Error`: mensaje humano en español y detalle técnico solo en Debug.
- `Deshabilitado`: `Proveedor de IA no configurado` / `Sin conexión` cuando corresponda.
- `Guardando/Aplicando`: el POC no aplica al proyecto; cualquier salida se considera Draft.
- `Completado`: structured/tool/stream/image validado.
- `Incompleto`: finish por longitud/filtro/error se diferencia de completado.
- `Cancelado`: AbortSignal termina fail-closed.

No se comprimen paneles de producto ni se añaden elementos release; Request/Resultado/Validación es un harness técnico documental.
