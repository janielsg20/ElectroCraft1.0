import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/export-ir';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/testing',
  responsibility: 'fixtures y helpers de prueba compartidos',
  dependencies: [dep0.name, dep1.name] as const,
});

export type TestingPackageDescriptor = typeof packageDescriptor;
