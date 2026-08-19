import {
  ChevronDown,
  CircleAlert,
  CircleHelp,
  LoaderCircle,
  Menu,
  PanelRight,
  Palette,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';

export const studioIconRegistry = Object.freeze({
  'navigation.chevron-down': ChevronDown,
  'status.error': CircleAlert,
  'status.loading': LoaderCircle,
  'studio.help': CircleHelp,
  'studio.inspector': PanelRight,
  'studio.menu': Menu,
  'studio.settings': Settings,
  'studio.theme': Palette,
  'window.close': X,
} satisfies Record<string, LucideIcon>);

export type StudioIconId = keyof typeof studioIconRegistry;

export function getStudioIcon(iconId: StudioIconId): LucideIcon {
  return studioIconRegistry[iconId];
}
