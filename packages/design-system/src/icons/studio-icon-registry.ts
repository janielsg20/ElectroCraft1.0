import {
  BadgeCheck, Boxes, Braces, ChevronDown, CircleAlert, CircleHelp, Component as ComponentIcon, Database,
  Download, Eye, FileText, Globe2, HardDrive, Image, LayoutTemplate, LoaderCircle, Menu, Monitor, Palette,
  PanelLeftClose, PanelLeftOpen, PanelRight, Pencil, Plug, Puzzle, Redo2, Rocket, Route, Save, Search,
  Settings, ShieldCheck, SlidersHorizontal, Sparkles, Table2, Tags, Undo2, Users, Workflow, X, ZoomIn,
  type LucideIcon,
} from 'lucide-react';

export const studioIconRegistry = Object.freeze({
  'navigation.chevron-down': ChevronDown, 'status.error': CircleAlert, 'status.loading': LoaderCircle,
  'studio.help': CircleHelp, 'studio.inspector': PanelRight, 'studio.menu': Menu, 'studio.settings': Settings,
  'studio.theme': Palette, 'studio.sidebar.collapse': PanelLeftClose, 'studio.sidebar.expand': PanelLeftOpen,
  'studio.sidebar.editor': Pencil, 'studio.sidebar.screens': Monitor, 'studio.sidebar.components': Boxes,
  'studio.sidebar.templates': LayoutTemplate, 'studio.sidebar.aiGenerate': Sparkles, 'studio.sidebar.records': Database,
  'studio.sidebar.models': Table2, 'studio.sidebar.dataSources': Plug, 'studio.sidebar.queries': Search,
  'studio.sidebar.workflows': Workflow, 'studio.sidebar.state': Braces, 'studio.sidebar.forms': FileText,
  'studio.sidebar.navigation': Route, 'studio.sidebar.users': Users, 'studio.sidebar.admin': ShieldCheck,
  'studio.sidebar.media': Image, 'studio.sidebar.extensions': Puzzle, 'studio.sidebar.themes': Palette,
  'studio.sidebar.designSystem': ComponentIcon, 'studio.sidebar.tokens': Tags, 'studio.sidebar.preview': Eye,
  'studio.sidebar.compatibility': BadgeCheck, 'studio.sidebar.export': Download, 'studio.sidebar.deploy': Rocket,
  'studio.topbar.document': FileText, 'studio.topbar.platform': Globe2, 'studio.topbar.breakpoint': Monitor,
  'studio.topbar.undo': Undo2, 'studio.topbar.redo': Redo2, 'studio.topbar.zoom': ZoomIn,
  'studio.topbar.tools': SlidersHorizontal, 'studio.topbar.local': HardDrive, 'studio.topbar.preview': Eye,
  'studio.topbar.export': Download, 'studio.topbar.save': Save, 'window.close': X,
} satisfies Record<string, LucideIcon>);

export type StudioIconId = keyof typeof studioIconRegistry;
export function getStudioIcon(iconId: StudioIconId): LucideIcon { return studioIconRegistry[iconId]; }
