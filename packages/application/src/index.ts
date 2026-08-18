import { packageDescriptor as dep0 } from '@electrocraft/domain';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/application',
  responsibility: 'casos de uso y ports de aplicación',
  dependencies: [dep0.name] as const,
});

export type ApplicationPackageDescriptor = typeof packageDescriptor;
