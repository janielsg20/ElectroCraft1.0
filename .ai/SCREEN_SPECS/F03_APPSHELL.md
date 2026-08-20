# SCREEN SPEC — F03 AppShell observado

Estado: M03.12 ACTIVE, 2026-08-20.

## Superficies verificadas

- AppShell: Sidebar, Topbar, workspace y Statusbar.
- Editor: Contexto, Lienzo, Inspector, responsive overlays y dock móvil.
- Settings: Configuración general, Idioma, Workspace, Apariencia y Progressive Disclosure.
- Help: HelpRegistry contextual, Help Drawer buscable, Popover desktop y Sheet móvil.
- Content: `/content` List/Detail.
- Empty routes reales: Consultas, Formularios, Administración, Medios y Exportar.
- Bootstrap routes canónicas restantes: Pantallas, Componentes, Plantillas, Generar con IA, Modelos, Fuentes de datos, Acciones y workflows, Estado y variables, Navegación, Usuarios y permisos, Extensiones, Temas, Tokens, Vista previa, Compatibilidad y Desplegar.

## Responsive observado

- > =1280: AppShell desktop completo.
- 1024–1279: laptop con rail 64px; secundarios se reducen antes del lienzo.
- 768–1023: tablet con rail 56px y herramientas secundarias en Sheet.
- <768: no se comprime el desktop; se usa navegación inferior y Sheets.

## Invariantes de release

- Español visible; IDs/rutas internos permanecen estables.
- `Ayuda` inmediatamente antes de `Configuración`; Settings al extremo derecho.
- Rutas desconocidas fallan cerradas.
- Empty states no inyectan demo data.
- Apariencia del Studio no modifica Theme/ExportIR del proyecto.
- No se reintroducen Taxonomías, Relaciones, Roles o Automatizaciones como destinos superiores.
