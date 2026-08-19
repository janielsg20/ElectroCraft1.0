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
    'Desktop permite contraer 240px a 64px; laptop usa rail de 64px y tablet/móvil trasladan la navegación estructural a Sheet Radix.',
    'La preferencia de colapso se consume mediante WorkspacePreferencesPort. Durante F03 el adapter es in-memory; F04 puede sustituir solo el adapter por PGlite sin cambiar el contrato de UI.',
    'La Topbar de 52px separa breadcrumb/proyecto/guardado, herramientas contextuales y acciones de publicación. En tablet y móvil las herramientas secundarias se trasladan a Sheet.',
    'Ayuda abre este descriptor persistente y Configuración abre un Sheet real. El gear es la última acción del extremo derecho y el cierre de Radix restaura el foco al trigger.',
    'Configuración > Espacio de trabajo controla el mismo WorkspacePreferencesPort del Sidebar; no crea una segunda fuente de verdad ni persiste Project Objects.',
    'El editor M03.5 divide el workspace en Contexto 288px redimensionable 240–380px, Lienzo flexible e Inspector 320px redimensionable 280–440px. El Statusbar existente permanece en 26px y solo informa estado.',
    'Puck conserva el ownership de composición visual: Contexto usa sus superficies de componentes/esquema, el Lienzo usa Puck.Preview y el Inspector usa Puck.Fields. La microfase no crea un editor paralelo ni datos demo.',
    'En portátil se reduce primero el Inspector a una superficie secundaria; en tablet y móvil Contexto e Inspector pasan a Sheet y el Lienzo conserva la prioridad. Los separadores desktop admiten puntero y teclado.',
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  return studioHelpRegistry[helpId];
}
