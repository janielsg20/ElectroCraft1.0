export interface HelpDescriptor {
  readonly id: `help.${string}`;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

export const studioShellHelpDescriptor = Object.freeze({
  id: 'help.studio.shell',
  title: 'AppShell y navegación del Studio',
  summary:
    'ElectroCraft usa un único AppShell con Sidebar global agrupado sobre la foundation shadcn/ui con base Radix y Lucide.',
  details: Object.freeze([
    'El layout raíz usa 100dvh y mantiene el scroll dentro del área de trabajo; el body global no se usa como superficie desplazable del editor.',
    'El Sidebar usa exactamente los grupos Construir, Datos, Lógica, App, Recursos, Apariencia y Publicar. Taxonomías y Relaciones no vuelven a aparecer como entradas top-level.',
    'Desktop puede alternar 240px y 64px mediante WorkspacePreferencesPort. Laptop conserva un rail de 64px; tablet y móvil trasladan la navegación a un Sheet de Radix.',
    'El item activo expone aria-current y cada entrada conserva icono Lucide, label y acceso por teclado. Los tooltips ayudan cuando el rail es compacto, pero no sustituyen esta ayuda persistente.',
    'Durante F03 las preferencias usan un adapter in-memory explícito. F04 sustituirá únicamente ese adapter por persistencia PGlite sin cambiar el contrato de UI.',
    'La Topbar funcional y Settings Gear pertenecen a M03.4; M03.3 no crea una implementación paralela de esas capacidades.',
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
