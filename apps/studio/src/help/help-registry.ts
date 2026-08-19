export interface HelpDescriptor {
  readonly id: `help.${string}`;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
}

export const studioShellHelpDescriptor = Object.freeze({
  id: 'help.studio.shell',
  title: 'Sistema visual del Studio',
  summary:
    'ElectroCraft usa una única foundation visual compartida por el Studio. Los primitives interactivos se apoyan en shadcn/ui con base Radix y los iconos semánticos usan Lucide.',
  details: Object.freeze([
    'La densidad High Density mantiene controles compactos sin reducir legibilidad, foco visible ni objetivos táctiles esenciales.',
    'Claro, oscuro y sistema son preferencias del Studio; no forman parte del modelo canónico del proyecto.',
    'AI Elements comparte esta misma foundation. Mezclar Radix con Base UI o Aria requiere una decisión arquitectónica explícita.',
  ]),
} satisfies HelpDescriptor);

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(helpId: StudioHelpId): HelpDescriptor {
  return studioHelpRegistry[helpId];
}
