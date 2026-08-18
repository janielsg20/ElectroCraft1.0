import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';
import { packageDescriptor as dep2 } from '@electrocraft/export-ir';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/exporters',
  responsibility: 'compilers/adapters de exportación',
  dependencies: [dep0.name, dep1.name, dep2.name] as const,
});

export type ExportersPackageDescriptor = typeof packageDescriptor;
