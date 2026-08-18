import './theme.css';
import { packageDescriptor as dep0 } from '@electrocraft/domain';

export * from './appearance';
export * from './components/ui/badge';
export * from './components/ui/button';
export * from './components/ui/dropdown-menu';
export * from './components/ui/scroll-area';
export * from './components/ui/separator';
export * from './components/ui/sheet';
export * from './components/ui/skeleton';
export * from './components/ui/tooltip';
export * from './icons';
export * from './lib/utils';
export * from './theme-provider';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/design-system',
  responsibility: 'design system shadcn/Radix, tokens, icon registry y preferencias visuales del Studio',
  dependencies: [dep0.name] as const,
});

export type DesignSystemPackageDescriptor = typeof packageDescriptor;
