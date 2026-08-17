# USER FLOWS — ElectroCraft Eighth Final

# Crear App
Proyectos -> Nuevo -> En blanco/Plantilla/Kit -> nombre -> target preferences -> theme -> demo -> crear -> Editor.

# Crear Pantalla
Pantallas -> Nueva -> nombre/template/route/navigator -> abrir Editor -> components -> design -> data -> actions -> preview.

# Data Source
Datos -> Fuentes -> Nueva -> Internal/REST/GraphQL/connector -> config -> auth ref -> test -> schema -> save -> Query.

# Workflow
Lógica -> Acciones y workflows -> Nuevo -> trigger -> nodes -> validate -> test -> save.

# Gemini
Construir -> Generar con IA -> artifact -> prompt -> Contexto -> Ver lo que se enviará -> Generate -> Plan/Tools -> Draft -> Preview -> Changes -> Validate -> Apply -> Project Revision.

# Export — common
1. Publicar > Compatibilidad.
2. Seleccionar target.
3. Analizar.
4. Resolver blockers.
5. Publicar > Exportar.
6. Seleccionar el mismo target.
7. Configurar.
8. Generar.
9. Verificar.
10. Abrir/descargar artifact e informe.

# Targets

## Proyecto local
Generate ZIP -> checksum -> reimport verification.

## React Web
Generate source -> install -> typecheck -> build.

## Static
Analyze mutable features -> generate compatible static output -> local serve smoke.

## PWA
Generate Web/PWA -> verify manifest/service worker/offline.

## Android
Expo source -> prebuild -> actual build when environment allows.

## iOS
Expo source -> Xcode/prebuild -> actual build when environment allows.

## Capacitor
Web profile -> Capacitor project -> plugins/permissions -> sync -> build verification.

## LAMP
Config PHP/DB -> generate Slim project -> Composer -> migrate -> HTTP/security tests -> ZIP.

## WordPress
Config theme/plugin -> generate two ZIPs -> clean WordPress install -> activate/migrate -> E2E.

No target is hidden under `Opcional`.
