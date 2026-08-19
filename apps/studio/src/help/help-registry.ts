export interface HelpDescriptor {
  readonly id: `help.${string}`;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

export const studioShellHelpDescriptor = Object.freeze({
  id: 'help.studio.shell',
  title: 'AppShell del Studio',
  summary: 'ElectroCraft usa un único AppShell compartido con Sidebar global, Topbar, área de trabajo y Statusbar sobre la foundation shadcn/ui con base Radix.',
  details: Object.freeze([
    'El layout raíz usa 100dvh y mantiene el scroll dentro del área de trabajo; el body global no se usa como superficie desplazable del editor.',
    'El Sidebar usa los grupos Construir, Datos, Lógica, App, Recursos, Apariencia y Publicar. Cada destino conserva icono Lucide, label accesible y aria-current cuando está activo.',
    'Desktop permite contraer 240px a 64px; laptop usa rail de 64px y tablet/móvil trasladan la navegación al Sheet existente.',
    'La Topbar mide 52px. Izquierda muestra proyecto, breadcrumb y estado; el centro muestra contexto; a la derecha quedan Vista previa, Exportar, estado Local, Ayuda y Configuración.',
    'Configuración es siempre el último control del extremo derecho. Su Sheet Radix restaura foco al cerrar y permite alternar el Sidebar mediante WorkspacePreferencesPort.',
    'Ayuda abre este descriptor persistente en un Sheet; la información crítica no depende de Tooltip.',
    'Deshacer y Rehacer permanecen deshabilitados hasta que su owner funcional exista; M03.4 no simula historial.',
    'Durante F03 WorkspacePreferencesPort usa adapter in-memory; F04 puede sustituir solo el adapter por PGlite sin cambiar el contrato de UI.',
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({ [studioShellHelpDescriptor.id]: studioShellHelpDescriptor });
export type StudioHelpId = keyof typeof studioHelpRegistry;
export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor { return studioHelpRegistry[helpId]; }
