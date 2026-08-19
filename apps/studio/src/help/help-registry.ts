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
    'ElectroCraft usa un único AppShell compartido para reservar navegación, Topbar, área de trabajo y Statusbar sobre la foundation shadcn/ui con base Radix.',
  details: Object.freeze([
    'El layout raíz usa 100dvh y mantiene el scroll dentro del área de trabajo; el body global no se usa como superficie desplazable del editor.',
    'Desktop reserva 240px para la navegación; laptop reserva 64px. Tablet y móvil trasladan la navegación estructural a un Sheet de Radix en lugar de comprimir el layout desktop.',
    'M03.2 define la geometría y los landmarks globales. La agrupación, iconos, estado activo y preferencias del Sidebar pertenecen a M03.3; la Topbar funcional y Settings pertenecen a M03.4.',
    'Claro, oscuro y sistema son preferencias del Studio; no forman parte del modelo canónico del proyecto.',
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  return studioHelpRegistry[helpId];
}
