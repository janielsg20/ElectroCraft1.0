# STATE — ElectroCraft Eighth Final

## Estado actual
- Fase activa: F00 — Reconocimiento, verificación y arquitectura.
- Microfase activa: M00.8 — POC AI SDK + Gemini.
- Última microfase cerrada: M00.7 — POC Native runtime.
- Estado: `IN_PROGRESS`.
- Bloqueo de producto: ninguno.
- Gate de cierre M00.8: paquetes publicados + lockfile + CI estático + ejecución Gemini real con secret server-side.

## M00.7 — cierre GREEN
- Expo Router Stack + Tabs JS, Expo SQLite + Drizzle, renderer Native canónico, Zustand persisted state y Refine Core headless quedaron probados en Android real emulado con KVM.
- Fix final: `skipHydration: true` en Zustand y `rehydrate()` ordenado después de `ensureNativeSchema()` elimina la carrera de creación del directorio SQLite.
- Final run: `32078336103`, head `c6e05a475fa0df7fd7ba2a8138e1392bcf6df797`, SUCCESS.
- Jobs: lockfile `95536121263`; source/build `95536145137`; Android runtime `95536362004`; report status `95539234874`.
- Tests: 13/13 PASS; typecheck PASS; lockfile v3 PASS; config pruning PASS; Android/iOS target exports PASS; x86_64 Android release APK PASS.
- Runtime visible: `M00.7 runtime OK`; SQLite/Drizzle/DataProvider/Zustand persistence PASS; `electrocraft://guarded` redirige a `Inicio de sesión requerido`.
- Artifacts: Android `9304563117` digest `sha256:ef6bcc5fe1eb7750a3731a89b5daa0c7af7c1fbe7c550cb81bb277041141f3d8`; source/build `9304237635` digest `sha256:c7be19042662e0845bd650af2da8e157bd8a0493d2d51981836fd7c913c46f63`.
- Lockfile SHA-256: `1eeb7b543cbc3876c5467fedfa21bd6d8f84466b5dbff9dd71ec340337c17882`.

## M00.8 — implementación preparada
- POC aislado: `experiments/gemini-provider-poc/`.
- Baseline candidato exacto: `ai@7.0.48`, `@ai-sdk/google@4.0.31`, `@google/genai@2.15.0`, `zod@4.4.3`, `typescript@6.0.3`.
- AI SDK + Google provider = stack principal; `@google/genai` solo prueba Interactions estable `v1`.
- Perfiles canónicos: `Automático | Rápido | Calidad | Imagen`; IDs de modelos solo metadata runtime/session.
- Gate local sin registry: `PASS_LOCAL_CONTRACT_GATE`; scripts Node syntax PASS.
- No marcar M00.8 DONE hasta que CI publicado y Gemini live queden GREEN.

## Próximo paso exacto
Subir/copiar el paquete M00.8 sobre el checkout. GitHub Actions generará y versionará el lockfile si falta; después ejecutará npm ci, typecheck/tests/build/security y el gate Gemini real. Si `GEMINI_API_KEY` no existe como Actions secret, el gate debe bloquear explícitamente y M00.8 permanece abierta.
