export const appearanceMessagesEs = Object.freeze({
  title: 'Apariencia',
  description: 'Personaliza solo la sesión del editor. No modifica el documento ni el tema exportado.',
  trigger: 'Apariencia',
  profileName: 'Nombre del perfil',
  tone: 'Tono',
  accent: 'Acento',
  density: 'Densidad de interfaz',
  canvasDensity: 'Densidad del lienzo',
  previewHint: 'Los cambios se previsualizan antes de aplicarlos.',
  apply: 'Aplicar',
  revert: 'Revertir',
  reset: 'Restablecer',
  close: 'Cerrar apariencia',
  system: 'Sistema',
  light: 'Claro',
  dark: 'Oscuro',
  indigo: 'Índigo',
  blue: 'Azul',
  emerald: 'Esmeralda',
  amber: 'Ámbar',
  rose: 'Rosa',
  high: 'Alta',
  comfortable: 'Cómoda',
  compact: 'Compacta',
  spacious: 'Amplia',
} as const);

export type AppearanceMessageKey = keyof typeof appearanceMessagesEs;

export function appearanceT<Key extends AppearanceMessageKey>(key: Key): (typeof appearanceMessagesEs)[Key] {
  return appearanceMessagesEs[key];
}
