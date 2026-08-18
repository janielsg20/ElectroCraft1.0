export interface StudioHelpDescriptor {
  id: 'help.studio.shell';
  locale: 'es';
  title: string;
  summary: string;
  details: readonly string[];
}

export const studioShellHelpDescriptor: StudioHelpDescriptor = Object.freeze({
  id: 'help.studio.shell',
  locale: 'es',
  title: 'Ayuda del Studio',
  summary: 'El AppShell comparte una sola foundation shadcn/Radix, tokens ElectroCraft e iconografía Lucide.',
  details: Object.freeze([
    'Los primitives visuales pertenecen a @electrocraft/design-system y el Studio los compone sin duplicarlos.',
    'La densidad compacta es la base del editor; la opción cómoda aumenta targets y espacios sin cambiar la arquitectura.',
    'Claro, oscuro y sistema usan los mismos tokens semánticos y conservan focus-visible y contraste de estados.',
    'Las superficies flotantes usan primitives Radix accesibles; Escape, foco y navegación por teclado pertenecen al engine.',
    'AI Elements compartirá esta foundation Radix. Cambiar o mezclar Base UI/React Aria exige una decisión de arquitectura explícita.',
  ]),
});

export const studioHelpRegistry = Object.freeze({
  [studioShellHelpDescriptor.id]: studioShellHelpDescriptor,
});

export type StudioHelpId = keyof typeof studioHelpRegistry;

export function getStudioHelpDescriptor(id: StudioHelpId): StudioHelpDescriptor {
  return studioHelpRegistry[id];
}
