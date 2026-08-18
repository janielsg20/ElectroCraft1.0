# M00.8 — POC Gemini para generación de código

POC técnico aislado para probar la arquitectura AI de ElectroCraft. **No es UI de producto** y no crea rutas release.

## Objetivo
La API de Gemini se usa para generar **componentes, plugins y secciones** como código Draft estructurado y validable. La generación de imágenes no forma parte de esta microfase.

## Regiones del harness
- **Request**: perfil lógico + instrucción sanitizada + tipo `component | plugin | section`.
- **Resultado**: plan estructurado / artifact de código multiarchivo / tool loop / stream.
- **Validación**: Zod, rutas relativas, allowlist, secret scan, límites y evidencia.

## Ownership
- AI SDK + `@ai-sdk/google`: structured output, generación de artifacts de código, tool calling y streaming.
- Zod: contratos portables de plan y código.
- `@google/genai`: solo `GeminiNativeCapabilityAdapter.probeStableInteractions()` para probar Interactions `v1`; no duplica el stack principal.
- ElectroCraft: perfiles lógicos, allowlist, seguridad, Draft-only, validación y gateway.

## Seguridad
El cliente solo conoce `operation`, `profile` y `prompt`. La credencial existe únicamente en el gateway server-side. El modelo puede proponer código pero no tiene herramientas para Apply, DB/SQL, ejecución arbitraria, filesystem, instalación, deploy ni secrets.

## Perfiles lógicos
Los IDs se resuelven en runtime y son metadata de sesión. El dato canónico persiste solo `Automático | Rápido | Calidad | Código`.

## Gates
`npm run verify-local` valida el contrato fuente. El cierre real exige CI reproducible y `GEMINI_API_KEY` para ejecutar generación de código real, tools, streaming/cancelación e Interactions.

## Criterio de éxito live
- plan estructurado válido para un artifact de código;
- `CodeArtifactPoc` real con uno o más archivos y `entryFile` válido;
- rutas relativas, sin traversal y sin referencias a credenciales;
- tool loop limitado;
- streaming de código;
- cancelación fail-closed;
- Interactions `v1` responde con código;
- evidencia guarda metadata/hash, nunca la API key.
