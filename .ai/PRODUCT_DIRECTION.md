# PRODUCT DIRECTION — ElectroCraft Eighth Final

ElectroCraft is a **No-Code App Builder**.

It is not primarily:
- a PDF manager;
- a CMS;
- a WordPress builder;
- a Web-only builder;
- an internal-tool framework.

It builds one portable app model and can export that model to multiple first-class targets.

# Core mental model

```text
App
├── Pantallas
├── Navegación
├── Componentes
├── Fuentes de datos
├── Modelos y Registros
├── Consultas
├── Estado y variables
├── Acciones y workflows
├── Formularios
├── Usuarios y permisos
├── Administración
├── Medios
├── Temas y tokens
├── Reutilizables
├── Extensiones
└── Borradores generados con IA
```

# Export promise

Every release treats these export destinations as first-class:

1. Proyecto local
2. React Web
3. Sitio estático
4. PWA
5. Android
6. iOS
7. Capacitor
8. LAMP
9. WordPress

No `optional target` category.

A project may be incompatible with a target, but the target itself is never lower priority.
Compatibility must explain why.

# Target neutrality

Canonical project objects do not contain:
- React Router objects;
- Expo Router objects;
- Slim route objects;
- WordPress block/PHP objects;
- Capacitor plugin instances;
- Puck state;
- Refine state;
- Rete node classes.

All target frameworks are compiler/runtime details.

# Local-first

Core editing/project storage remains local-first.

Connected capabilities:
- Gemini;
- external Data Sources;
- deployment providers.

The app builder remains usable without them.

# User promise

A non-programmer must be able to:
1. create an app;
2. add screens;
3. define navigation;
4. compose UI;
5. connect data;
6. define state;
7. define actions/workflows;
8. build forms;
9. define auth/permissions;
10. build Administration;
11. generate/reuse assets with Gemini;
12. preview;
13. analyze every export target;
14. generate any compatible target;
15. understand every blocker/adaptation.
