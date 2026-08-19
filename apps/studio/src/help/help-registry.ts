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
    'Móvil elimina el rail lateral, conserva una Topbar compacta y añade navegación inferior Componentes, Pantallas, Lienzo, Propiedades y Más sin ocultar capacidades primarias.',
    'En móvil, Componentes y Propiedades usan Sheets inferiores; Más abre Capas/Outline en un Sheet de altura completa. Todos usan triggers Radix reales para restaurar el foco al cerrar.',
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
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  return studioHelpRegistry[helpId];
}
