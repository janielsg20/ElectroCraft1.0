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
    'ElectroCraft usa un único AppShell compartido con Sidebar global agrupado, Topbar, área de trabajo y Statusbar sobre la foundation shadcn/ui con base Radix.',
  details: Object.freeze([
    'El layout raíz usa 100dvh y mantiene el scroll dentro del área de trabajo; el body global no se usa como superficie desplazable del editor.',
    'El Sidebar usa los grupos Construir, Datos, Lógica, App, Recursos, Apariencia y Publicar. Cada destino conserva icono Lucide, label accesible y aria-current cuando está activo.',
    'Desktop permite contraer 240px a 64px; en modo compacto los labels se sustituyen visualmente por iconos y Tooltip Radix. Laptop usa rail de 64px y tablet/móvil trasladan la navegación al Sheet existente.',
    'La preferencia de colapso se consume mediante WorkspacePreferencesPort. Durante F03 el adapter es in-memory; F04 puede sustituir solo el adapter por PGlite sin cambiar el contrato de UI.',
    'La Topbar funcional y Configuración pertenecen a M03.4. Claro, oscuro y sistema siguen siendo preferencias del Studio, no Project Objects.',
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  return studioHelpRegistry[helpId];
}
