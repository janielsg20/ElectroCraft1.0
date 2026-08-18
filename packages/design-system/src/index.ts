import { packageDescriptor as dep0 } from '@electrocraft/domain';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/design-system',
  responsibility: 'contratos de design system del Studio',
  dependencies: [dep0.name] as const,
});

export type DesignSystemPackageDescriptor = typeof packageDescriptor;
