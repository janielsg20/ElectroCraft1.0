export const appearanceMessagesEs = Object.freeze({
  title: 'Apariencia del Studio',
  description: 'Un solo tema ElectroCraft, construido con shadcn/ui y Radix. Elige únicamente el modo de color.',
  trigger: 'Apariencia',
  modeGroup: 'Modo de color',
  modeDescription: 'La estructura, densidad y componentes permanecen iguales en ambos modos.',
  light: 'Claro',
  dark: 'Oscuro',
  lightDescription: 'Superficies claras, contraste limpio y el mismo acento del sistema.',
  darkDescription: 'Superficies oscuras, contraste equivalente y el mismo lenguaje visual.',
  close: 'Cerrar apariencia',
  helpTitle: 'Tema del Studio',
  helpBody:
    'Esta preferencia solo cambia la interfaz de ElectroCraft. No modifica los temas, documentos ni aplicaciones que construyas o exportes.',
} as const);

export type AppearanceMessageKey = keyof typeof appearanceMessagesEs;

export function appearanceT<Key extends AppearanceMessageKey>(key: Key): (typeof appearanceMessagesEs)[Key] {
  return appearanceMessagesEs[key];
}
