export interface HelpDescriptor {
  readonly id: `help.${string}`;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

export const studioShellHelpDescriptor = Object.freeze({
  id: 'help.studio.shell',
  title: 'AppShell del Studio',
  summary:
    'ElectroCraft usa un único AppShell compartido con Sidebar global, Topbar contextual, editor Puck estructurado y Statusbar sobre la foundation shadcn/ui con base Radix.',
  details: Object.freeze([
    'El layout raíz usa 100dvh y mantiene el scroll dentro del área de trabajo; el body global no se usa como superficie desplazable del editor.',
    'El Sidebar usa los grupos Construir, Datos, Lógica, App, Recursos, Apariencia y Publicar. Cada destino conserva icono Lucide, label accesible y aria-current cuando está activo.',
    'Desktop permite contraer 240px a 64px. Laptop conserva rail de 64px; cuando el lienzo útil se estrecha, Contexto e Inspector usan un único overlay en vez de comprimir el Canvas.',
    'Tablet conserva un rail global de 56px con objetivos táctiles y mantiene la navegación completa disponible en un Sheet Radix. Las herramientas secundarias del editor también usan Sheets.',
    'Móvil elimina el rail lateral, conserva una Topbar compacta y añade navegación inferior Componentes, Pantallas, Lienzo, Propiedades, Apariencia y Más sin ocultar capacidades primarias.',
    'En móvil, Componentes, Propiedades y Apariencia usan Sheets inferiores; Más abre Capas/Outline en un Sheet de altura completa. Todos usan triggers Radix reales para restaurar el foco al cerrar.',
    'La preferencia de colapso se consume mediante WorkspacePreferencesPort. Durante F03 el adapter es in-memory; F04 puede sustituir solo el adapter por PGlite sin cambiar el contrato de UI.',
    'La Topbar de 52px separa breadcrumb/proyecto/guardado, herramientas contextuales y acciones de publicación. En tablet y móvil las herramientas secundarias se trasladan a Sheet.',
    'Ayuda abre este descriptor persistente y Configuración abre un Sheet real. El gear es la última acción del extremo derecho y el cierre de Radix restaura el foco al trigger.',
    'Configuración > Espacio de trabajo controla el mismo WorkspacePreferencesPort del Sidebar; no crea una segunda fuente de verdad ni persiste Project Objects.',
    'El editor divide el workspace desktop en Contexto 288px redimensionable 240–380px, Lienzo flexible e Inspector 320px redimensionable 280–440px. El Statusbar existente permanece en 26px y solo informa estado.',
    'Puck conserva el ownership de composición visual: Contexto usa sus superficies de componentes/esquema, el Lienzo usa Puck.Preview y el Inspector usa Puck.Fields. La adaptación responsive no crea un editor paralelo ni datos demo.',
    'Los separadores desktop admiten puntero y teclado; tablet y móvil priorizan objetivos táctiles, foco visible y superficies que no comprimen el lienzo.',
    'La arquitectura de información clasifica controles como primary, contextual, advanced o diagnostic. Los módulos principales permanecen en navegación y los detalles secundarios se anidan en su superficie propietaria.',
    'Progressive Disclosure usa Collapsible Radix: Settings mantiene Espacio de trabajo visible y agrupa detalles técnicos en Avanzado; el Inspector mantiene propiedades principales visibles y agrupa detalles secundarios en Avanzado.',
    'Los diagnósticos que explican error, bloqueo, guardado o estado local nunca se esconden dentro de Advanced; permanecen visibles cuando son relevantes para entender el estado del sistema.',
    'Contenido usa un patrón List/Detail dentro de su ruta canónica: la lista permanece primaria y el detalle aparece de forma contextual sin crear una segunda ruta innecesaria.',
    'Los empty states describen ausencia real de proyecto, contenido, selección o configuración y no inyectan tarjetas, registros, widgets ni resultados demo para aparentar funcionalidad.',
    'La Palette usa PALETTE_CATALOG_MATRIX.md como catálogo funcional visible y no deriva su inventario directamente de ComponentDefinitions de Puck.',
    'La Palette organiza Layout, Basic, Content, Navigation, Dynamic Data, Forms, Filters, Social / Contact, Admin y Commerce Pack; el search reconoce nombre, función, categoría, keywords y referencias conceptuales como posts, menu, login, JetEngine, social y commerce.',
    'Favoritos y Recientes guardan solo paletteItemId como preferencias del workspace. No clonan ComponentDefinitions ni forman parte de ElectroCraftDocument o ExportIR.',
    'Puck.Components permanece como fuente de drag para componentes registrados. El click-to-insert pasa por el adapter Puck y solo se habilita cuando existe el mapping real; un item aún no mapeado muestra código, ubicación, causa y acción sugerida en vez de fingir éxito.',
    'La Palette es navegable por teclado: el buscador precede al catálogo, ArrowDown entra en los items y Escape devuelve el foco al lienzo. En móvil vive dentro del Sheet inferior de Componentes, no como una versión desktop comprimida.',
    'Apariencia del Studio usa un preference schema separado del documento y aplica únicamente tokens del Design System; no reutiliza ni modifica el theme del proyecto.',
  ]),
} satisfies HelpDescriptor);

export const studioAppearanceHelpDescriptor = Object.freeze({
  id: 'help.studio.appearance',
  title: 'Apariencia del Studio',
  summary:
    'Configura la presentación del propio editor de ElectroCraft sin modificar ElectroCraftDocument, el tema del frontend, el tema de Administración ni ExportIR.',
  details: Object.freeze([
    'Modo, colores, tipografía, iconos, forma, densidad y movimiento se previsualizan mediante tokens del Studio antes de Aplicar.',
    'Aplicar persiste el perfil de la sesión; Revertir descarta la vista previa. Si intentas cerrar con cambios pendientes, ElectroCraft pide aplicar, descartar o seguir editando.',
    'Los presets integrados y personales guardan solo preferencias de apariencia del Studio. Nunca se serializan dentro del proyecto ni de ExportIR.',
    'prefers-reduced-motion del sistema limita la animación solicitada por el perfil. El usuario no puede forzar movimiento alto por encima de esa preferencia del sistema.',
    'Las combinaciones de contraste o legibilidad marcadas como no accesibles muestran una advertencia visible y permiten Restaurar valores accesibles.',
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
  [studioAppearanceHelpDescriptor.id]: studioAppearanceHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  return studioHelpRegistry[helpId];
}
