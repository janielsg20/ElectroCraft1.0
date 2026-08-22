import './styles/globals.css';
import { packageDescriptor as dep0 } from '@electrocraft/domain';

export * from './components/ui';
export * from './design-system-gallery';
export * from './foundation';
export * from './icons';
export * from './lib/utils';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/design-system',
  responsibility: 'foundation visual, tokens, primitives Radix y adapters de temas multi-framework del Studio',
  dependencies: [dep0.name] as const,
  engine: Object.freeze({
    shadcnBase: 'radix',
    radixPackage: 'radix-ui',
    iconLibrary: 'lucide',
    themeFrameworks: ['aceternity-magic', 'daisyui', 'headlessui', 'ark-base', 'heroui'] as const,
  }),
});

export type DesignSystemPackageDescriptor = typeof packageDescriptor;
