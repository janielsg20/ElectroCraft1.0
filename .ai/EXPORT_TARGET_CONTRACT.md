# EXPORT TARGET CONTRACT — ElectroCraft Eighth Final

## Regla de producto

ElectroCraft tiene **nueve destinos de exportación Core de primera clase**.

No existe la categoría `optional target`.

Target IDs canónicos:

1. `local-project`
2. `react-web`
3. `static-web`
4. `pwa`
5. `android-expo`
6. `ios-expo`
7. `capacitor`
8. `lamp`
9. `wordpress`

Todos aparecen en:
- `Publicar > Compatibilidad`;
- `Publicar > Exportar`;
- Target Registry;
- Capability Analyzer;
- Export acceptance;
- fixture final;
- matriz de paridad;
- documentación de release.

La arquitectura puede agrupar targets por familia para evitar duplicación de código, pero **el producto, la UI y el QA no degradan ninguno a secundario**.

---

# 1. TargetRegistry

Cada target registra `ExportTargetDescriptor`:

- `id`
- `labelEs`
- `iconId`
- `family`
- `descriptionEs`
- `configSchema`
- `capabilityProfile`
- `compilerId`
- `runtimeProfile`
- `artifactKinds`
- `verificationProfile`
- `toolchainRequirements`
- `securityProfile`
- `helpId`

`family` sirve únicamente para compartir implementación:

- package
- web
- native
- hybrid
- server
- wordpress

No afecta prioridad.

---

# 2. Pipeline obligatorio para todos

Cada exportación pasa exactamente por:

1. congelar `ElectroCraftExportIR`;
2. validar schema/version;
3. resolver TargetDescriptor;
4. ejecutar Capability Analyzer;
5. impedir generación si hay blockers;
6. resolver configuración;
7. generar RuntimeDependencyManifest;
8. compilar rutas;
9. compilar componentes/layout/style;
10. compilar Data Sources/Queries;
11. compilar State;
12. compilar Actions/Workflows;
13. compilar Forms;
14. compilar Auth/Permissions;
15. compilar Administration cuando aplique;
16. localizar assets;
17. generar source/package;
18. ejecutar toolchain/installer validation;
19. comprobar artifacts reales;
20. producir ExportReport;
21. registrar evidence.

Ningún exporter puede saltarse la Capability scan.

---

# 3. Contrato de paridad

`equal target` no significa que todos los targets tengan la misma tecnología.

Significa:

- mismo estado en producto;
- misma visibilidad;
- mismo contract;
- misma política de blockers;
- misma exigencia de evidencia;
- misma obligación de documentar adaptaciones;
- misma obligación de seguridad;
- misma obligación de fixture.

Ejemplo:
un `Iframe` puede ser:
- Web: compatible;
- Android/iOS: adaptado o bloqueado;
- LAMP: compatible;
- WordPress: compatible/adaptado.

La diferencia se expresa como capability diagnostic.
No se elimina silenciosamente el componente.

---

# 4. Export Center

Ruta:
`Publicar > Exportar`.

Desktop:
- izquierda 240–260: destinos;
- centro flex: configuración;
- derecha 320: compatibilidad/resultado.

Destinos visibles, sin sección "Opcionales":

- Proyecto local
- React Web
- Sitio estático
- PWA
- Android
- iOS
- Capacitor
- LAMP
- WordPress

Se pueden agrupar visualmente:

### Paquete
Proyecto local

### Web
React Web
Sitio estático
PWA

### Móvil
Android
iOS
Capacitor

### Servidor / CMS
LAMP
WordPress

Los grupos son organización visual, no prioridad.

---

# 5. Estados iguales

Cada target muestra:

- No analizado
- Analizando…
- Compatible
- Compatible con adaptaciones
- Advertencias
- Bloqueado
- Generando…
- Verificando…
- Listo
- Error

Cada target tiene:
`Analizar`, `Configurar`, `Generar`, `Ver informe`.

---

# 6. Artifact evidence

No mostrar `Listo` solo porque el generator terminó.

Se requiere evidencia según target:

## Local
ZIP existe + checksum + reimport test.

## React
source dir/ZIP + install + typecheck + build.

## Static
generated files + local serve/smoke.

## PWA
build + manifest/service worker + offline fixture.

## Android
source + prebuild; APK/AAB solo si realmente producidos.

## iOS
source/Xcode/prebuild; IPA solo si realmente producido.

## Capacitor
web build + Capacitor config + native platform sync/build fixture.

## LAMP
package + Composer install + migrations + HTTP/security E2E.

## WordPress
Theme ZIP + Companion Plugin ZIP + wp-env activation/migration/E2E.

---

# 7. No-autonomy rule

Ninguna nueva opción de exportación puede añadirse como checkbox aislado.

Debe implementar:
TargetDescriptor -> capabilities -> compiler -> config -> artifact -> verification -> parity fixture.
