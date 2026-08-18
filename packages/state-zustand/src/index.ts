import { packageDescriptor as dep0 } from '@electrocraft/domain';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/state-zustand',
  responsibility: 'adapter de estado runtime Zustand',
  dependencies: [dep0.name] as const,
});

export type StateZustandPackageDescriptor = typeof packageDescriptor;
